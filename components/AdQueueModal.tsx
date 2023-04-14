import Modal from "@/components/shared/modal";
import {
  useState,
  SetStateAction,
  Dispatch,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import mixpanel from "mixpanel-browser";
import { toast } from "react-hot-toast";
import { LOCAL_STORAGE_KEY } from "utils/local-storage";
import { signOutFirebase } from "firebase-utils/user";
import { decryptHash, generateHash, resetClicks } from "@/lib/utils";
import ReactPlayer from "react-player/lazy";
import { isMobile } from "react-device-detect";

const AdQueueModal = ({
  showAdQueueModal,
  setShowAdQueueModal,
}: {
  showAdQueueModal: boolean;
  setShowAdQueueModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const [signInClicked, setSignInClicked] = useState(false);
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [showAdOne, setShowAdOne] = useState(false);

  useEffect(() => {
    mixpanel.track("Load AdQueueModal");
    // logic to show either ad one or two
    if (showAdQueueModal) {
      const coinFlip = Math.round(Math.random());
      if (coinFlip >= 0.5) {
        setShowAdOne(true);
      } else {
        setShowAdOne(false);
      }
      const rStop = Math.floor(Math.random() * (20 - 1 + 1) + 1);
      const closeInXSecs = 60000 - rStop * 1000;

      const timer = setTimeout(() => {
        console.log("This will run after 1 second!", rStop, closeInXSecs);
        setShowAdQueueModal(false);
        resetClicks();
      }, closeInXSecs);
      return () => clearTimeout(timer);
    }
  }, []);


  return (
    <Modal
      showModal={showAdQueueModal}
      setShowModal={setShowAdQueueModal}
      isAd={true}
    >
      <div className="flex h-fit w-full flex-col items-center justify-center bg-white p-8 shadow-xl md:max-w-xl md:rounded-2xl md:border md:border-gray-200">
        <div className="mb-4 text-lg font-semibold">
          Due to high volume. You're waiting in Queue (~30 secs)
        </div>
        <div className="w-fit justify-center rounded-lg bg-white p-2">
          <ReactPlayer
            url={`${
              showAdOne
                ? "https://vimeo.com/808431999"
                : "https://vimeo.com/808427728"
            }`}
            playing={true}
            controls={isMobile ? true : false}
            autoplay={true}
            muted
            loop={true}
            volume={0}
            width={"500px"}
            playsinline
            className=""
          />
        </div>
        <div className="mt-8 flex gap-4  space-y-4 rounded-lg pt-2 md:px-16">
          <div className="flex h-24 w-full flex-col items-center justify-center text-lg transition-all duration-75 focus:outline-none">
            <div className="mb-2 text-center text-sm text-gray-500">
              To make Conch accessible to everyone, we are giving Pro and
              Limitless users priority. Want to skip the line & save time?
            </div>
            <a target="_blank" rel="noopener noreferrer" href="https://getconch.ai/upgrade">
              <motion.button
                onClick={() => mixpanel.track("Clicked Upgarde AdQueue Modal")}
                className="mb-4 flex max-w-fit items-center justify-center overflow-hidden rounded-lg border-red-700 bg-red-200 bg-gradient-to-r from-indigo-400 to-indigo-700 px-4 py-2 drop-shadow-lg transition-colors"
              >
                <p className="text-md font-semibold text-white ">🚀 Upgrade</p>
              </motion.button>
              </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export function useAdQueueModal() {
  const [showAdQueueModal, setShowAdQueueModal] = useState(false);

  const showAdQueueModalCallback = useCallback(() => {
    return (
      <AdQueueModal
        showAdQueueModal={showAdQueueModal}
        setShowAdQueueModal={setShowAdQueueModal}
      />
    );
  }, [showAdQueueModal, setShowAdQueueModal]);

  return useMemo(
    () => ({
      showAdQueueModal,
      setShowAdQueueModal,
      AdQueueModal: showAdQueueModalCallback,
    }),
    [showAdQueueModal, setShowAdQueueModal, showAdQueueModalCallback],
  );
}
