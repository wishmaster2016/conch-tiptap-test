import mixpanel from 'mixpanel-browser';
import React, { useEffect, useState } from 'react'
import {
  FaRegTrashAlt
} from "react-icons/fa";
import { isMobile } from "react-device-detect";
import { incrementClicks } from '@/lib/utils';
import { useAdQueueModal } from '../AdQueueModal';


function RewriteSentenceCard({ sentence, perplexity, rewriteSingleSentence, deleteSingleSentence, id, rewriteRef, alreadyRewritten, previousText, isUserPro }) {
  const { showAdQueueModal, AdQueueModal, setShowAdQueueModal } =
    useAdQueueModal();
  const [tokenCost, setTokenCost] = useState(null);

  useEffect(() => {
    // calculate token cost based on number of characters in sentence / 4 and round up
    setTokenCost(Math.ceil(sentence.length / 4));
  }, [sentence]);

  return (
    <div className="">
      <AdQueueModal />
      <div className={`${!isMobile && "drop-shadow-lg"} ${isMobile ? "py-2" : "py-8"} rewriteSentenceCard px-8 `} id={`rewrite-${id}`} ref={rewriteRef} value={sentence}>
        <div className="flex flex-row justify-between items-center">
          <p className="text-xl text-red-500">Perplexity: {perplexity}</p>
          <FaRegTrashAlt onClick={() => {
            mixpanel.track("Clicked Delete Sentence", { length: sentence.length, perplexity: perplexity })
            deleteSingleSentence(sentence, perplexity, id)
          }
          } />
        </div>
        {!isMobile ? <p className="mt-4 mb-4 italic overflow-hidden text-ellipsis ">{sentence}</p> : <p className='mb-8 italic overflow-hidden line-clamp-3 text-ellipsis '>{sentence}</p>}
        <div className="flex flex-row justify-between items-center w-full mt-4">
          <p className="py-1 ">Cost: {tokenCost} tokens</p>
          <button className="w-fit rewriteButton px-2 py-1 text-white" onClick={() => {
            //prettier-ignore
            mixpanel.track("Clicked Rewrite Sentence", { "length": sentence.length.toString(), "perplexity": perplexity.toString() })
            if (!isUserPro) {
              const numClicks = incrementClicks();
              if (numClicks >= 3 && !isUserPro) {
                mixpanel.track("show ad modal", { "numClicks sentence": numClicks.toString() })
                setShowAdQueueModal(true)
              } else {
                rewriteSingleSentence(sentence, perplexity, id, tokenCost)
              }
            } else {
              rewriteSingleSentence(sentence, perplexity, id, tokenCost)
            }
          }}>
            <p className="w-fit text-center text-sm text-white font-semibold">✏️ Rewrite Sentence</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default RewriteSentenceCard