import mixpanel from 'mixpanel-browser';
import React, { useEffect, useState } from 'react'
import {
  FaRegTrashAlt
} from "react-icons/fa";
import { isMobile } from "react-device-detect";
import { incrementClicks } from '@/lib/utils';
import { useAdQueueModal } from '../AdQueueModal';


function GrammarCard({ correction, id, isUserPro, fixGrammarCard, deleteGrammarCard, grammarCardRef }) {
  const { showAdQueueModal, AdQueueModal, setShowAdQueueModal } =
  useAdQueueModal();
  const [tokenCost, setTokenCost] = useState(null);
  
  const [originalText, setOriginalText] = useState("");

  useEffect(() => {
    setOriginalText(correction.originalText);
  }, [correction]);

  const sentence = correction.originalText;

  useEffect(() => {
    // calculate token cost based on number of characters in sentence / 4 and round up
    setTokenCost(Math.ceil(sentence.length / 4));
  }, [sentence]);

  const handleFixGrammarCard = () => {
    mixpanel.track("Clicked Fix Grammar Card");
    if (!isUserPro) {
      const numClicks = incrementClicks();
      if (numClicks >= 3 && !isUserPro) {
        mixpanel.track("show ad modal", {"numClicks sentence": numClicks.toString()})
        setShowAdQueueModal(true)
      } else {
        fixGrammarCard(correction);
      }
    } else {
      fixGrammarCard(correction);
    }
  }

  const handleDeleteGrammarCard = () => {
    mixpanel.track("Deleted Grammar Card");
    deleteGrammarCard(correction, true);
  }
  
  return (
    <div className="">
      <AdQueueModal />
      {/* TODO: add rewrite ref here */}
      <div className={`${!isMobile && "drop-shadow-xl"} ${isMobile ? "py-2" : "py-8"} grammarCard px-8`} id={`rewrite-${id}`} value={originalText} ref={grammarCardRef} style={{border: '2px solid yellow'}} >
        <div className="flex flex-row justify-between items-center">
          <p className="text-xl text-yellow-500">{correction.correctionType}</p>
          <FaRegTrashAlt onClick={handleDeleteGrammarCard} className="cursor-pointer" />
        </div>
      {!isMobile ? (
        <div>
          <p className="mt-4 mb-4 italic overflow-hidden text-ellipsis ">Original: {correction.originalText}</p>
          <p className="mt-4 mb-4 italic overflow-hidden text-ellipsis ">Suggestion: {correction.suggestion}</p>
        </div>
      ) : (
        <div>
          <p className='mb-8 italic overflow-hidden line-clamp-3 text-ellipsis '>Original: {correction.originalText}</p>
          <p className='mb-8 italic overflow-hidden line-clamp-3 text-ellipsis '>Suggestion: {correction.suggestion}</p>
        </div>
      )}
      <div className="flex flex-row justify-between items-center w-full mt-4">
        <p className="py-1 ">Cost: 50 tokens</p>
        <button className="w-fit rewriteButton px-2 py-1 text-white" onClick={handleFixGrammarCard}>
          <p>🛠️ Fix</p>
        </button>
      </div>
    </div>
    </div>
  )
}

export default GrammarCard