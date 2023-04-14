import "@/styles/globals.css";
import "@/styles/chatbot.css";
import 'react-chatbot-kit/build/main.css'
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Provider as RWBProvider } from "react-wrap-balancer";
import cx from "classnames";
import localFont from "@next/font/local";
import { Inter } from "@next/font/google";
import { initializeApp } from "firebase/app";
import { toast, Toaster } from "react-hot-toast";
import { RouteGuard } from "@/components/routing/route-guard";
import { useEffect } from "react";
import mixpanel from "mixpanel-browser";
import * as ga from "../lib/ga";
import { useRouter } from "next/router";
import { useState } from "react";
import { LOCAL_STORAGE_KEY } from "utils/local-storage";
import { SITE_VERSION } from "utils/constants";
import "react-contexify/ReactContexify.css";
import { signOutFirebase } from "firebase-utils/user";
import { AuthProvider } from "context/AuthContext";
import ConchChatbot from "../components/chatbot/ConchChatbot";

const sfPro = localFont({
  src: "../styles/SF-Pro-Display-Medium.otf",
  variable: "--font-sf",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  const [userData, setUserData] = useState<Record<string, any>>({});

  const router = useRouter();

  useEffect(() => {
    // toast.remove();
    // toast.error("Server will be down for 10 mins for maintenance", {
    //   duration: 7500,
    // });
  }, []);

  const signOut = () => {
    mixpanel.track("sign out account modal");
    localStorage.removeItem(LOCAL_STORAGE_KEY.USER_ID); 
    window.location.reload();
    signOutFirebase();   
  };

  const refreshPageIfNotLatestVersion = () => {
    if (localStorage.getItem(LOCAL_STORAGE_KEY.SITE_VERSION) !== SITE_VERSION) {
      localStorage.setItem(LOCAL_STORAGE_KEY.SITE_VERSION, SITE_VERSION);
      router.reload();
      signOut();
    }
  };

  useEffect(() => {
    refreshPageIfNotLatestVersion();
  }, []);

  useEffect(() => {
    // initialize Mixpanel
    mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_API_KEY!, {
      debug: true,
      ignore_dnt: true,
    });

    const handleRouteChange = (url: string) => {
      ga.pageview(url);
    };
    //When the component is mounted, subscribe to router changes
  }, []);

  return (
    <AuthProvider>
      <Toaster />
      <RWBProvider>
        <div className={cx(sfPro.variable, inter.variable)}>
          <RouteGuard>
            <>
              <Component {...pageProps} />
              <ConchChatbot />
            </>
          </RouteGuard>
        </div>
      </RWBProvider>
      <Analytics />
    </AuthProvider>
  );
}
