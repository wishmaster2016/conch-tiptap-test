import { AI_WRITTEN_MESSAGE, HUMAN_WRITTEN_MESSAGE, MOSTLY_HUMAN_MESSAGE, RED_PERPLEXITY_MAX, RED_SCORE_MAX, YELLOW_PERPLEXITY_MAX, YELLOW_SCORE_MAX } from "./constants";
import { convertTextToHTML } from "./editor-content";

export const addPerplexityHighlightsToHTML = (originalHTML: String, pplPerSentence: Record<string, any>[]) => {
  let newHTML = originalHTML;

  // Loop through key, val of pplPerSentence
  for (let i = 0; i < pplPerSentence.length; i++) {
    const sentence = pplPerSentence[i]['sentence'];
    const perplexity = pplPerSentence[i]['perplexity'];

    if (perplexity <= YELLOW_PERPLEXITY_MAX) {
      const highlightColor = perplexity <= RED_PERPLEXITY_MAX ? 'rgb(255, 171, 171);' : 'rgb(254, 249, 204)';
      
      // Add highlight to sentence
      newHTML = newHTML.replace(`${sentence}`, `<mark style="background: ${highlightColor}">${sentence}</mark>`);
    }
  }

  return newHTML;
}


// A percentage score of how much of the text is AI written (0-100)
// but not exactly a percentage, because rewrite all gives an artifical boost to it
export const calculateScoreFromPPL = (pplPerSentence: Record<string, any>[]) => {
  let numbSentences = pplPerSentence.length;

  let numbSentencesRed, numbSentencesYellow, numbSentencesPassing;
  numbSentencesRed = numbSentencesYellow = numbSentencesPassing = 0;

  for (let i = 0; i < numbSentences; i++) {
    const perplexity = pplPerSentence[i]['perplexity'];

    if (perplexity <= RED_PERPLEXITY_MAX) {
      numbSentencesRed++;
    } else if (perplexity <= YELLOW_PERPLEXITY_MAX) {
      numbSentencesYellow++;
    } else {
      numbSentencesPassing++;
    }
  }

  // 1 * numb sentences passing + 0.5 * numb sentences yellow divided by total numb sentences
  const finalScore = Math.round(( (1 * numbSentencesPassing + 0.5 * numbSentencesYellow) / numbSentences) * 100);

  return finalScore;
}


/**
 * Create our score of red, yellow, green on 
 * how AI-based their text
 * @param originalText 
 * @param pplPerSentence 
 * @returns 
 */
export const generatePerplexityHighlightsHTMLFromText = (originalText: String, pplPerSentence: Record<string, any>[]) => {
  // First convert to html
  const htmlText = convertTextToHTML(originalText);

  // Then add perplexity highlights
  return addPerplexityHighlightsToHTML(htmlText, pplPerSentence);
}


/**
 * Based on the score, return if AI written, mostly human, or human written
 * @param score 0 to 100
 * @returns 
 */
export const generateMessageFromScore = (score: number) => {
  if (score <= RED_SCORE_MAX) {
    return AI_WRITTEN_MESSAGE;
  } else if (score <= YELLOW_SCORE_MAX) {
    return MOSTLY_HUMAN_MESSAGE;
  } else {
    return HUMAN_WRITTEN_MESSAGE;
  }
}

/**
 * Based on the score, return if AI written, mostly human, or human written
 * @param score 0 to 100
 * @returns 
 */
export const generateOutputMessage = (score: number, pplPerSentence: Record<string, any>, grammarImprovements: Record<string, any>[], textImprovements: Record<string, any>[]) => {
  const grammarErrorRatio = grammarImprovements.length / pplPerSentence.length;
  const styleErrorRatio = textImprovements.length / pplPerSentence.length;

  if (score <= RED_SCORE_MAX) {
    // Would not pass AI detector
    return AI_WRITTEN_MESSAGE;
  } else {
    if (grammarErrorRatio <= 0.3 && styleErrorRatio <= 0.3) {
      // Both ratios are low
      return "You have a relatively strong essay."
    } else if (grammarErrorRatio > 0.3 && styleErrorRatio > 0.3) {
      // Both are very high
      return "Your essay has quite a few grammar / style problems.";
    } else if (grammarErrorRatio > 0.3) {
      // Only grammar is high
      return "Your essay has quite a few grammar problems.";
    } else {
      // Only text is high
      return "Your essay has quite a few style problems.";
    }
  }
}


/*
  NEW: V2.0.0 Below with AI Checker + Improvements
*/

export const generateHighlightsFromText = (originalText: String, pplPerSentence: Record<string, any>[], improvementsGrammar: any[], improvementsText: any[]) => {
  // First convert to html
  const htmlText = convertTextToHTML(originalText);

  // Then add perplexity highlights
  return addAllHightsToText(htmlText, pplPerSentence, improvementsGrammar, improvementsText);
}

const replace_nth = function (s: String, f: string, r: string, n: number) {
  // From the given string s, find f, replace as r only on n’th occurrence
  return s.replace(RegExp("^(?:.*?" + f + "){" + n + "}"), x => x.replace(RegExp(f + "$"), r));
};

/**
 * Replace only by whole word (not by partial match)
 * @param s 
 * @param f 
 * @param r 
 */
const replaceWholeWordOnly = (s: String, f: string, r: string) => {
  return s.replace(RegExp("\\b" + f + "\\b", "g"), r);
}

export const addAllHightsToText = (originalHTML: String, pplPerSentence: Record<string, any>[], improvementsGrammar: any[], improvementsText: any[]) => {
  let newHTML = originalHTML;

  // Store the grammar and text improvements that WERE highlighted
  const improvementsGrammarAdded = [];
  const improvementsTextAdded = [];

  const seenSentences: Record<string, number> = {};

  // Loop through key, val of pplPerSentence
  for (let i = 0; i < pplPerSentence.length; i++) {
    const sentence = pplPerSentence[i]['sentence'];
    const perplexity = pplPerSentence[i]['perplexity'];

    if (perplexity <= YELLOW_PERPLEXITY_MAX) {
      const highlightColor = perplexity <= RED_PERPLEXITY_MAX ? 'rgb(255, 171, 171);' : 'rgb(255, 171, 171);';
      
      // see if sentence is in seen sentences
      if (seenSentences[sentence]) {
        seenSentences[sentence]++;
        newHTML = replace_nth(newHTML, sentence, `<mark style="background: ${highlightColor}">${sentence}</mark>`, seenSentences[sentence]);
      } else {
        seenSentences[sentence] = 1;
        newHTML = newHTML.replace(`${sentence}`, `<mark style="background: ${highlightColor}">${sentence}</mark>`);
      }
    }
  }

  if (improvementsGrammar) {    
    for (let i = 0; i < improvementsGrammar.length; i++) {      
      const text = improvementsGrammar[i]['originalText'];

      // see if text is in html
      if (!newHTML.includes(text)) {
        continue;
      }

      // Add yellow grammar highlight to sentence
      newHTML = replaceWholeWordOnly(newHTML, `${text}`, `<mark style="background: rgb(254, 249, 204)">${text}</mark>`);
      improvementsGrammarAdded.push(improvementsGrammar[i]);
    }
  }

  if (improvementsText) {
    for (let i = 0; i < improvementsText.length; i++) {
      const text = improvementsText[i]['originalText'];

      // see if text is in html
      if (!newHTML.includes(text)) {
        continue;
      }

      // Add blue improvement highlight to sentence
      newHTML = replaceWholeWordOnly(newHTML, `${text}`, `<mark style="background: rgb(121, 184, 216)">${text}</mark>`);
      improvementsTextAdded.push(improvementsText[i]);
    }
  }


  // repeat double ending </mark> tag with one </mark>
  newHTML = newHTML.replace(/<\/mark><\/mark>/g, '</mark>');

  // repeat double <mark style="background: rgb(255, 171, 171);">
  newHTML = newHTML.replace(/<mark style="background: rgb\(255, 171, 171\);"><mark style="background: rgb\(255, 171, 171\);">/g, '<mark style="background: rgb(255, 171, 171);">');

  console.log(newHTML);

  return { newHTML, improvementsGrammarAdded, improvementsTextAdded };
}






