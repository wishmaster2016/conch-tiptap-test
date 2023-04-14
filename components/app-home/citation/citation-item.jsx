import React from 'react'
import { FaBook, FaExternalLinkAlt, FaLink, FaReadme, FaRegClipboard, FaRegFileAlt, FaRegNewspaper, FaResearchgate } from 'react-icons/fa'

function CitationItem({ citation, addAsCitation }) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row w-full justify-between">
        <a href={citation.link} target="_blank" rel="noreferrer" className="w-8/12 flex flex-row justify-start items-center">
          <p className="underline line-clamp-1">{citation.title} </p>
          <FaExternalLinkAlt  className="ml-1" style={{ minWidth: '12px', maxWidth: '12px', minHeight: '12px', maxHeight: '12px'}} />
        </a>
        {citation.type === 'Journal' ? (
          <div className="flex flex-row justify-start items-center">
            <FaRegClipboard size={12} className="mr-1" />
            <p className="font-light text-gray-400">Journal</p>
          </div>
        ) : (
          <div className="flex flex-row justify-start items-center">
            <FaLink size={12} className="mr-1" />
            <p className="font-light text-gray-400">Website</p>
          </div>
        )}
      </div>
      <p className="text-gray-500 text-sm font-light mt-2 text-ellipsis">{citation.snippet}</p>
      <button className="blackButton mt-4 py-1 px-4 text-white w-fit" onClick={() => addAsCitation(citation)}>
        <div className="flex flex-row justify-start items-center">
          <FaRegFileAlt color="#ffffff" size={16} className="mr-2" /> 
          <p className="font-semibold">Add as citation </p>
        </div>
      </button>      
      <hr className="mt-4 mb-4" style={{border: '0.5px solid rgba(88, 88, 88, 0.5)'}} />
    </div>
  )
}

export default CitationItem