import { FADE_IN_ANIMATION_SETTINGS } from "@/lib/constants";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect } from "react";
import useScroll from "@/lib/hooks/use-scroll";
import Meta from "./meta";
import { useSignInModal } from "./sign-in-modal";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Popover from "../shared/popover";
import mixpanel from "mixpanel-browser";
import { isLoggedInFirebase } from "firebase-utils/user";
import { useAccountModal } from "../AccountModal";
import LoadingOverlay from "react-loading-overlay-ts";

import Navbar from "./navbar";
import Footer from "./footer";
import { useAuth } from "context/AuthContext";

export default function Layout({
  isLoading,
  meta,
  children,
}: {
  isLoading?: boolean;
  meta?: {
    title?: string;
    description?: string;
    image?: string;
  };
  children: ReactNode;
}) {
  const { showSignInModal, SignInModal, setShowSignInModal } = useSignInModal();
  const { showAccountModal, AccountModal, setShowAccountModal } =
    useAccountModal();
  const scrolled = useScroll(50);
  const [openPopover, setOpenPopover] = useState(false);

  const {     
    loadedInData,
    isLoggedIn,
    firebaseUser,
    mongoDBUser
  } = useAuth();


  return (
    <div className="layoutRoot">
      <LoadingOverlay
        active={isLoading}
        spinner
        className="fixed top-0 left-0 z-50 h-screen w-full"
      >
        <AccountModal />
        <Meta {...meta} />
        <SignInModal />
        <div className="fixed w-full bg-black" />
        <main className="contentContainer flex h-fit w-full flex-col items-center justify-center">
          <Navbar
            userData={mongoDBUser}
            loaded={loadedInData}
            scrolled={scrolled}
            isLoggedIn={isLoggedIn}
            showSignInModal={showSignInModal}
            setShowSignInModal={setShowSignInModal}
            setOpenPopover={setOpenPopover}
            openPopover={openPopover}
            setShowAccountModal={setShowAccountModal}
            showAccountModal={showAccountModal}
          />
          {children}
          <Footer />
        </main>
      </LoadingOverlay>
    </div>
  );
}
