import React, { useEffect, useState } from 'react'
import {
  FaRegTrashAlt
} from "react-icons/fa";
import mixpanel from 'mixpanel-browser';
import { isMobile } from "react-device-detect";
import { incrementClicks } from '@/lib/utils';
import { useAdQueueModal } from '../AdQueueModal';

function RewriteParagraphCard({ clump, text, rewriteParagraph, deleteParagraphRewriteObject, id, rewriteRef, alreadyRewritten, previousText, isUserPro }) {

  const [displayText, setDisplayText] = useState('');
  const [tokenCost, setTokenCost] = useState(null);
  const [avgPerplexity, setAvgPerplexity] = useState(0);

  useEffect(() => {
    let totalPerplexity = 0;

    clump.forEach((sentence) => {
      totalPerplexity += sentence.perplexity;
    });

    setAvgPerplexity(Math.ceil(totalPerplexity / clump.length));
  }, [clump]);

  const { showAdQueueModal, AdQueueModal, setShowAdQueueModal } =
    useAdQueueModal();

  useEffect(() => {
    const textLength = text ? text.length : 0;
    // calculate token cost based on number of characters in sentence / 4 and round up
    setTokenCost(Math.ceil(textLength / 4));

    // set display text as first 5 words and last 5 words of text
    const words = text.split(' ');
    if (words && words.length > 10) {
      const firstFiveWords = words.slice(0, 5).join(' ');
      const lastFiveWords = words.slice(words.length - 5, words.length).join(' ');
      setDisplayText(`${firstFiveWords} ... ${lastFiveWords}`);
    } else {
      // if length is <= 10 words, just display the whole sentence
      setDisplayText(text);
    }

  }, [text]);

  return (
    <div>
      <AdQueueModal />
      <div className={`${!isMobile && "drop-shadow-lg"} rewriteOptionCard px-8 py-4`} id={`rewrite-${id}`} ref={rewriteRef} value={text}>
        <div className="flex flex-row justify-between items-center">
          <p className="text-xl text-red-500">Perplexity: {avgPerplexity}</p>
          <FaRegTrashAlt onClick={() => deleteParagraphRewriteObject(id)} />
        </div>
        {!isMobile ? <p className="mt-4 mb-4 italic overflow-hidden text-ellipsis">{displayText}</p> : <p className="mb-4 min-h-24 italic h-20 w-full line-clamp-4 text-sm">{displayText}</p>}
        <div className="flex flex-row justify-between items-center w-full mt-4">
          <p className=" py-1">Cost {tokenCost} tokens</p>
          <button className="w-fit rewriteButton px-2 py-1 text-white" onClick={() => {
            //prettier-ignore
            mixpanel.track("Clicked Rewrite Paragraph", { "length": text.length.toString(), "avgPerplexity": avgPerplexity ? avgPerplexity.toString() : "", "tokenCost": tokenCost ? tokenCost.toString() : "" })
            if (!isUserPro) {
              const numClicks = incrementClicks();
              if (numClicks >= 3 && !isUserPro) {
                mixpanel.track("show ad modal paragraph", { "numClicks": numClicks.toString() })
                setShowAdQueueModal(true)
              } else {
                rewriteParagraph(text, avgPerplexity, id, tokenCost)
              }
            } else {
              rewriteParagraph(text, avgPerplexity, id, tokenCost);
            }
          }}>
            <p className="w-fit text-center text-sm text-white font-semibold">✏️ Rewrite Paragraph</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default RewriteParagraphCard