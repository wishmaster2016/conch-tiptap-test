import Tooltip from "@/components/shared/tooltip";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { FaRegQuestionCircle } from "react-icons/fa";
import { SECOND_BACKEND_URL } from "utils/constants";
import { makePostRequest } from "utils/requests";
import AppPopover from "./popover-webapp";
import { useAdQueueModal } from "@/components/AdQueueModal";
import { incrementClicks } from "@/lib/utils";
import mixpanel from "mixpanel-browser";
import { toast } from "react-hot-toast";

interface ConchPopoverProps {
  handleGenerateConch: (text: string) => void;
  userData: Record<string, any>;
  setShowOutOfTokensModal: (show: boolean) => void;
  handlePopOpen: () => void;
  currDocument: Record<string, any>;
}

const ConchPopover = ({
  handleGenerateConch,
  userData,
  setShowOutOfTokensModal,
  handlePopOpen,
  currDocument
}: ConchPopoverProps) => {
  const [conchPopover, setConchPopover] = useState(false);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isUserPro, setIsUserPro] = useState<boolean>(false);

  const { showAdQueueModal, AdQueueModal, setShowAdQueueModal } =
    useAdQueueModal();

  useEffect(() => {
    setIsUserPro(userData && userData.currPlan && userData.currPlan.length > 0);
  }, [userData]);

  useEffect(() => { 
    setLoading(false);
  }, [conchPopover]);

  const makeConchRequest = async () => {
    if (userData.currTokensLeft < 0) {
      mixpanel.track("show out of tokens conch");
      setShowOutOfTokensModal(true);
      return;
    }
    mixpanel.track("clicked generate conch");
    const numClicks = incrementClicks();
    if (numClicks >= 3 && !isUserPro) {
      mixpanel.track("show ad generate conch");
      setShowAdQueueModal(true);
      return;
    }

    setLoading(true);

    const payload = {
      query: currDocument && currDocument.documentDescription && currDocument.contentStyle ?
         `A student is writing an essay about ${currDocument.documentDescription}. The student is writing in a ${currDocument.contentStyle} style. They are issuing you the following command: ${query}`
          : query
    }

    makePostRequest(`${SECOND_BACKEND_URL}/ai/api/generate-conch-alternate`, payload)
      .then((res) => {
        const reqId = res.data;

        // Keep checking for response every X Seconds
        const POLLING_RATE = 3 * 1000;
        const MAX_POLLING_ATTEMPTS = 25;

        let pollingAttempts = 0;
        const interval = setInterval(() => {
          // If max polling attempts reached, stop polling
          if (pollingAttempts >= MAX_POLLING_ATTEMPTS) {
            clearInterval(interval);
            return;
          }

          // Make request to check if response is ready
          makePostRequest(`${SECOND_BACKEND_URL}/ai/api/get-conch-response`, {
            reqId,
          })
            .then((res: Record<string, any>) => {
              const response = res.data;

              // If a response is retrieved and processed = true, stop polling
              if (response && response.processed) {
                // Clear interval
                clearInterval(interval);

                setConchPopover(!conchPopover);
                setLoading(false);

                // Handle conch response
                handleGenerateConch(response.response);
              } else {
                console.log("Response not ready yet");
              }
            })
            .catch((err) => {
              console.log(err);
              setConchPopover(false);
            });

          // Increment polling attempts
          pollingAttempts++;
        }, POLLING_RATE);

        // insertTextIntoFocusedElement(response, customDocument, isIframe);
      })
      .catch((err) => {
        // if response code = 402
        if (err.response && err.response.status === 402) {
          // show out of tokens modal
          setShowOutOfTokensModal(true);
        } else {
          console.log(err);
          setLoading(false);
          toast.error("Something went wrong. Please save document, refresh, and try again.");
        }
      });
  };

  const openPopOver = () => {
    mixpanel.track("clicked Open Conch Popover")
    setConchPopover(true);
    handlePopOpen();
  }

  return (
    <div>
      <AdQueueModal />
      <AppPopover
        className="conch-popover overflow-x-hidden"
        content={
          <div className="mr-2 flex h-full w-full flex-col justify-center rounded-md py-2 px-6 text-sm">
            <p className="">What is your command?</p>
            <textarea
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
              className="popover-textarea mt-2"
              placeholder="Write a 300 word story about a monster in J.K Rowling's style &#10; - Generate 5 stats on impact plastics on the environment &#10;- Who was Napolean? "
            ></textarea>
            <div className="mt-4 ml-2 flex items-center justify-between">
              <a
                href="https://getconch.ai/onboarding"
                target="_blank"
                rel="noreferrer"
              >
                <FaRegQuestionCircle />
              </a>
              <div
                className=" mr-2 flex cursor-pointer flex-row items-center gap-2 rounded-lg bg-black px-4 py-1 text-sm font-bold text-white"
                onClick={() => makeConchRequest()}
              >
                Generate
                {loading && <div className="penora-loader"></div>}
              </div>
            </div>
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
              src="/images/conch.png"
              className="object-contain"
              width={30}
              height={60}
              alt="Sidebar Image"
            />
          ) : (
            <Tooltip content="Conch">
              <Image
                src="/images/conch.png"
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

export default ConchPopover;
