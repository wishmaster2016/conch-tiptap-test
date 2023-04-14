import Tooltip from "@/components/shared/tooltip";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { isMobile } from "react-device-detect";
import { makePostRequest } from "utils/requests";
import AppPopover from "./popover-webapp";
import { useAdQueueModal } from "@/components/AdQueueModal";
import mixpanel from "mixpanel-browser";
import { SECOND_BACKEND_URL } from "utils/constants";

interface SettingsPopoverProps {
  currDocument: Record<string, any>;
  setCurrDocument: (doc: Record<string, any>) => void;
}

const SettingsPopover = ({
  currDocument,
  setCurrDocument,
}: SettingsPopoverProps) => {
  const [conchPopover, setConchPopover] = useState(false);
  const [documentDescription, setDocumentDescription] = useState<string>("");
  const [contentStyle, setContentStyle] = useState<string>("Academic");
  const [citationType, setCitationType] = useState<string>("MLA");
  const [suggestedTextEnabled, setSuggestedTextEnabled] = useState<boolean>(false);

  const { showAdQueueModal, AdQueueModal, setShowAdQueueModal } =
    useAdQueueModal();

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const suggestedTextEnabled = localStorage.getItem("suggestedTextEnabled");
    if (suggestedTextEnabled) {
      setSuggestedTextEnabled(suggestedTextEnabled === "true" );
    }
  }, []);

  const handleSuggestedTextSelect = (val: string) => {
    setSuggestedTextEnabled(val== "true")
    localStorage.setItem("suggestedTextEnabled", val);
  }


  /**
   * Set the initial settings from the current document
   */
  useEffect(() => {
    if (currDocument) {
      setDocumentDescription(currDocument.documentDescription);
      setContentStyle(currDocument.contentStyle);
      setCitationType(currDocument.citationType);
    }
  }, [currDocument]);

  const changeCitationType = (val: string) => {
    setCitationType(val);
    mixpanel.track("changed citation type", { "citation type": val });
  };
  const changeContentType = (val: string) => {
    setContentStyle(val);
    mixpanel.track("changed content type", { "content type": val });
  };

  const saveSettings = () => {
    mixpanel.track("clicked save settings");

    setLoading(true);
    makePostRequest(
      `${SECOND_BACKEND_URL}/api/writing/storage/update-essay-settings`,
      {
        _id: currDocument._id,
        documentDescription,
        contentStyle,
        citationType,
      },
    ).then((res) => {
      setLoading(false);
      setConchPopover(false);
      // update document locally
      setCurrDocument({
        ...currDocument,
        documentDescription,
        contentStyle,
        citationType,
      });
    });
  };

  return (
    <div>
      <AdQueueModal />
      <AppPopover
        className="conch-popover-large overflow-hidden"
        content={
          <div className="mr-2 flex h-full w-full flex-col justify-center rounded-md  px-4 text-sm">
            <p className="conch-popover-label mt-4 ml-1">
              Document Description
            </p>
            <textarea
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              className="popover-textarea-small h-12 rounded-md border-slate-300 text-sm outline-none"
              placeholder="Guide Conch to generate better sentences, eg: This is a research paper on the history of the internet."
            ></textarea>
            <div className="mt-4 flex flex-row items-center  justify-between">
              <p className="conch-popover-label ml-2">Content Style</p>
              <select
                name="penora-length-select"
                className="flex items-center justify-center rounded-lg border-slate-300 py-0 text-sm outline-none outline-0"
                id="penora-rewrite-length-select text-black"
                value={contentStyle}
                onChange={(e) => setContentStyle(e.target.value)}
              >
                <option value="Academic">Academic</option>
                <option value="Friendly">Friendly</option>
                <option value="Professional">Professional</option>
                <option value="Persuasive">Persuasive</option>
                <option value="Confident">Confident</option>
              </select>
            </div>
            <div className="mt-4 flex flex-row items-center  justify-between">
              <p className="conch-popover-label ml-2">Citation Type</p>
              <select
                name="penora-length-select"
                className="flex items-center justify-center rounded-lg border-slate-300 py-0 text-sm outline-none outline-0"
                id="penora-rewrite-length-select text-black"
                value={citationType}
                onChange={(e) => setCitationType(e.target.value)}
              >
                <option value="MLA">MLA</option>
                <option value="APA">APA</option>
              </select>
            </div>
            <div className="mt-4 flex flex-row items-center  justify-between">
              <p className="conch-popover-label ml-2">Suggested Text Enabled</p>
              <select
                name="penora-length-select"
                className="flex items-center justify-center rounded-lg border-slate-300 py-0 text-sm outline-none outline-0"
                id="penora-rewrite-length-select text-black"
                value={suggestedTextEnabled.toString()}
                onChange={(e) => handleSuggestedTextSelect(e.target.value)}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
            <div className="mt-6 ml-2 flex items-center justify-end">
              <div
                className=" flex cursor-pointer flex-row items-center gap-2 rounded-lg bg-black px-4 py-1 text-sm font-bold text-white"
                onClick={() => saveSettings()}
              >
                Save Settings
                {loading && <div className="penora-loader"></div>}
              </div>
            </div>
          </div>
        }
        openPopover={conchPopover}
        setOpenPopover={setConchPopover}
      >
        <div
          onClick={() => setConchPopover(true)}
          className={
            isMobile
              ? "relative z-10 mr-2 flex w-6 cursor-pointer justify-center from-gray-300 to-white hover:bg-gradient-to-r "
              : "relative z-10  flex h-14 w-14 cursor-pointer justify-center from-gray-300 to-white hover:bg-gradient-to-r"
          }
        >
          {isMobile ? (
            <Image
              src="/images/settings.png"
              className="object-contain"
              width={35}
              height={35}
              alt="Sidebar Image"
            />
          ) : (
            <Tooltip content="Rewrite">
              <Image
                src="/images/settings.png"
                className="object-contain"
                width={30}
                height={30}
                alt="Sidebar Image"
              />
            </Tooltip>
          )}
        </div>
      </AppPopover>
    </div>
  );
};

export default SettingsPopover;
