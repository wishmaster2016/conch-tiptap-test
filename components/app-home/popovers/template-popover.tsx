import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCopy,
  FaRegCopy,
  FaRegQuestionCircle,
} from "react-icons/fa";
import { SECOND_BACKEND_URL } from "utils/constants";
import { makePostRequest } from "utils/requests";
import AppPopover from "./popover-webapp";
import Tooltip from "@/components/shared/tooltip";
import { isMobile } from "react-device-detect";
import mixpanel from "mixpanel-browser";
import { incrementClicks } from "@/lib/utils";
import { useAdQueueModal } from "@/components/AdQueueModal";
import { toast } from "react-hot-toast";

interface TemplatePopoverProps {
  handleTemplateGen: (text: string) => void;
  userData: Record<string, any>;
  setShowOutOfTokensModal: (show: boolean) => void;
  handlePopOpen: () => void;
  currDocument: Record<string, any>;
}

const TemplatePopover = ({
  handleTemplateGen,
  userData,
  setShowOutOfTokensModal,
  handlePopOpen,
  currDocument
}: TemplatePopoverProps) => {
  const [conchPopover, setConchPopover] = useState(false);

  
  const [loading, setLoading] = useState<boolean>(false);

  const [showTemplateOptions, setShowTemplateOptions] = useState<boolean>(true);
  const [currTemplate, setCurrTemplate] = useState<string>("");
  const [isUserPro, setIsUserPro] = useState<boolean>(false);
  const { showAdQueueModal, AdQueueModal, setShowAdQueueModal } =
    useAdQueueModal();

  // Input fields (corresponds to order on UI)
  const [input1, setInput1] = useState<string>("");
  const [input2, setInput2] = useState<string>("");
  const [input3, setInput3] = useState<string>("");

  useEffect(() => {
    setIsUserPro(userData && userData.currPlan && userData.currPlan.length > 0);
  }, [userData]);

  useEffect(() => {
    setLoading(false);
    setShowTemplateOptions(true);
    setCurrTemplate("");

    // reset inputs
    setInput1("");
    setInput2("");
    setInput3("");
  }, [conchPopover]);

  const handleTemplateClick = (template: string) => {
    setCurrTemplate(template);
    setShowTemplateOptions(false);
  };

  const generateTemplate = (templateType: string) => {
    // TOKENS: check if user has enough tokens
    if (userData.currTokensLeft < 0) {
      setShowOutOfTokensModal(true);
      mixpanel.track("show out of tokens template");
      return;
    }

    // prettier-ignore
    mixpanel.track("clicked generate template", { "templateType": templateType });
    const numClicks = incrementClicks();
    if (numClicks >= 3 && !isUserPro) {
      mixpanel.track("show ad generate template");
      setShowAdQueueModal(true);
      return;
    }

    setLoading(true);

    let data = {};
    let url = "";

    const documentInfoToPrepend = `A student is writing an essay about ${currDocument.documentDescription}. The student is writing in a ${currDocument.contentStyle} style. `;

    const tone = currDocument.contentStyle ? `${currDocument.contentStyle} style as well as ` + input3 : input3;

    // pick data and url based on template type
    switch (templateType) {
      case "outline":
        data = {
          thesis: input1,
          tone: currDocument.contentStyle ? `${currDocument.contentStyle} style as well as ` + input2 : input2,
        };
        url = `${SECOND_BACKEND_URL}/ai/api/generate-outline-alternate`;
        break;
      case "intro":
        data = {
          points: currDocument.documentDescription ? `${currDocument.documentDescription}, ` + input1 : input1,
          info: input2,
          tone: currDocument.contentStyle ? `${currDocument.contentStyle} style as well as ` + input3 : input3,
        };
        url = `${SECOND_BACKEND_URL}/ai/api/generate-intro-alternate`;
        break;
      case "conclusion":
        data = {
          points: currDocument.documentDescription ? `${currDocument.documentDescription}, ` + input1 : input1,
          info: documentInfoToPrepend + input2,
          tone: currDocument.contentStyle ? `${currDocument.contentStyle} style as well as ` + input3 : input3,
        };
        url = `${SECOND_BACKEND_URL}/ai/api/generate-conclusion-alternate`;
        break;
      case "response":
        data = {
          query: input1,
          info: currDocument.documentDescription ? `${currDocument.documentDescription}, ` + input2 : input2,
          tone: currDocument.contentStyle ? `${currDocument.contentStyle} style as well as ` + input3 : input3,
        };
        url = `${SECOND_BACKEND_URL}/ai/api/generate-response-alternate`;
        break;
      default:
        // If no template type is specified, default to response
        data = {
          query: input1,
          info: currDocument.documentDescription ? `${currDocument.documentDescription}, ` + input2 : input2,
          tone: currDocument.contentStyle ? `${currDocument.contentStyle} style as well as ` + input3 : input3,
        };
        url = `${SECOND_BACKEND_URL}/ai/api/generate-response-webapp`;
        break;
    }

    // make request based on picked url and data
    makePostRequest(url, data)
      .then((res) => {
        const response = res.data;

        // pass data to top
        handleTemplateGen(response);

        // close popover
        handleAfterGenerate();
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

  /**
   * Actions after generate
   */
  const handleAfterGenerate = () => {
    // reset states
    setConchPopover(false);
    setLoading(false);
    setShowTemplateOptions(true);
    setCurrTemplate("");

    // reset inputs
    setInput1("");
    setInput2("");
    setInput3("");
  };

  /**
   * From specific template input screen, go back to
   * template options screen
   */
  const goBackToOptionsScreen = () => {
    setShowTemplateOptions(true);
    setCurrTemplate("");
  };

  const openPopOver = () => {
    mixpanel.track("clicked Open Template Popover");
    setConchPopover(true);
    handlePopOpen();
  };

  return (
    <div>
      <AdQueueModal />
      <AppPopover
        className="conch-popover-large"
        content={
          <div className="mr-3 flex h-full w-full flex-col overflow-y-auto overflow-x-hidden rounded-md px-4">
            {!showTemplateOptions && (
              <div className="">
                {/* OUTLINE */}
                {currTemplate === "outline" && (
                  <div id="">
                    <p className="penora-label mt-4 text-sm">Main thesis / argument</p>
                    <input
                      onChange={(e) => {
                        setInput1(e.target.value);
                      }}
                      id="penora-templates-thesis-input"
                      className="popover-textarea-small"
                      placeholder="Turing should not have been castrated"
                    />
                    <p className="penora-label penora-label-2 mt-3 text-sm">
                      Tone of voice
                    </p>
                    <input
                      onChange={(e) => {
                        setInput2(e.target.value);
                      }}
                      id="penora-templates-tone-input"
                      className="popover-textarea-small"
                      placeholder="Informative, Witty"
                    />
                    <div className="mx-auto mt-4 flex w-full flex-row items-center justify-between">
                      <FaArrowLeft
                        className="ml-1 cursor-pointer"
                        onClick={goBackToOptionsScreen}
                      />
                      <div
                        className="mr-2 flex cursor-pointer flex-row items-center gap-2 rounded-lg bg-black px-4 py-1 text-sm font-bold text-white"
                        onClick={() => generateTemplate("outline")}
                      >
                        <div>Generate</div>
                        {loading && <div className="penora-loader"></div>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Response */}
                {currTemplate === "response" && (
                  <div id="">
                    <p className="text-sm">I want to respond to this</p>
                    <input
                      onChange={(e) => {
                        setInput1(e.target.value);
                      }}
                      id="penora-templates-thesis-input"
                      className="popover-textarea-small"
                      placeholder="Turing should not have been castrated"
                    />
                    <p className="penora-label penora-label-2 mt-2 text-sm">
                      Key Information
                    </p>
                    <input
                      onChange={(e) => {
                        setInput2(e.target.value);
                      }}
                      id="penora-templates-tone-input"
                      className="popover-textarea-small"
                      placeholder="I agree with this, provide a supporting point"
                    />
                    <p className="penora-label penora-label-2 mt-2 text-sm">
                      Tone of voice
                    </p>
                    <input
                      onChange={(e) => {
                        setInput3(e.target.value);
                      }}
                      id="penora-templates-tone-input"
                      className="popover-textarea-small"
                      placeholder="Informative, Witty"
                    />
                    <div className="mx-auto mt-4 flex w-full flex-row items-center justify-between">
                      <FaArrowLeft
                        className="ml-1 cursor-pointer"
                        onClick={goBackToOptionsScreen}
                      />
                      <div
                        className="mr-2 flex cursor-pointer flex-row items-center gap-2 rounded-lg bg-black px-4 py-1 text-sm font-bold text-white"
                        onClick={() => generateTemplate("response")}
                      >
                        <div>Generate</div>
                        {loading && <div className="penora-loader"></div>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Intro */}
                {currTemplate === "intro" && (
                  <div id="">
                    <p className="penora-labe text-sm">
                      What are the main points or outline?
                    </p>
                    <input
                      onChange={(e) => {
                        setInput1(e.target.value);
                      }}
                      id="penora-templates-thesis-input"
                      className="popover-textarea-small"
                      placeholder="Played a crucial role in the development of modern computing."
                    />
                    <p className="penora-label penora-label-2 mt-2 text-sm">
                      Main thesis / argument
                    </p>
                    <input
                      onChange={(e) => {
                        setInput2(e.target.value);
                      }}
                      id="penora-templates-tone-input"
                      className="popover-textarea-small"
                      placeholder="Turing should not have been castrated"
                    />
                    <p className="penora-label penora-label-2 mt-2 text-sm">
                      Tone of voice
                    </p>
                    <input
                      onChange={(e) => {
                        setInput3(e.target.value);
                      }}
                      id="penora-templates-tone-input"
                      className="popover-textarea-small"
                      placeholder="Informative, Witty"
                    />
                    <div className="mx-auto mt-4 flex w-full flex-row items-center justify-between">
                      <FaArrowLeft
                        className="ml-1 cursor-pointer"
                        onClick={goBackToOptionsScreen}
                      />
                      <div
                        className="mr-2 flex cursor-pointer flex-row items-center gap-2 rounded-lg bg-black px-4 py-1 text-sm font-bold text-white"
                        onClick={() => generateTemplate("intro")}
                      >
                        <div>Generate</div>
                        {loading && <div className="penora-loader"></div>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Conclusion */}
                {currTemplate === "conclusion" && (
                  <div id="">
                    <p className="penora-label text-sm">
                      What are the main points or outline?
                    </p>
                    <input
                      onChange={(e) => {
                        setInput1(e.target.value);
                      }}
                      id="penora-templates-thesis-input"
                      className="popover-textarea-small"
                      placeholder="Turing played a crucial role in the US war effort."
                    />
                    <p className="penora-label penora-label-2 mt-2 text-sm">
                      Main thesis / argument
                    </p>
                    <input
                      onChange={(e) => {
                        setInput2(e.target.value);
                      }}
                      id="penora-templates-tone-input"
                      className="popover-textarea-small"
                      placeholder="Turing should not have been castrated"
                    />
                    <p className="penora-label penora-label-2 mt-2">
                      Tone of voice
                    </p>
                    <input
                      onChange={(e) => {
                        setInput3(e.target.value);
                      }}
                      id="penora-templates-tone-input"
                      className="popover-textarea-small"
                      placeholder="Informative, Witty"
                    />
                    <div className="mx-auto mt-4 flex w-full flex-row items-center justify-between">
                      <FaArrowLeft
                        className="ml-1 cursor-pointer"
                        onClick={goBackToOptionsScreen}
                      />
                      <div
                        className="mr-2 flex cursor-pointer flex-row items-center gap-2 rounded-lg bg-black px-4 py-1 text-sm font-bold text-white"
                        onClick={() => generateTemplate("conclusion")}
                      >
                        <div>Generate</div>
                        {loading && <div className="penora-loader"></div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {showTemplateOptions && (
              <div className="space-y-4 p-4">
                <button
                  className=""
                  onClick={() => handleTemplateClick("outline")}
                >
                  <p className="title">Outline Generator 🧾</p>
                </button>
                <hr className="" />
                <button
                  className=""
                  onClick={() => handleTemplateClick("response")}
                >
                  <p className="title">Response ✍️</p>
                </button>
                <hr className="" />

                <button
                  className=""
                  onClick={() => handleTemplateClick("intro")}
                >
                  <p className="title">Introduction ☀️</p>
                </button>
                <hr className="" />
                <button
                  className=""
                  onClick={() => handleTemplateClick("conclusion")}
                >
                  <p className="title">Conclusion 📨</p>
                </button>
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
              ? "z-10 flex cursor-pointer cursor-pointer justify-center from-gray-300 to-white hover:bg-gradient-to-r "
              : "relative z-10 mt-8 flex h-14 w-14 cursor-pointer justify-center from-gray-300 to-white hover:bg-gradient-to-r"
          }
        >
          {isMobile ? (
            <Image
              src="/images/templates.png"
              className="object-contain"
              width={30}
              height={60}
              alt="Sidebar Image"
            />
          ) : (
            <Tooltip content="Templates">
              <Image
                src="/images/templates.png"
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

export default TemplatePopover;
