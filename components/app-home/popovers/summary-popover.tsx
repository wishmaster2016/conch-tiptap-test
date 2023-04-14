import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { FaCopy, FaRegCopy, FaRegQuestionCircle } from 'react-icons/fa';
import { SECOND_BACKEND_URL } from 'utils/constants';
import { makePostRequest } from 'utils/requests';
import AppPopover from './popover-webapp';

interface SummaryPopoverProps {
  selectedText: string;
}

const SummaryPopover = ({ selectedText } : SummaryPopoverProps) => {
  const [conchPopover, setConchPopover] = useState(false);

  const [lengthOption, setLengthOption] = useState<string>('same length');
  const [outputLevel, setOutputLevel] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState<boolean>(false);


  // Reset on selected text
  useEffect(() => {
    setLoading(false);
    setShowSummary(false);
    setSummary('');
  }, [selectedText, conchPopover]);


  const makeSummarizeRequest = () => {
    setLoading(true);

    // make jquery post request to backend
    makePostRequest(`${SECOND_BACKEND_URL}/ai/api/generate-tldr-webapp`, { query: selectedText, length: lengthOption, outputGradeLevel: outputLevel })
      .then((res) => {
        const response = res.data;

        setSummary(response);
        setShowSummary(true);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const handleCopySummary = (text: string) => {
    // copy text to clipboard
    navigator.clipboard.writeText(text);

    // close popover
    setConchPopover(false);
  }

  return (
    <AppPopover
      className="conch-popover"
      content={
        <div className="rounded-md mr-3 py-8 w-full h-full flex flex-col px-4 overflow-y-auto overflow-x-hidden">
          {showSummary && (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-row justify-around items-start">
                <p className="text-sm text-gray-500 w-2/3 inline-block">{summary}</p>
                <FaRegCopy className="inline-block w-12 mt-2 cursor-pointer" onClick={() => handleCopySummary(summary)} />
                <hr />
              </div>
            </div>
          )}

          {!showSummary && (
            <div className="mx-auto w-full">
              <div className="flex flex-row space-around items-center">
                <p className="conch-popover-label">Sentences</p>
                <select
                  name="penora-length-select"
                  className="conch-popover-select"
                  id="penora-rewrite-length-select text-black"
                  onChange={(e) => setLengthOption(e.target.value)}
                >
                  <option value="1">1</option>
                  <option value="2" selected>2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div className="flex flex-col">
                <p className="conch-popover-label">Output Grade Level (2)</p>
                <input
                  type="text"
                  onChange={(e) => setOutputLevel(e.target.value)}
                  className="conch-popover-input w-full mt-2"
                  placeholder="Explain like I'm 5, high school level, university level"
                />
              </div>
              <div className="flex justify-between items-center mt-4" >
                {!selectedText && <div
                  className="highlight-text-hint"
                >
                  Highlight text first.
                </div>}
                <div></div>
                {!selectedText ? (
                  <></>
                ) : (
                  <div
                    className="rewriteButton cursor-pointer text-white px-2 py-1 text-sm flex flex-row items-center gap-2"
                    onClick={() => makeSummarizeRequest()}
                  >
                    <div>Summarize</div>
                    {loading && <div className="penora-loader"></div>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      }
      openPopover={conchPopover}
      setOpenPopover={setConchPopover}
    >
      <div className="relative cursor-pointer z-10 mt-8 w-14 h-14 flex justify-center hover:bg-gradient-to-r from-gray-300 to-white">
        <Image
          src="/images/tldr.png"
          className="object-contain"
          width={30}
          height={60}
          alt="Sidebar Image"
          />
      </div>
    </AppPopover>
  )
}

export default SummaryPopover;