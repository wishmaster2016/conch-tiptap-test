import React, { useLayoutEffect, useState } from 'react'
import { FADE_IN_ANIMATION_SETTINGS } from "@/lib/constants";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import UserDropdown from "./user-dropdown";
import mixpanel from "mixpanel-browser";
import { useEffect } from 'react';
import useScroll from "@/lib/hooks/use-scroll";
import DiscordIcon from "../../assets/socialIcons/discord.png";
import { useRouter } from "next/router";



function Navbar({ loaded, scrolled, userData, isLoggedIn, setShowSignInModal, setOpenPopover, openPopover, setShowAccountModal, showAccountModal, showSignInModal   }) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const scrolled1 = useScroll(50);
  const router = useRouter();
  
  useEffect(() => {
    if (loaded && isLoggedIn && (!userData.currPlan || userData.currPlan.length == 0))  {
      setShowUpgrade(true)
    } else {
      setShowUpgrade(false);
    }
  }, [loaded, isLoggedIn, userData]);

  return (
    <div
      className={` w-full ${
        scrolled1
          ? "border-b border-gray-200 bg-white/50 backdrop-blur-xl"
          : "bg-white/0"
      } z-30 transition-all`}
    >      
      <div className="mx-5 flex h-16 max-w-screen-xl items-center justify-between xl:mx-auto">
        <Link href="/" className="flex items-center font-display text-2xl">
          {router.asPath.includes("enhance") && (
           <Image
            src={`${"/ConchEnhancer.png"}`}
            alt="Conch AI Logo"
            width={`${router.asPath.includes("enhance") ? "150" : "125"}`}
            height="36"
            className="mr-2 rounded-sm"
          ></Image>
          )}
          {!router.asPath.includes("enhance") && <Image
            src={`${"/ConchLogo.png"}`}
            alt="Conch AI Logo"
            width={`${router.asPath.includes("enhance") ? "150" : "125"}`}
            height="36"
            className="mr-2 rounded-sm"
          ></Image>}
          {/* <h1 className="font-display text-3xl font-bold">Conch</h1> */}
        </Link>
        <div className="bg-color-white flex h-16 items-center justify-between">
          <div className="hidden md:block">
            <div className="ml-10 flex items-bottom space-x-4">
              <a
                href="https://chrome.google.com/webstore/detail/conch-ai/namibaeakmnknolcnomfdhklhkabkchl?hl=en&authuser=0"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-violet-500 hover:text-white flex items-center"
              >
               Get Chrome Extension
              </a>
              {!isLoggedIn &&
              <button onClick={() => mixpanel.track("clicked nav pricing")}>
                <Link
                  href="/upgrade"
                  rel="noreferrer"
                  target="_blank"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-violet-500 hover:text-white flex items-center"
                >
                  Pricing
                </Link>
              </button>
            }
          <button onClick={() => mixpanel.track("clicked nav writing assistant")}>
                <Link
                  href={`/${isLoggedIn ? "/app" : "sign-up"}`}
                  rel="noreferrer"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-violet-500 hover:text-white flex items-center"
                >
                  Writing Assistant
                </Link>
              </button> 
               
             <button onClick={() => mixpanel.track("clicked nav ai bypasser")}>
                <Link
                  href={`/${isLoggedIn ? "enhance" : "sign-up"}`}
                  rel="noreferrer"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-violet-500 hover:text-white flex items-center"
                >
                  Enhancer
                </Link>
              </button>
                {isLoggedIn ? (
                  <button
                  onClick={() => {
                    mixpanel.track("clicked nav my account");
                  setShowAccountModal(!showAccountModal);
                  }}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-violet-500 hover:text-white"
                  >
                    My Account
                  </button>
                ) : (
                  <div></div>
                                )}
                                {isLoggedIn &&    <a
                  href="https://discord.gg/6UGjBseV76"
                  rel="noreferrer"
                  target="_blank" 
                  className='rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-violet-500 hover:text-white flex items-center'
                >
                  <button  onClick={() => mixpanel.track("Clicked Nav Discord")} className="flex items-center align-center content-center">

                  <Image
                    src={DiscordIcon}
                    alt="discord"
                    width="24"
                    height="24"
                    className="rounded-sm relative"
                  ></Image>
                  </button>
                </a>}
              <button
                onClick={() => mixpanel.track("clicked nav upgrade to pro")}
                style={{ 
                  display: showUpgrade && isLoggedIn ? "block" : "none"
                }}
              >
                <Link
                  href= "/upgrade"
                  className="flex items-center mx-4 rounded-full border font-bold border-black bg-black p-1.5 px-4 text-sm text-white transition-all hover:bg-white hover:text-black"
                  {...FADE_IN_ANIMATION_SETTINGS}
                >
                  🚀 Upgrade to Pro
                </Link>
              </button>
              {(loaded && !isLoggedIn) && <button
                onClick={() => mixpanel.track("clicked nav get started")}
              >
                <Link
                  href= "/login"
                  className="mr-4 rounded-full border font-bold  bg-black p-1.5 px-4 text-sm text-white transition-all flex items-center"
                  {...FADE_IN_ANIMATION_SETTINGS}
                >
                  Sign Up
                </Link>
              </button>}
            </div>
          </div>
          <div className="md:hidden">
            <AnimatePresence>
              {true ? (
                <motion.button
                  onClick={() => setShowSignInModal(!showSignInModal)}
                  {...FADE_IN_ANIMATION_SETTINGS}
                >
                  <button
                    onClick={() => setOpenPopover(!openPopover)}
                    className=" flex w-16 items-center justify-center rounded-md border border-gray-300 px-4 py-2 transition-all duration-75 hover:border-gray-800 focus:outline-none active:bg-gray-100"
                  >
                    <svg
                      className="block h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </motion.button>
              ) : (
                <UserDropdown />
              )}
            </AnimatePresence>
          </div>

          <div className="-mr-2 flex md:hidden"></div>
        </div>
      </div>
    </div>
  )
}

export default Navbar