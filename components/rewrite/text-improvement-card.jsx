import mixpanel from 'mixpanel-browser';
import React, { useEffect, useState } from 'react'
import {
  FaRegTrashAlt
} from "react-icons/fa";
import { isMobile } from "react-device-detect";
import { incrementClicks } from '@/lib/utils';
import { useAdQueueModal } from '../AdQueueModal';


function TextImprovementCard({ improvement, id, isUserPro, fixTextImprovementCard, deleteImprovementCard, improvementCardRef  }) {
  const { showAdQueueModal, AdQueueModal, setShowAdQueueModal } =
  useAdQueueModal();
  const [tokenCost, setTokenCost] = useState(50);
  const [originalText, setOriginalText] = useState("");

  useEffect(() => {
    setOriginalText(improvement.originalText);
  }, [improvement]);

  const handleFixImprovementCard = () => {
    mixpanel.track("Clicked Fix Improvement Card");
    if (!isUserPro) {
      const numClicks = incrementClicks();
      if (numClicks >= 3 && !isUserPro) {
        mixpanel.track("show ad modal", {"numClicks sentence": numClicks.toString()})
        setShowAdQueueModal(true)
      } else {
        fixTextImprovementCard(improvement);
      }
    } else {
      fixTextImprovementCard(improvement);
    }
  }

  const handleDeleteImprovementCard = () => {
    mixpanel.track("Deleted Text Improvement Card");
    deleteImprovementCard(improvement, true);
  }
  
  return (
    <div className="">
      <AdQueueModal />
    <div className={`${!isMobile && "drop-shadow-lg"} ${isMobile ? "py-2" : "py-8"} textImprovementCard px-8 `} id={`rewrite-${id}`} ref={improvementCardRef} value={originalText}>
      <div className="flex flex-row justify-between items-center">
        <p className="text-xl text-blue-500">{improvement.improvementType.charAt(0).toUpperCase() + improvement.improvementType.slice(1)}</p>
        <FaRegTrashAlt onClick={handleDeleteImprovementCard} className="cursor-pointer" />
      </div>
      {!isMobile ? (
        <div>
          <p className="mt-4 mb-4 italic overflow-hidden text-ellipsis ">Original: {improvement.originalText}</p>
          <p className="mt-4 mb-4 italic overflow-hidden text-ellipsis ">Suggestion: {improvement.suggestions[0]}</p>

        </div>
      ) : (
        <div>
          <p className='mb-8 italic overflow-hidden line-clamp-3 text-ellipsis '>Original: {improvement.originalText}</p>
          <p className='mb-8 italic overflow-hidden line-clamp-3 text-ellipsis '>Suggestion: {improvement.suggestions[0]}</p>
        </div>
      )}
      <div className="flex flex-row justify-between items-center w-full mt-4">
        <p className="py-1 ">Cost: {tokenCost} tokens</p>
        <button className="w-fit rewriteButton px-2 py-1 text-white" onClick={handleFixImprovementCard}>
          <p>Rewrite</p>
        </button>
      </div>
    </div>
    </div>
  )
}

export default TextImprovementCard