import { useState, useEffect } from "react";
import Image from "next/image";
import Popover from "../shared/popover";
import AppPopover from "../app-home/popovers/popover-webapp";
import ConchPopover from "../app-home/popovers/conch-popover";
import RewritePopover from "../app-home/popovers/rewrite-popover";
import { isMobile } from "react-device-detect";
import TemplatePopover from "../app-home/popovers/template-popover";
import SummaryPopover from "../app-home/popovers/summary-popover";
import Tooltip from "../shared/tooltip";
import { Google } from "../shared/icons";
import mixpanel from "mixpanel-browser";
import SettingsPopover from "../app-home/popovers/settings-popover";
import { useAuth } from "context/AuthContext";

// Props for Sidebar
interface SidebarProps {
  handleGenerateConch: (text: string) => void;
  handleTemplateGen: (text: string) => void;
  selectedText: string;
  currDocument: Record<string, any>;
  setCurrDocument: (doc: Record<string, any>) => void;
  setShowOutOfTokensModal: (show: boolean) => void;
  handlePopOpen: () => void;
}

export default function Sidebar({
  handleGenerateConch,
  handleTemplateGen,
  selectedText,
  currDocument,
  setCurrDocument,
  setShowOutOfTokensModal,
  handlePopOpen
}: SidebarProps) {
  const [hasExtension, setHasExtension] = useState(false);

  const { mongoDBUser } = useAuth();

  useEffect(() => {
    if (mongoDBUser) {
      const hasTheExtension = mongoDBUser.hasExtension as boolean;
      setHasExtension(hasTheExtension);
    }
  }, [mongoDBUser]);

  return (
    <div
      className={
        isMobile
          ? "z-5 fixed bottom-0 flex h-14 w-full items-center justify-around"
          : "flex h-screen w-14 flex-col items-center justify-between bg-white"
      }
    >
      {isMobile ? (
        <div className="absolute inset-x-0 inset-y-0 w-full bg-cover">
          <Image
            src="/mobilebar.png"
            width={100}
            height={100}
            alt="Sidebar Image"
            className="h-full w-full bg-white"
          />
        </div>
      ) : (
        <div className="absolute h-full bg-cover">
          <Image
            src="/sidebarbg.png"
            width={100}
            height={100}
            alt="Sidebar Image"
            className="h-full"
          />
        </div>
      )}
      {/* Conch Popover */}
      <div></div>
      <div
        className={`${
          isMobile ? "ml-6 mr-5 w-full flex-row justify-between" : "flex-col"
        } z-10 flex items-center`}
      >
        <ConchPopover
          handleGenerateConch={handleGenerateConch}
          userData={mongoDBUser}
          setShowOutOfTokensModal={setShowOutOfTokensModal}
          handlePopOpen={handlePopOpen}
          currDocument={currDocument}
        />
        <RewritePopover
          selectedText={selectedText}
          userData={mongoDBUser}
          setShowOutOfTokensModal={setShowOutOfTokensModal}
          handlePopOpen={handlePopOpen}
        />
        <TemplatePopover
          handleTemplateGen={handleTemplateGen}
          userData={mongoDBUser}
          setShowOutOfTokensModal={setShowOutOfTokensModal}
          handlePopOpen={handlePopOpen}
          currDocument={currDocument}
        />
        {/* <SummaryPopover selectedText={selectedText} /> */}
        {!hasExtension && !isMobile && (
          <Tooltip content="Chrome Extension">
            <a
              href="https://chrome.google.com/webstore/detail/conch-ai/namibaeakmnknolcnomfdhklhkabkchl?hl=en&authuser=0"
              target="_blank"
              rel="noreferrer"
              className="mt-12"
            >
              <button onClick={() => mixpanel.track("clicked chrome sidebar")}>
                <Google className="z-11 relative  h-8" />
              </button>
            </a>
          </Tooltip>
        )}
        {isMobile && <SettingsPopover
          currDocument={currDocument}
          setCurrDocument={setCurrDocument}
        />}
      </div>
      <div>
        {!isMobile && <SettingsPopover
          currDocument={currDocument}
          setCurrDocument={setCurrDocument}
        />}
      </div>
    </div>
  );
}
