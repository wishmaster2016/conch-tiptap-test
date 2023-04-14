import Modal from "@/components/shared/modal";
import {
  useState,
  SetStateAction,
  Dispatch,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { LoadingDots, Google } from "@/components/shared/icons";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import mixpanel from "mixpanel-browser";
import { toast } from "react-hot-toast";
import { LOCAL_STORAGE_KEY } from "utils/local-storage";
import { signOutFirebase } from "firebase-utils/user";
import { decryptHash, generateHash } from "@/lib/utils";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { SECOND_BACKEND_URL } from "utils/constants";
import { useAuth } from "context/AuthContext";

const SignInModal = ({
  showAccountModal,
  setShowAccountModal,
}: {
  showAccountModal: boolean;
  setShowAccountModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const [currTokens, setCurrTokens] = useState(0);
  const [maxTokens, setMaxTokens] = useState(750);
  const [showTopups, setShowTopups] = useState(false);

  const {     
    loadedInData,
    isLoggedIn,
    firebaseUser,
    mongoDBUser,
    logout
  } = useAuth();

  const copyToClipboard = () => {
    toast.remove();
    toast.success("Copied to clipboard!");
    mixpanel.track("copy referral account modal");
    if (mongoDBUser.numRefs) {
      //prettier-ignore
      mixpanel.people.set({ "numRefs": mongoDBUser.numRefs });
    }
    const hash = generateHash(mongoDBUser.email);
    navigator.clipboard.writeText(
      `https://getconch.ai/login?referredBy=${hash}`,
    );
  };

  const signOut = () => {
    logout();
  };

  useEffect(() => {
    setCurrTokens(mongoDBUser.currTokensLeft);
    setMaxTokens(mongoDBUser.maxTokensGiven);
  }, [mongoDBUser]);

  const goBackToAccount = () => {
    mixpanel.track("clicked back to account modal");
    setShowTopups(false);
  };

  const [paymentLinks, setPaymentLinks] = useState<Record<string, any>>({});

  const getPaymentLinks = async () => {
    const urlEncodedEmail = encodeURIComponent(mongoDBUser.email);
    const urlEncodedId = encodeURIComponent(mongoDBUser.userId);
    // make post request to axios to get payment links
    let parameters = `?client_reference_id=${urlEncodedId}&prefilled_email=${urlEncodedEmail}`; 
    let paymentLinks = {
      /* New Plans */
      'topUp1000' : 'https://buy.stripe.com/aEUdU8263c576zf0eJ2f' + parameters,
      'topUp5000' : 'https://buy.stripe.com/eVa7vKcKHglng9PbXr2g' + parameters,
      'topUp10000' : 'https://buy.stripe.com/eVa2bqeSP4CFcXD3qV2h' + parameters,
    }

    setPaymentLinks(paymentLinks);
  };

  const openTopUp = (topupType: string) => {
    mixpanel.track("clicked topup 1000");
    window.open(paymentLinks[topupType], "_blank");
  };

  useEffect(() => {
    getPaymentLinks();
  }, [mongoDBUser]);


  return (
    <Modal showModal={showAccountModal} setShowModal={setShowAccountModal}>
      {loadedInData ? (
        <div className="flex h-fit w-full flex-col items-center justify-center bg-white p-8 shadow-xl md:max-w-md md:rounded-2xl md:border md:border-gray-200">
          {showTopups ? (
            <div className="mb-4 flex h-fit w-full flex-col items-center ">
              <div className="flex h-12 w-full items-center justify-between">
                <button onClick={() => goBackToAccount()}>
                  <FaArrowLeft />
                </button>
                <div className="text-lg">Token Top-ups</div>
                <FaArrowLeft className="invisible" />
              </div>
              <Image
                alt="token topups"
                src="/landing/topup.png"
                width={200}
                height={200}
                className="m-4"
              />
              <motion.div className="container mb-4 flex flex-col items-center justify-center rounded-lg pt-2">
                <div className="flex h-8 w-full items-center justify-between rounded-full bg-violet-300 text-lg transition-all duration-75 focus:outline-none">
                  <div
                    className="flex h-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-400 to-indigo-700 px-4 transition-colors"
                    style={{ width: `${(currTokens / maxTokens) * 100}%` }}
                  ></div>
                </div>

                {mongoDBUser &&
                mongoDBUser.currPlan &&
                mongoDBUser.currPlan.toLowerCase().includes("limitless") ? (
                  <p>♾ Tokens</p>
                ) : (
                  <p className="ml-2 flex w-full justify-start">
                    {currTokens} / {maxTokens} Tokens 🪙
                  </p>
                )}
              </motion.div>
              <div className="md:px-18 flex flex-col justify-center rounded-lg px-4 pt-2">
                <div className="flex h-12 w-96 w-full justify-between text-lg transition-all duration-75 focus:outline-none">
                  <div className="font-bold">1000 Tokens</div>
                    <button
                      onClick={() => openTopUp("topUp1000")}
                      className="underline font-semibold text-violet-700 "
                    >
                      Unlock 🔓
                    </button>
                </div>
              </div>
              <div className="flex flex-col justify-center rounded-lg px-4 pt-2 md:px-16">
                <div className="flex h-12 w-96 w-full justify-between text-lg transition-all duration-75 focus:outline-none">
                  <div className="font-bold">5000 Tokens</div>
                    <button
                      onClick={() => openTopUp("topUp5000")}
                      className="underline font-semibold text-violet-700 "
                    >
                      Unlock 🔓
                    </button>
                </div>
              </div>
              <div className="flex flex-col space-y-4 rounded-lg px-4 pt-2 md:px-16 ">
                <div className="flex h-12 w-96 justify-between text-lg transition-all duration-75 focus:outline-none">
                  <div className="font-bold">10,000 Tokens</div>
                    <button
                      onClick={() => openTopUp("topUp10000")}
                      className="underline font-semibold text-violet-700 "
                    >
                      Unlock 🔓
                    </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-fit w-full flex-col items-center">
              <div className="mb-4 text-lg">Your Account Details</div>

              <motion.div className="container mb-4 flex flex-col items-center justify-center rounded-lg pt-2">
                <div className="flex h-8 w-full items-center justify-between rounded-full bg-violet-300 text-lg transition-all duration-75 focus:outline-none">
                  {mongoDBUser &&
                  mongoDBUser.currPlan &&
                  mongoDBUser.currPlan.toLowerCase().includes("limitless") ? (
                    <div
                      className="flex h-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-yellow-400 to-yellow-700 px-4 transition-colors"
                      style={{ width: `100%` }}
                    ></div>
                  ) : (
                    <div
                      className="flex h-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-400 to-indigo-700 px-4 transition-colors"
                      style={{ width: `${(currTokens / maxTokens) * 100}%` }}
                    ></div>
                  )}
                </div>
                {mongoDBUser &&
                mongoDBUser.currPlan &&
                mongoDBUser.currPlan.toLowerCase().includes("limitless") ? (
                  <p>♾ Tokens</p>
                ) : (
                  <p className="ml-2 flex w-full justify-start">
                    {currTokens} / {maxTokens} Tokens 🪙
                  </p>
                )}
              </motion.div>
              <div className="p-4 drop-shadow-lg">
                {mongoDBUser &&
                mongoDBUser.currPlan &&
                mongoDBUser.currPlan.toLowerCase().includes("limitless") ? (
                  <Image
                    alt="profile image"
                    src={`/pricing/superconch.png`}
                    width={140}
                    height={140}
                  />
                ) : mongoDBUser &&
                  mongoDBUser.currPlan &&
                  mongoDBUser.currPlan.length > 0 ? (
                  <Image
                    alt="profile image"
                    src={`/pricing/roboconch.png`}
                    width={140}
                    height={140}
                  />
                ) : (
                  <Image
                    alt="profile image"
                    src={`/pricing/conchfree.png`}
                    width={140}
                    height={140}
                  />
                )}
              </div>
              <div className="flex flex-col justify-center rounded-lg px-4 pt-2 md:px-16">
                <div className="flex h-12 w-96 w-full justify-between text-lg transition-all duration-75 focus:outline-none">
                  <div className="font-bold">Current Plan:</div>
                  {mongoDBUser &&
                  mongoDBUser.currPlan &&
                  mongoDBUser.currPlan.length > 0 ? (
                    <p>{mongoDBUser && mongoDBUser.currPlan}</p>
                  ) : (
                    <p>Free</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center rounded-lg px-4 pt-2 md:px-16">
                <div className="flex h-12 w-96 w-full justify-between text-lg transition-all duration-75 focus:outline-none">
                  <div className="font-bold">Email:</div>
                  <p>{mongoDBUser && mongoDBUser.email}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-4 rounded-lg px-4 pt-2 md:px-16 ">
                <div className="flex h-12 w-96 justify-between text-lg transition-all duration-75 focus:outline-none">
                  <div className="font-bold">Tokens:</div>
                  {mongoDBUser &&
                  mongoDBUser.currPlan &&
                  mongoDBUser.currPlan.toLowerCase().includes("limitless") ? (
                    <p>♾</p>
                  ) : (
                    <p>{mongoDBUser && mongoDBUser.currTokensLeft}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-4 rounded-lg px-4 pt-2 md:px-16 ">
                <div className="flex h-12 w-96 justify-between text-lg transition-all duration-75 focus:outline-none">
                  <div className="font-bold">Submit bug report / feedback</div>
                  <a
                    href="https://tally.so/r/n0drzZ"
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-500 underline"
                  >
                    here
                  </a>
                </div>
              </div>

              <div className="flex flex-col space-y-4 rounded-lg px-4 pt-2 md:px-16 ">
                <div className="flex h-12 w-96 justify-between text-lg transition-all duration-75 focus:outline-none">
                  <div className="font-bold">
                    {mongoDBUser &&
                    mongoDBUser.currPlan &&
                    mongoDBUser.currPlan.length > 0
                      ? "Manage your account"
                      : "You're on the free plan"}
                  </div>
                  {mongoDBUser &&
                  mongoDBUser.currPlan &&
                  mongoDBUser.currPlan.length > 0 ? (
                    <a
                      href="https://billing.stripe.com/p/login/bIY6opa1Pa4veEU4gg"
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg font-semibold text-violet-500 underline"
                    >
                      here
                    </a>
                  ) : (
                    <motion.button
                      onClick={() => mixpanel.track("Clicked Upgrade Settings")}
                      className="mb-5 flex max-w-fit items-center justify-center  overflow-hidden rounded-lg bg-black px-10 py-4 drop-shadow-lg transition-colors"
                    >
                      <Link
                        href="/upgrade"
                        className="text-md font-semibold text-white"
                      >
                        🚀 Upgrade
                      </Link>
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4 space-y-4  rounded-lg pt-2 md:px-16 ">
                <div className="flex h-12 w-96 justify-between items-center text-lg transition-all duration-75 focus:outline-none">
                  <div className="font-bold">Need more tokens?</div>
                  <Link href="/earn" rel="noreferrer">
                    <motion.button
                      onClick={() =>
                        mixpanel.track("Clicked Earn Account Modal")
                      }
                      className="flex w-32 mr-1 items-center justify-center overflow-hidden rounded-lg border-red-700 bg-red-200 bg-gradient-to-r from-indigo-400 to-indigo-700 px-4 py-2 transition-colors"
                    >
                      <p className="text-sm font-semibold text-white ">
                        Conch Earn
                      </p>
                    </motion.button>
                  </Link>
                  {mongoDBUser &&
                  mongoDBUser.currPlan &&
                  mongoDBUser.currPlan.toLowerCase().includes("limitless") ? (
                    <> </>
                  ) : (
                    <motion.button
                      onClick={() => {
                        setShowTopups(true);
                      }}
                      className="flex max-w-fit items-center justify-center overflow-hidden rounded-lg border-red-700 bg-red-200 bg-gradient-to-r from-violet-400 to-violet-700 px-4 py-2 transition-colors"
                    >
                      <p className="text-sm font-semibold text-white">Topups</p>
                    </motion.button>
                  )}
                </div>
                <div className="flex h-12 w-96 justify-between text-lg transition-all duration-75 focus:outline-none items-center">
                  <div className="font-bold"></div>
                  <Link href="/earn" rel="noreferrer">
                    <motion.button
                      onClick={() =>
                        signOut()
                      }
                      className="flex max-w-fit items-center justify-center overflow-hidden rounded-lg border-red-700 bg-red-200 bg-gradient-to-r from-red-400 to-red-700 px-4 py-2 transition-colors"
                    >
                      <p className="text-sm font-semibold text-white ">
                        Logout
                      </p>
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          className="h-128 flex w-full flex-col items-center justify-center bg-white p-8 shadow-xl md:max-w-md md:rounded-2xl md:border md:border-gray-200"
          onClick={() => console.log("trapping")}
        >
          🧺 loading..
        </button>
      )}
    </Modal>
  );
};

export function useAccountModal() {
  const [showAccountModal, setShowAccountModal] = useState(false);

  const showAccountModalCallback = useCallback(() => {
    return (
      <SignInModal
        showAccountModal={showAccountModal}
        setShowAccountModal={setShowAccountModal}
      />
    );
  }, [showAccountModal, setShowAccountModal]);

  return useMemo(
    () => ({
      showAccountModal,
      setShowAccountModal,
      AccountModal: showAccountModalCallback,
    }),
    [showAccountModal, setShowAccountModal, showAccountModalCallback],
  );
}
