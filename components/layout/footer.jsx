import Image from "next/image";
import Link from "next/link";
import React from 'react'

import LogoImage from "../../assets/logo.png";
import DiscordIcon from "../../assets/socialIcons/discord.png";
import InstaIcon from "../../assets/socialIcons/insta.png";
import TikTokIcon from "../../assets/socialIcons/tiktok.png";
import TwitterIcon from "../../assets/socialIcons/twitter.png";


function Footer() {
  return (
    <div className="h-128 w-full items-center border-t border-gray-200 bg-white py-5">
      <div className=" mx-8 my-8 grid grid-cols-1 gap-5 px-5 md:mb-8 md:ml-48  md:grid-cols-3">
        <div className="... flex-1">
          <div className="w-128 flex flex-col">
            <Link
              href="/"
              className="flex items-center font-display text-2xl"
            >
              <Image
                src={LogoImage}
                alt="Conch logo"
                width="36"
                height="36"
                className="mr-2 rounded-sm"
              ></Image>
              <p className="text-3xl font-black">Conch</p>
            </Link>
            <Link rel="noreferrer" href="/earn">
            <button onClick={() => mixpanel.track("clicked footer earn")}>
            <div className="flex flex-col items-start">
              <p className="text-violet-700 font-semibold">Conch Earn Program 💸</p>
            </div>
            </button>
            </Link>
            <div className="flex flex-col items-start">
              <p>Copyright © 2023 Conch AI Inc.</p>
              <p>All rights reserved</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex-1 md:mt-0">
          <div className="mt-8 flex flex-col items-start justify-start md:mt-0">
            <h2 className="text-xl font-semibold">Company</h2>
            <p>Support: help@getconch.ai</p>
            <div className="mt-2 flex">
              <a
                href="https://www.tiktok.com/@getconch.ai"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  src={TikTokIcon}
                  alt="TikTok"
                  width="26"
                  height="26"
                  className="mr-2 m-auto mt-1 rounded-sm"
                ></Image>
              </a>
              <a
                href="https://www.instagram.com/getconch.ai/"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  src={InstaIcon}
                  alt="instagram"
                  width="28"
                  height="28"
                  className="mr-2 mt-1 rounded-sm"
                ></Image>
              </a>
              <a
                href="https://twitter.com/getconch"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  src={TwitterIcon}
                  alt="instagram"
                  width="28"
                  height="28"
                  className="mr-2 mt-1 rounded-sm"
                ></Image>
              </a>
              <a
                href="https://discord.gg/6UGjBseV76"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  src={DiscordIcon}
                  alt="discord"
                  width="30"
                  height="30"
                  className="mt-1  rounded-sm"
                ></Image>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-4 flex-1 items-center md:mt-0">
          <div className="flex flex-col items-start">
            <h2 className="text-xl font-semibold">Legal</h2>
            <Link
              href="/legal/terms-of-service"
              target="_blank"
              rel="noreferrer"
            >
              Terms of use
            </Link>
            <Link
              href="/legal/privacy-policy"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer