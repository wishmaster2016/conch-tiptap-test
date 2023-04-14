import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import mixpanel from "mixpanel-browser";

export default function FaqRow({
  index,
  title,
  description,
  activeFAQ,
  setActiveFAQ,
}: {
  index: number;
  title: string;
  description: string;
  activeFAQ: number;
  setActiveFAQ: (active: number) => void;
}) {
  return (
    <div className="w-full p-1 ">
      <div
        className={`shadow-10xl rounded-2xl ${
          activeFAQ == index ? "border-indigo-600" : "border-gray-200"
        }  border-2 bg-white bg-opacity-60 py-7 px-8`}
      >
        <button
          onClick={() => {
            if (activeFAQ == index) {
              setActiveFAQ(-1);
            } else {
              mixpanel.track(`FAQ ${title}`);
              setActiveFAQ(index);
            }
          }}
          className="w-full"
        >
          <div className="-m-2 flex flex-wrap justify-between">
            <div className="flex-1 p-2">
              <h3 className="text-left text-lg font-semibold leading-normal">
                {title}
              </h3>
              {activeFAQ == index ? (
                <p className="flex text-left font-medium text-gray-600">
                  {description}
                </p>
              ) : (
                <div></div>
              )}
            </div>
            <div className="w-auto p-2">
              {activeFAQ == index ? (
                <svg
                  className="relative top-1"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.25 6.75L9 12L3.75 6.75"
                    stroke="#4F46E5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="relative top-1"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.16732 12.5L10.0007 6.66667L15.834 12.5"
                    stroke="#18181B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
