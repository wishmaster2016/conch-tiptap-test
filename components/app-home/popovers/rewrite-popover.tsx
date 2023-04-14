import mixpanel from "mixpanel-browser";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { FaCopy, FaRegCopy, FaRegQuestionCircle } from "react-icons/fa";
import { SECOND_BACKEND_URL } from "utils/constants";
import { makePostRequest } from "utils/requests";
import AppPopover from "./popover-webapp";
import Tooltip from "@/components/shared/tooltip";
import { incrementClicks } from "@/lib/utils";
import { useAdQueueModal } from "@/components/AdQueueModal";
import { toast } from "react-hot-toast";

interface RewritePopoverProps {
  selectedText: string;
  userData: Record<string, any>;
  setShowOutOfTokensModal: (show: boolean) => void;
  handlePopOpen: () => void;
}

const RewritePopover = ({
  selectedText,
  userData,
  setShowOutOfTokensModal,
  handlePopOpen,
}: RewritePopoverProps) => {
  const [conchPopover, setConchPopover] = useState(false);
  const [lengthOption, setLengthOption] = useState<string>("same length");
  const [tone, setTone] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [rewriteOptions, setRewriteOptions] = useState<any[]>([]);
  const [showRewriteOptions, setShowRewriteOptions] = useState<boolean>(false);
  const { showAdQueueModal, AdQueueModal, setShowAdQueueModal } =
    useAdQueueModal();
  const [isUserPro, setIsUserPro] = useState<boolean>(false);

  useEffect(() => {
    setIsUserPro(userData && userData.currPlan && userData.currPlan.length > 0);
  }, [userData]);

  useEffect(() => {
    setLoading(false);
    setShowRewriteOptions(false);
    setRewriteOptions([]);
  }, [selectedText]);

  const makeRewriteRequest = () => {
    if (userData.currTokensLeft < 0) {
      mixpanel.track("show out of tokens conch");
      setShowOutOfTokensModal(true);
      return;
    }

    // prettier-ignore
    mixpanel.track("clicked generate rewrite", { "length": lengthOption.toString(), "tone": tone.toString() });

    const numClicks = incrementClicks();

    if (numClicks >= 3 && !isUserPro) {
      mixpanel.track("show ad generate rewrite");
      setShowAdQueueModal(true);
      return;
    }
    setLoading(true);

    // make jquery post request to backend
    makePostRequest(`${SECOND_BACKEND_URL}/ai/api/rewrite-alternate`, {
      query: selectedText,
      length: lengthOption,
      tone,
    })
      .then((res) => {
        const response = res.data;
        setRewriteOptions(response);
        setShowRewriteOptions(true);
        setLoading(false);
      })
      .catch((err) => {
        // if response code = 402
        if (err.response && err.response.status === 402) {
          // show out of tokens modal
          setShowOutOfTokensModal(true);
        } else {
          console.log(err);
          setLoading(false);
          toast.error(
            "Something went wrong. Please save document, refresh, and try again.",
          );
        }
      });
  };

  const generateRewrite = () => {
    if (selectedText) {
      makeRewriteRequest();
      mixpanel.track("clicked generate rewrite");
    }
  };
  const handleRewriteOptionCopy = (text: string) => {
    // copy text to clipboard
    navigator.clipboard.writeText(text);

    // close popover
    setConchPopover(false);
  };

  const openPopOver = () => {
    mixpanel.track("clicked Open Rewrite Popover");
    setConchPopover(true);
    handlePopOpen();
  };

  return (
    <div>
      <AdQueueModal />
      <AppPopover
        className="conch-popover"
        content={
          <div className="mr-3 flex h-full w-full flex-col overflow-y-auto overflow-x-hidden rounded-md py-8 px-8">
            {showRewriteOptions && (
              <div className="flex w-full flex-col gap-2">
                {rewriteOptions.map((option, index) => (
                  <div key={index}>
                    <div
                      key={index}
                      className="flex flex-row items-start justify-around"
                    >
                      <p className="inline-block w-2/3 text-sm text-gray-500">
                        {option}
                      </p>
                      <FaRegCopy
                        className="mt-2 inline-block w-12 cursor-pointer"
                        onClick={() => handleRewriteOptionCopy(option)}
                      />
                    </div>
                    <hr />
                  </div>
                ))}
              </div>
            )}

            {!showRewriteOptions && (
              <div className="mx-auto w-full">
                <div className="flex flex-row items-center justify-between">
                  <p className="conch-popover-label">Rewrite Length</p>
                  <select
                    name="penora-length-select"
                    className="flex items-center justify-center rounded-lg border-0 py-0 text-sm outline-none outline-0"
                    id="penora-rewrite-length-select text-black"
                    onChange={(e) => setLengthOption(e.target.value)}
                  >
                    <option value="same length">Same Length </option>
                    <option value="shorter">Shorter</option>
                    <option value="longer">Longer</option>
                  </select>
                </div>
                <div className="mt-8 flex flex-row items-center  justify-between">
                  <p className="conch-popover-label ">Tone of Voice</p>
                  <select
                    name="penora-length-select"
                    className="flex items-center justify-center rounded-lg border-slate-300 py-0 text-sm outline-none outline-0"
                    id="penora-rewrite-length-select text-black"
                  >
                    <option value="MLA">Academic</option>
                    <option value="MLA">Formal</option>
                    <option value="APA">Persuasive</option>
                    <option value="MLA">Casual</option>
                  </select>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex w-full flex-row items-center justify-between">
                    {!selectedText ? (
                      <div className="text-sm text-gray-400 italic">
                        Highlight text first.
                      </div>
                    ) : (
                      <div></div>
                    )}
                    <button
                      className={`${
                        selectedText ? "bg-black" : "bg-gray-400"
                      } flex flex-row items-center rounded-lg px-6 py-1 text-sm font-bold text-white`}
                      onClick={() => generateRewrite()}
                    >
                      <div>Rewrite</div>
                      {loading && <div className="penora-loader ml-2"></div>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
        openPopover={conchPopover}
        setOpenPopover={setConchPopover}
      >
        <div
          onClick={openPopOver}
          className={
            isMobile
              ? "z-10  flex cursor-pointer cursor-pointer justify-center from-gray-300 to-white hover:bg-gradient-to-r "
              : "relative z-10 mt-8 flex h-14 w-14 cursor-pointer justify-center from-gray-300 to-white hover:bg-gradient-to-r"
          }
        >
          {isMobile ? (
            <Image
              src="/images/rewrite.png"
              className="object-contain"
              width={30}
              height={60}
              alt="Sidebar Image"
            />
          ) : (
            <Tooltip content="Rewrite">
              <Image
                src="/images/rewrite.png"
                className="object-contain"
                width={30}
                height={60}
                alt="Sidebar Image"
              />
            </Tooltip>
          )}
        </div>
      </AppPopover>
    </div>
  );
};

export default RewritePopover;
