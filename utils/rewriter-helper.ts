import axios from "axios";
import { getCurrentFirebaseUser } from "firebase-utils/user";
import { toast } from "react-hot-toast";
import { BACKEND_URL, getBackendUrl, RED_PERPLEXITY_MAX, SECOND_BACKEND_URL, YELLOW_PERPLEXITY_MAX } from "./constants";
import { convertTextToHTML } from "./editor-content";
import { makePostRequest } from "./requests";

// promise to rewrite a sentence
const createRewriteTextPromise = (textToChange: String, url: string): Promise<Record<string, any>> => {
  const data = {
    text: textToChange,
  }

  const rewriteTextPromise : Promise<Record<string, any>> = new Promise(function(resolve, reject) {
    makePostRequest(url, data)
    .then((res) => {
      const rewrittenText = res.data;

      resolve({
        'textToChange': textToChange,
        'rewrittenText': rewrittenText,
      });
    }).catch((err) => {
      console.error('Error in rewrite sentence promise')
      console.log(err);
      reject(err);
    });
  });

  return rewriteTextPromise;
}

export const splitHTMLIntoParagraphs = (htmlText: String) => {
  let paragraphs = htmlText.split('</p>');

  // for each paragraph, remove the <p> tag
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    const newParagraph = paragraph.replace('<p>', '');
    paragraphs[i] = newParagraph;
  }

  return paragraphs;
}

export const getRewrittenParagraphReqId = (url: string, paragraph: String): Promise<Record<string, any>> => {
  const data = {
    query: paragraph,
  }

  const promise : Promise<Record<string, any>> = new Promise(function(resolve, reject) {
    makePostRequest(url, data)
    .then((res) => {
      const reqId = res.data;
      resolve({
        reqId,
        textToChange: paragraph,
      });
    }).catch((err) => {
      console.error('Error in rewrite sentence promise')
      console.log(err);
      reject(err);
    });
  });

  return promise;
}


export const getRewrittenParagraphResponse = (textToChange: String, reqId: string): Promise<Record<string, any>> => {
  const data = {
    reqId
  }

  const promise : Promise<Record<string, any>> = new Promise(function(resolve, reject) {
    makePostRequest(`${SECOND_BACKEND_URL}/ai/bypasser/get-bypass-paragraph-response`, data)
    .then((res) => {
      const response = res.data;

      // if not processed, don't return rewritten text
      if (!response.processed) {
        resolve({
          reqId,
          textToChange,
        });
        return;
      }

      // otherwise, return rewritten text
      resolve({
        reqId,
        textToChange,
        rewrittenText: response.response,
      });
    }).catch((err) => {
      console.error('Error in rewrite sentence promise')
      console.log(err);
      reject({
        reqId,
        textToChange,
      });
    });
  });

  return promise;
}

/**
 * Picks a random method to use to load-balance
 * @returns 
 */
const getBypasserUrl = () => {
  // flip a coin to decide which backend to use
  const coinFlip = Math.random() >= 0.5;
  if (coinFlip) {
    return `${SECOND_BACKEND_URL}/ai/bypasser/bypass-paragraph-2`
  } else {
    return `${SECOND_BACKEND_URL}/ai/bypasser/bypass-paragraph-2`
  }
}

// OpenAI method
export const rewriteAllSentencesMethod1ByParagraph = async (originalText: String) : Promise<String> => {
  // setUsedRewriterInDB();

  const url = getBypasserUrl();

  const htmlText = convertTextToHTML(originalText);
  let newHTML = htmlText;

  const paragraphs = splitHTMLIntoParagraphs(htmlText);

  const promises = [];

  // for each paragraph
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];

    // if paragraph is empty, skip
    if (paragraph === '') {
      continue;
    }

    promises.push(getRewrittenParagraphReqId(url, paragraph));
  }

  // wait for all promises to resolve
  const results: any = await Promise.all(promises);

  let textsToChangeWithReqId: Record<string, any>[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    // see if result is an error
    if (result instanceof Error) {
      // Log and skip this result
      console.error('Result promise error for rewrite');
      console.log(result);
      continue;
    } else {
      textsToChangeWithReqId.push(result);
    }
  }

  // { textToChange, rewrittenText, reqId }
  let resolvedTextsToChange: Record<string, any>[] = [];

  // wait 5 seconds before making the 1st request
  await new Promise(r => setTimeout(r, 5000));

  // try for up to 6 times
  let MAX_TRIES = 5;
  for (let i = 0; i < MAX_TRIES; i++) {
    const promises = [];

    for (let i = 0; i < textsToChangeWithReqId.length; i++) {
      const textToChangeWithReqId = textsToChangeWithReqId[i];
      const reqId = textToChangeWithReqId['reqId'];
      const textToChange = textToChangeWithReqId['textToChange'];

      promises.push(getRewrittenParagraphResponse(textToChange, reqId));
    }

    // wait for all promises to resolve
    const results: any = await Promise.all(promises);

    // reset textsToChangeWithReqId
    textsToChangeWithReqId = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      // see if result is an error
      if (result instanceof Error) {
        // Log and skip this result
        console.error('Result promise error for rewrite');
        console.log(result);
        continue;
      } // if reqId is not done, add it back to textsToChangeWithReqId
      else if (result['rewrittenText'] === undefined) {
        textsToChangeWithReqId.push(result);
      } else {
        resolvedTextsToChange.push(result);
      }
    }

    if (resolvedTextsToChange.length > 0) {
      toast.remove();
      toast.success(`Rewrote ${resolvedTextsToChange.length} / ${resolvedTextsToChange.length + textsToChangeWithReqId.length} paragraphs`);
    }

    console.log("Iteration: " + i);
    console.log(resolvedTextsToChange);
    console.log(textsToChangeWithReqId);

    // if all reqIds are done, stop interval
    if (textsToChangeWithReqId.length === 0) {
      // exit loop
      break;
    }

    // wait 7 seconds before trying again
    await new Promise(r => setTimeout(r, 7000));
  }

  // replace all textsToChange with rewrittenText
  for (let i = 0; i < resolvedTextsToChange.length; i++) {
    const textToChange = resolvedTextsToChange[i]['textToChange'];
    const rewrittenText = resolvedTextsToChange[i]['rewrittenText'];
    newHTML = newHTML.replace(textToChange, rewrittenText);
  }

  return newHTML;
}

// OpenAI method
export const rewriteAllSentencesMethod1 = async (originalText: String, pplPerSentence: Record<string, any>[]) : Promise<String> => {
  setUsedRewriterInDB();

  const data = {
    text: originalText,
  }
  
  try {
    const res = await makePostRequest(`${getBackendUrl()}/rewriter/rewrite-method1`, data)

    const rewrittenText = res.data;

    // Then convert to html
    const htmlText = convertTextToHTML(rewrittenText);

    return htmlText;
  } catch (err) {
    console.error('Error in rewriteAllSentencesMethod1')
    console.log(err);
    return '';
  }
}

// Rewriting tool method
export const rewriteAllSentencesMethod2 = async (originalText: String, pplPerSentence: Record<string, any>[]) => {
  setUsedRewriterInDB();
  
  // First convert to html
  const htmlText = convertTextToHTML(originalText);
  let newHTML = htmlText;

  // create an array of promises
  const promises = [];

  // Loop through key, val of pplPerSentence
  // Loop through key, val of pplPerSentence
  for (let i = 0; i < pplPerSentence.length; i++) {
    const sentence = pplPerSentence[i]['sentence'];
    const perplexity = pplPerSentence[i]['perplexity'];

    // rewrite all sentences below yellow perplexities
    if (perplexity <= YELLOW_PERPLEXITY_MAX) {
      const sentenceToChange = sentence;
      // add promise to array
      promises.push(createRewriteTextPromise(sentenceToChange, `${getBackendUrl()}/rewriter/rewrite-method2`));
    }
  }

  // wait for all promises to resolve
  const results: any = await Promise.all(promises);

  console.log(results);

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    // see if result is an error
    if (result instanceof Error) {
      // Log and skip this result
      console.error('Result promise error for rewrite');
      console.log(result);
      continue;
    }

    const sentenceToChange = results[i]['textToChange'];
    const rewrittenSentence = results[i]['rewrittenText'];

    newHTML = newHTML.replace(sentenceToChange, rewrittenSentence);
  }

  return newHTML;
}

// TODO: find way to combine clump beside just spaces in between
const combineSentencesOfCurrentClump = (currClump: []) => {
  let combinedSentence = '';
  for (let i = 0; i < currClump.length; i++) {
    combinedSentence += currClump[i]['sentence'] + ' ';
  }
  // Remove last space
  combinedSentence = combinedSentence.slice(0, -1);
  return combinedSentence;
}

export const rewriteByClumps = async (originalText: String, pplByClumps: []) => {
  setUsedRewriterInDB();

  // First convert to html
  const htmlText = convertTextToHTML(originalText);
  let newHTML = htmlText;

  // Loop through key, val of pplPerSentence
  // Loop through key, val of pplPerSentence
  for (let i = 0; i < pplByClumps.length; i++) {
    const currClump = pplByClumps[i];
    const combinedSentence = combineSentencesOfCurrentClump(currClump);

    const data = {
      text: combinedSentence
    }

    try {
      const res = await makePostRequest(`${getBackendUrl()}/rewriter/rewrite-using-paraphraser`, data)
      const rewrittenClump = res.data;

      // Add highlight to sentence
      newHTML = newHTML.replace(combinedSentence, rewrittenClump);
    } catch (err) {
      console.log(err);
    }
    
  }

  return newHTML;
}

export const getTextHTMLWithHighLight = (sentence: string, perplexity: number) => {
  let newHTML = sentence;
  const highlightColor = perplexity <= RED_PERPLEXITY_MAX ? 'rgb(255, 171, 171)' : 'rgb(254, 249, 204)';

  return `<mark data-color="${highlightColor}" style="background-color: ${highlightColor}; color: inherit">${sentence}</mark>`
}


export const rewriteSingleSentenceInHTML = async (currEditorHTML: string, sentence: string, perplexity: number) => {
  setUsedRewriterInDB();

  let newHTML = currEditorHTML;

  const sentenceToChange = sentence;
  const sentenceToChangeWithHighlight = getTextHTMLWithHighLight(sentenceToChange, perplexity);

  const data = {
    query: sentenceToChange,
  }

  let rewrittenSentence, new_perplexity;

  // call rewrite api
  try {
    const rewriter_res = await makePostRequest(`${SECOND_BACKEND_URL}/ai/bypasser/rewrite-sentence-webapp`, data);
    rewrittenSentence = rewriter_res.data;

    // const checker_res = await makePostRequest(`${getBackendUrl()}/checker/single-sentence-perplexity`, {
    //   text: rewrittenSentence
    // })
    // new_perplexity = parseInt(checker_res.data);

    // Replace paragraph with new one
    newHTML = newHTML.replace(sentenceToChangeWithHighlight, rewrittenSentence);
  } catch (err) {
    console.log(err);
    return { newHTML, rewrittenSentence };
  }

  return { newHTML, rewrittenSentence };
}

export const deleteSingleSentenceInHTML = (currEditorHTML: string, sentence: string, perplexity: number) => {
  let newHTML = currEditorHTML;

  const sentenceToChange = sentence;
  const sentenceToChangeWithHighlight = getTextHTMLWithHighLight(sentenceToChange, perplexity);

  // Remove sentence
  newHTML = newHTML.replace(sentenceToChangeWithHighlight, '');

  return newHTML;
}

export const rewriteParagraphInHTML = async (originalText: string, text: string): Promise<Record<string, any>> => {
  setUsedRewriterInDB();

  const htmlText = convertTextToHTML(originalText);
  let newHTML = htmlText;

  const url = getBypasserUrl();
  const { reqId, textToChange: paragraph } = await getRewrittenParagraphReqId(url, text);

  let result = null;

  for (let i = 0; i < 5; i++) {
    const res = await getRewrittenParagraphResponse(paragraph, reqId);
    if (res.rewrittenText) {
      result = res;
      break;
    }
    // sleep for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  if (!result) {
    return { newHTML, rewrittenText: paragraph };
  }

  const textToChange = result['textToChange'];
  const rewrittenText = result['rewrittenText'];


  newHTML = newHTML.replace(textToChange, rewrittenText);  

  return { newHTML, rewrittenText };

}

// Grammar fix
export const rewriteTextToFixGrammarInHTML = (textHTML: string, originalText: string, newText: string): string => {
  const highlightColor = `rgb(254, 249, 204)`;
  const originalTextHTML = `<mark data-color="${highlightColor}" style="background-color: ${highlightColor}; color: inherit">${originalText}</mark>`;
  let newHTML = textHTML;
  newHTML = newHTML.replace(originalTextHTML, newText);  
  return newHTML;
}

// Text Improvement fix
export const rewriteTextToFixTextImprovementInHTML = (textHTML: string, originalText: string, newText: string): string => {
  const highlightColor = `rgb(121, 184, 216)`;
  const originalTextHTML = `<mark data-color="${highlightColor}" style="background-color: ${highlightColor}; color: inherit">${originalText}</mark>`;
  let newHTML = textHTML;
  newHTML = newHTML.replace(originalTextHTML, newText);  
  return newHTML;
}

// Grammar remove highlight
export const removeGrammarHighlightInHTML = (textHTML: string, originalText: string): string => {
  const highlightColor = `rgb(254, 249, 204)`;
  const originalTextWithHighlight = `<mark data-color="${highlightColor}" style="background-color: ${highlightColor}; color: inherit">${originalText}</mark>`;
  let newHTML = textHTML;
  newHTML = newHTML.replace(originalTextWithHighlight, originalText);  
  return newHTML;
}

// Text improvement remove highlight
export const removeTextImprovementHighlightInHTML = (textHTML: string, originalText: string): string => {
  const highlightColor = `rgb(121, 184, 216)`;
  const originalTextWithHighlight = `<mark data-color="${highlightColor}" style="background-color: ${highlightColor}; color: inherit">${originalText}</mark>`;
  let newHTML = textHTML;
  newHTML = newHTML.replace(originalTextWithHighlight, originalText);  
  return newHTML;
}

export const setUsedRewriterInDB = async () => {
  const firebaseUser = await getCurrentFirebaseUser();
  
  if (firebaseUser) {
    const email = firebaseUser.email;
    await makePostRequest(`${SECOND_BACKEND_URL}/auth/used-rewriter`, { email }).catch(err => console.log(err));
  }
}