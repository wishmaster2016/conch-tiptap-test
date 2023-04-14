import React from 'react'
import { isMobile } from 'react-device-detect';
import { FaRegTimesCircle } from 'react-icons/fa'

import CitationItem from './citation-item';

function CitationPopover({ citations, addAsCitation, popoverTopOffset, popoverLeftOffset, setShowCitationPopover, citationsLoaded}) {
  return (
  <div className={`citationPopoverCard absolute overflow-auto ${isMobile ? 'text-sm' : ''} `} style={{ width: isMobile ? '250px' : '400px', height: isMobile ? '310px' : '429px', top: popoverTopOffset, left: popoverLeftOffset}}>
    <div className="flex justify-between px-4 mt-4">
      <p className="text-italic text-gray-600 text-sm font-light">Citation Suggestions</p>
      <div onClick={() => setShowCitationPopover(false)}>
        <FaRegTimesCircle size={20} className="text-gray-400 cursor-pointer" />
      </div>
    </div>
    <div className="flex flex-col px-4 mt-4">
      {citations && citations.map((citation, i) => {
        return (
          <CitationItem citation={citation} addAsCitation={addAsCitation} key={i} />
        )
      })}
      {!citationsLoaded && (!citations || citations.length === 0) && (
        <div className="flex items-center justify-center mt-4">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status">
            <span
              className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
              >Loading...</span
            >
          </div>
        </div>      
      )}
      {citationsLoaded && citations.length === 0 && (
        <p className="text-gray-600 text-xl font-bold mt-2 text-ellipsis">No citations found. Please try citing something else or fewer words.</p>
      )}
    </div>
  </div> 
 )
}

export default CitationPopover