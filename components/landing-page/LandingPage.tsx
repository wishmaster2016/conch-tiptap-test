import Card from "@/components/home/card";
import Layout from "@/components/layout/layout";
import Balancer from "react-wrap-balancer";
import { motion } from "framer-motion";
import {
  FADE_DOWN_ANIMATION_VARIANTS
} from "@/lib/constants";
import {
  FaRegFileAlt,
} from "react-icons/fa";
import { getMongoUserData } from "mongodb-utils/user";
import CitationPopover from "@/components/app-home/citation/citation-popover";
import WebVitals from "@/components/home/web-vitals";
import ComponentGrid from "@/components/home/component-grid";
import { Tiptap } from "@/components/text-editor/tiptap";
import Image from "next/image";
import FaqRow from "@/components/home/FAQ/faqRow";
import { useEffect, useState, useRef, useContext } from "react";
import mixpanel from "mixpanel-browser";
import Link from "next/link";
import { isLoggedInFirebase } from "firebase-utils/user";
import { isMobile } from "react-device-detect";
import {
  FaArrowRight,
  FaCheckCircle,
  FaPencilAlt,
  FaSyncAlt,
  FaTrashAlt,
} from "react-icons/fa";
import ReactPlayer from "react-player/vimeo";
import { TiptapContext } from "context/TiptapContext";
import MailchimpSubscribe from "react-mailchimp-subscribe";
import { toast } from "react-hot-toast";
import { makePostRequest } from "utils/requests";
import { SECOND_BACKEND_URL } from "utils/constants";
import { useRouter } from "next/router";
import { SIGNUP_PATH } from "../../utils/constants";
import { useTipTap } from "../../context/TiptapContext";

export default function LandingPage() {
  let institutions = [
    "harvard.png",
    "waterloo.png",
    "penn.png",
    "ucla.png",
    "nyu.png",
    "stanford.png",
  ];
  // check if logged in
  const [textString, setTextString] = useState("Napoleon Bonaparte was a French military and political leader who rose to prominence during the French Revolution.");
  const [editor, setEditor] = useState<any>(null);
  const [defaultTextHTML, setDefaultTextHTML] = useState<String>("<p>Napoleon Bonaparte was a French military and political leader who rose to prominence during the French Revolution.</p>");
  const [textHTML, setTextHTML] = useState("");
  const [isUserPro, setIsUserPro] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [removedRewriteObjects, setRemovedRewriteObjects] = useState<any[]>([]);
  const [rewriteObjects, setRewriteObjects] = useState<any[]>([]);
  const [currDocument, setCurrDocument] = useState<Record<string, any>>({});
  const [showCitationPopover, setShowCitationPopover] = useState(false);
  const [showTextSelectedPopover, setShowTextSelectedPopover] = useState(false);
  const [citations, setCitations] = useState<Record<string, any>[]>([]);
  const [citationPopoverTopOffset, setCitationPopoverTopOffset] = useState(0);
  const [popoverTopOffset, setPopoverTopOffset] = useState(0);
  const [citationsLoaded, setCitationsLoaded] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [popoverLeftOffset, setPopoverLeftOffset] = useState(0);
  const [currFootnoteNumber, setCurrFootnoteNumber] = useState(-1);
  const suggestText = useRef(true);

  const closeAllPopovers = () => {
    setShowCitationPopover(false);
    setShowTextSelectedPopover(false);
  };

  useEffect(()=>{
    getMongoUserData().then((data) => {
      if (data) {
        const userData = data as Record<string, any>;
        if (userData && userData.currPlan && userData.currPlan.length > 0) {
          setIsUserPro(true);
        }
      }
    });
  },[])

  const handleTextSelected = (
    text: string,
    start: Record<string, any>,
    end: Record<string, any>,
  ) => {
    setSelectedText(text);

    if (!text) {
      closeAllPopovers();
      return;
    }

    // offset between bottom of text and top of popover
    let TOP_OFFSET_PIXELS = -200;

    if (end.bottom <= 250) {
      TOP_OFFSET_PIXELS = -50;
    }
    
    setPopoverTopOffset(end.bottom + TOP_OFFSET_PIXELS);
    setCitationPopoverTopOffset(end.bottom + TOP_OFFSET_PIXELS);


    setPopoverLeftOffset(start.left);
    setShowTextSelectedPopover(true);
  };

  const handleSettingCurrDocument = (document: Record<string, any>) => {
    setDefaultTextHTML(document.essayContent);
  };

  const router = useRouter();

  const handleShowCitation = () => {
    mixpanel.track("Clicked Demo Cite")
    setCitations([]);
    setCitationsLoaded(false);

    const freeCitationsUsed = parseInt(localStorage.getItem("freeCitationsUsed") || '0') ;

    // if used more than 3 citations, redirect
    if (freeCitationsUsed >= 2 && !isUserPro) {
      router.push(SIGNUP_PATH);
      return;
    } else {
      // otherwise, increment citations used
      localStorage.setItem("freeCitationsUsed", (freeCitationsUsed + 1).toString());
    }

    // hide text selected popover
    setShowTextSelectedPopover(false);
    setShowCitationPopover(true);

    // make axios post request to get citations based on selected text
    const data = {
      query: selectedText,
      citationStyle: "MLA",
    };

    // Try method 1
    makePostRequest(
      `${SECOND_BACKEND_URL}/api/writing/citation/gen-citations-5`,
      data,
    )
      .then((res) => {
        setCitations(res.data);
        setCitationsLoaded(true);
      })
      .catch(() => {
        // Try method 2
        makePostRequest(
          `${SECOND_BACKEND_URL}/api/writing/citation/gen-citations-3`,
          data,
        )
          .then((res) => {
            setCitations(res.data);
            setCitationsLoaded(true);
          })
          .catch((err) => {
            toast.error('Too many words selected or could not find citations for this topic. Please select something else and try a few key words.', { duration: 7500 });
            console.log("error generating inner citation");
            console.error(err);
          });
      });
  };
  


  useEffect(() => {
    if (!suggestText.current) {
      setShowSuggestionsModal(false);
    }
  }, [suggestText]);
  // useEffect(() => {
  //   isLoggedInFirebase().then((isLoggedIn) => setIsLoggedIn(isLoggedIn));
  // }, []);

  const handleSubmit = async (e: any, status: any = null) => {
    e.preventDefault();
    mixpanel.track("submitted email for re-launch");
    if (!email.includes("@") && email.length > 5) {
      toast.error("Please enter a valid email address", { duration: 3000 });
    } else {
      toast.success("Success! We'll be back very soon", {
        duration: 7500,
      });
    }
  };

  const {   //@ts-ignore
    showSuggestionsModal,   //@ts-ignore
    setShowSuggestionsModal,
    setIsSuggestedTextAdded,   //@ts-ignore
    isSuggestedTextAdded, 
    stopHighlightModal, setStopHighlightModal,
  } = useTipTap();

  useEffect(() => {
    const timer = setTimeout(
      (showSuggestionsModal) => {
        if (showSuggestionsModal) {
          setShowSuggestionsModal(false);

        }
      },
      5000,
      editor,
    );

    return () => {
      clearInterval(timer);
    };
  }, [showSuggestionsModal]);

  useEffect(() => {
    if(!isSuggestedTextAdded) return;
    const timer = setTimeout(
      (isSuggestedTextAdded) => {
        if (isSuggestedTextAdded) {
          setIsSuggestedTextAdded(false);
          setStopHighlightModal(true);
        }
      },
      5000,
      editor,
    );

    return () => {
      clearInterval(timer);
    };
  }, [isSuggestedTextAdded]);

  useEffect(() => {
    const timer = setTimeout(
      (editor) => {
        if (editor && suggestText.current && textString) {
          const cursorLine = editor?.view.state.selection.$anchor.pos + 2;
          editor.commands.insertContent(`<react-component></react-component>`);
          editor.chain().focus().setTextSelection(cursorLine).run();
          suggestText.current = false;
        }
      },
      300,
      editor,
    );

    return () => {
      clearInterval(timer);
    };
  }, [textString.trim()]);

  const scrollToPplSentence = (sentence: string) => {
    // console.log(rewriteRefs);
    // const ref = rewriteRefs[sentence];
    // ref.current.scrollIntoView({ behavior: "smooth" });

    // get all elements with class rewriteOptionCard
    const elements = document.getElementsByClassName("rewriteOptionCard");

    // loop through all elements
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      // if the value attribute of the element is the same as the sentence, scroll to it
      if (element.getAttribute("value")?.includes(sentence)) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }
    }
  };

  const addAsCitation = (citation: Record<string, any>) => {
    // close citation popover
    setShowCitationPopover(false);

    let textHTML = editor.getHTML();

    // if footnote is already used, use the next number. Otherwise, use 1
    const footnoteNumberToUse =
      currFootnoteNumber >= 0 ? currFootnoteNumber + 1 : 1;

    const currDocumentCitationStyle = currDocument.citationType
      ? currDocument.citationType
      : "MLA";
    const citations = citation.citation.citations;

    // find the citation that matches the current document's citation style
    let citationText = "";
    for (let i = 0; i < citations.length; i++) {
      const citation = citations[i];
      if (citation.title === currDocumentCitationStyle) {
        citationText = citation.snippet;
        break;
      }
    }

    // makePostRequest(
    //   `${SECOND_BACKEND_URL}/api/writing/citation/intext-citation`,
    //   {
    //     articleText: citation.text
    //   },
    // ).then((res) => {
    // const intextCitation = res.data;
    const intextCitation = "";

    let replacementText = "";

    if (intextCitation) {
      replacementText = `${selectedText}(${" " + intextCitation})<a href='${
        citation.link
      }'><sup>${footnoteNumberToUse}</sup></a>`;
    } else {
      replacementText = `${selectedText}<a href='${citation.link}'><sup>${footnoteNumberToUse}</sup></a>`;
    }

    textHTML = textHTML.replace(selectedText, replacementText);

    if (footnoteNumberToUse == 1) {
      // add citation text to the end of the html
      textHTML = `${textHTML}<p></p><p class='works-cited-title'><strong>Bibliography</strong></p><p></p><p class='added-citation'>${footnoteNumberToUse}. ${citationText}</p>`;
    } else {
      textHTML = `${textHTML}<p></p><p class='added-citation'>${footnoteNumberToUse}. ${citationText}</p>`;
    }

    // update currFootnoteNumber
    setCurrFootnoteNumber(footnoteNumberToUse);

    // update text html
    setDefaultTextHTML(textHTML);
    // }).catch((err) => {
    //   console.log("error generating inner citation");
    //   console.error(err);
    // });
  };

     // create a new date and set it as March 27, 2023
  const stopDate = new Date("March 27, 2023 23:59:00");
  const [email, setEmail] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    isLoggedInFirebase().then((isLoggedIn) => setIsLoggedIn(isLoggedIn));
  }, []);

  // useEffect(() => {
  //   mixpanel.track("Screen Load Home Page");
  // }, []);

  const [activeFAQ, setActiveFAQ] = useState(-1);

  const renderer = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }) => {
    if (completed) {
      // Render a completed state
      return <></>;
    } else {
      let hoursAndDays = days * 24 + hours;
      // add 0 to front of hours, minutes, and seconds if they are less than 10
      let formattedHours =
        hoursAndDays < 10 ? "0" + hoursAndDays : hoursAndDays;
      let formattedMins = minutes < 10 ? "0" + minutes : minutes;
      let formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
      // Render a countdown
      return (
        <span>
          {formattedHours}:{formattedMins}:{formattedSeconds}
        </span>
      );
    }
  };  

  return (
    <Layout>
      <div className="relative flex h-fit w-full flex-col items-center justify-center py-12 md:mt-8 md:py-8">
        <motion.div
          className="  px-5 2xl:px-0"
          initial="hidden"
          whileInView="show"
          animate="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          <motion.h1
            className="bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-5xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-6xl md:leading-[5rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
            style={{'lineHeight': 'normal'}}
          >
            <p>The All-in-One Writing Tool</p>
          </motion.h1>

          <motion.p
            className="mt-2 text-center text-gray-500 md:text-xl"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            <p>
              Supercharge your workflow with your personal writing assistant,
              and save hundreds of hours.
            </p>
          </motion.p>
          <motion.div
            className="mx-auto mt-6 flex items-center justify-center space-x-5"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            <Link
              href="/sign-up"
              rel="noreferrer"
              className="text-lg font-semibold text-white"
            >
              <motion.button
                variants={FADE_DOWN_ANIMATION_VARIANTS}
                onClick={() => mixpanel.track("Clicked Sign Up")}
                className="mx-auto mb-5 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-400 to-violet-700 px-8 py-4 drop-shadow-lg transition-colors"
              >
                {isMobile ? "Try it on mobile" : "Start Writing For Free"}
                <FaArrowRight className="ml-4" />
              </motion.button>
            </Link>
          </motion.div>
          <motion.div
            className="mx-auto mt-2 flex flex-col items-center justify-center space-x-5"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            <Image
              alt="writers"
              src="/landing/joinWriters.png"
              width={100}
              height={300}
            />
            <p className="italic text-gray-500">
              Join 400k+ other writers using Conch
            </p>
          </motion.div>
        </motion.div>

        <motion.div className="flex w-full justify-center ">
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            transition={{ delay: 1, type: "spring", stiffness: 65 }}
            className="hidden md:block"
          >
            <Image
              alt="Landing Page Video"
              src="/landing/withoutconch.png"
              width={400}
              height={400}
              className="mt-16 rounded-lg object-contain drop-shadow-xl"
            />
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            animate="show"
            viewport={{ once: true }}
            className="mt-12 h-fit w-fit rounded-lg drop-shadow-lg"
          >
            <motion.div
              initial={{ y: 900 }}
              animate={{ y: 0 }}
              transition={{ delay: 1, type: "spring", stiffness: 65 }}
              className="h-fit w-fit rounded-lg drop-shadow-lg"
              onClick={() => mixpanel.track("Clicked Play Video")}
            >
              <ReactPlayer
                url={
                  isMobile
                    ? "https://vimeo.com/809560218"
                    : "https://vimeo.com/809238758"
                }
                playing={true}
                controls={false}
                muted
                playsinline
                loop={true}
                volume={0}
                width={isMobile ? "350px" : "700px"}
                height={isMobile ? "350px" : "500px"}
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            transition={{ delay: 1, type: "spring", stiffness: 65 }}
            className="hidden md:block"
          >
            <Image
              alt="Landing Page Video"
              src="/landing/withconch.png"
              width={375}
              height={375}
              className="mt-16 rounded-lg object-contain opacity-70 drop-shadow-xl"
            />
          </motion.div>
        </motion.div>
      </div>
      <Image
        alt="Landing Page Video"
        src="/landing/withConchMobile.png"
        sizes="33vw"
        width={400}
        height={400}
        className="rounded-lg object-contain drop-shadow-xl md:hidden"
      />
      {!isMobile && <div
        className={
          isMobile
            ? "mt-6 h-screen  w-full pl-[5px] pr-[5px] relative"
            : "mt-6 w-[45rem] shadow-white relative"
        }
        style={{maxHeight: '72vh'}}
      >
        <div className="-m-2 mb-0 mt-8 flex flex-wrap items-end justify-between">
          <div className=" w-full p-2">
            <h2 className="font-heading flex w-full items-center justify-center text-2xl font-bold md:text-3xl">
              👇 Start Typing & Pause to See Magic
              </h2>
          </div>
          <div className="w-auto p-2"></div>
        </div>

        <Tiptap
          suggestText={suggestText}
          isWebApp={true}
          setEditor={setEditor}
          defaultTextHTML={defaultTextHTML}
          setTextString={setTextString}
          setTextHTML={setTextHTML}
          setWordCount={setWordCount}
          scrollToPplSentence={scrollToPplSentence}
          handleTextSelected={handleTextSelected}
          currDocument={null}
        />
        
        {showSuggestionsModal && !isMobile && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 40, opacity: 5 }}
            transition={{ delay: 1, type: "spring", stiffness: 75 }}
          >
            <div className="infoDiv">
              <p>1. {"->"} Right Arrow to accept</p>
              <p>2. {"<-"} Left Arrow to delete</p>
            </div>
          </motion.div>
        )}
         {showCitationPopover && (
        <CitationPopover
          citations={citations}
          addAsCitation={addAsCitation}
          popoverTopOffset={citationPopoverTopOffset}
          popoverLeftOffset={popoverLeftOffset}
          setShowCitationPopover={setShowCitationPopover}
          citationsLoaded={citationsLoaded}
        />
      )}
      
      {showTextSelectedPopover && (
        <div
          className="absolute"
          style={{ top: popoverTopOffset, left: popoverLeftOffset }}
        >
          <div className="text-select-toolbar-wrapper">
            <div className="text-select-toolbar  rounded-lg">
              <div className="flex w-full flex-row justify-between">
                <button
                  className="flex flex-row items-center justify-start"
                  onClick={() => handleShowCitation()}
                >
                  <FaRegFileAlt size={14} className="mr-2" />
                    <p className="tracking-wide">Cite</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
       
        
        {isSuggestedTextAdded && !stopHighlightModal && !isMobile && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 40, opacity: 5 }}
            transition={{ delay: 1, type: "spring", stiffness: 75 }}
          >
            <div className="infoDiv">
              Highlight a sentence to cite or rewrite it.
            </div>
          </motion.div>
        )}

        {isMobile && (
          <div className="infoDivMobile">
            <FaSyncAlt
              className="ml-4"
              color="blue"
              onClick={() => {
                if(!window.getSelection()?.toString()){
                  editor.commands.insertContent(`<react-component></react-component>`);
                }
              }}
            />
            {/* <FaPencilAlt className="ml-4" color="grey" /> */}
            <FaTrashAlt
              className="ml-4"
              color="red"
              onClick={() => {
                editor.commands.deleteNode("reactComponent");
              }}
            />
            <FaCheckCircle
              className="ml-4"
              color="green"
              onClick={() => {
                const text = localStorage.getItem("nextSentenceText") || "";
                if(editor.commands.deleteNode("reactComponent")){
                  editor.commands.insertContent(" " + text)
                }else{
                  editor.chain().focus().setTextSelection(editor.view.state.selection.$anchor.pos + 1).run()
                }
              }}
            />
          </div>
        )}
      </div>}
      <motion.div
            className="mx-auto flex items-center justify-center space-x-5 mt-8"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            <Link
              href="/login"
              rel="noreferrer"
              className="text-lg font-semibold text-white"
            >
              <motion.button
                variants={FADE_DOWN_ANIMATION_VARIANTS}
                onClick={() => mixpanel.track("Clicked Demo Try the real thing")}
                className="mx-auto mb-5 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-400 to-violet-700 px-10 py-4 drop-shadow-lg transition-colors"
              >
                <p>Try the real thing</p>
                <FaArrowRight className="ml-4" />

              </motion.button>
            </Link>
          </motion.div>
      <section className="relative pb-32">
        <div className="relative z-10 mx-auto mt-32 px-4 xl:mx-24">
          <div className="-m-2 mb-12 flex flex-wrap items-end justify-between">
            <div className=" w-full p-2">
              <h2 className="font-heading flex w-full items-center justify-center text-5xl font-bold md:text-6xl">
                🤩 Students love Conch.
              </h2>
            </div>
            <div className="w-auto p-2"></div>
          </div>
          <div className="-m-2 flex flex-wrap ">
            <div className="w-full p-2 md:w-1/2 lg:w-1/4">
              <div className="h-full rounded-3xl bg-white bg-white px-8 py-6 drop-shadow-lg">
                <div className="flex h-full flex-col justify-between ">
                  <div className="mb-7 block">
                    <div className="-m-0.5 mb-6 flex flex-wrap ">
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-heading mb-6 text-lg font-bold">
                      &ldquo;Cannot live without it.&rdquo;
                    </h3>
                    <p className="text-lg font-medium">
                      Essays used to take me days, but now they takes a couple
                      of hours! Goated.
                    </p>
                  </div>
                  <div className="block">
                    <p className="font-bold">Henry W. - UCLA, 2025</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full p-2 md:w-1/2 lg:w-1/4  ">
              <div className="h-full rounded-3xl bg-white bg-white px-8 py-6 drop-shadow-lg">
                <div className="flex h-full flex-col justify-between">
                  <div className="mb-7 block">
                    <div className="-m-0.5 mb-6 flex flex-wrap">
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-heading mb-6 text-lg font-bold">
                      &ldquo;Was skeptical at first.&rdquo;
                    </h3>
                    <p className="text-lg font-medium">
                      As a grad student, I didn't think Conch would be able to
                      create the quality of essays I needed. Now it's part of my
                      daily workflow.
                    </p>
                  </div>
                  <div className="block">
                    <p className="font-bold">Jenny K. - Stanford, 2023</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full p-2 md:w-1/2 lg:w-1/4">
              <div className="h-full rounded-3xl bg-white bg-white  px-8 py-6 drop-shadow-lg">
                <div className="flex h-full flex-col justify-between">
                  <div className="mb-7 block">
                    <div className="-m-0.5 mb-6 flex flex-wrap">
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-heading mb-6 text-lg font-bold">
                      &ldquo;Saving 10 hours a Week!&rdquo;
                    </h3>
                    <p className="text-lg font-medium">
                      I used to pull all nighters to finish my essays. The
                      autocomple sentence feature got rid of my writers block.
                      Now I sleep like a baby.
                    </p>
                  </div>
                  <div className="block">
                    <p className="font-bold">Arvid - Harvard, 2024</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full p-2 md:w-1/2 lg:w-1/4">
              <div className="h-full rounded-3xl bg-white bg-white px-8 py-6 drop-shadow-lg">
                <div className="flex h-full flex-col justify-between">
                  <div className="mb-7 block">
                    <div className="-m-0.5 mb-6 flex flex-wrap">
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                      <div className="w-auto p-0.5">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.30769 0L12.1838 5.82662L18.6154 6.76111L13.9615 11.2977L15.0598 17.7032L9.30769 14.6801L3.55554 17.7032L4.65385 11.2977L0 6.76111L6.43162 5.82662L9.30769 0Z"
                            fill="#F59E0B"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-heading mb-6 text-lg font-bold">
                      &ldquo;Leveled Up&rdquo;
                    </h3>
                    <p className="text-lg font-medium">
                      I'm saving about 10 hours a week. I use the summarization
                      feature of the chrome extension the most.
                    </p>
                  </div>
                  <div className="block">
                    <p className="font-bold">
                      Wilson S. - Jefferson High, 2026
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="relative mt-36 h-36 w-full items-center justify-center border-gray-200 md:px-16 ">
        <motion.h1
          className="bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent  drop-shadow-sm sm:text-7xl md:text-6xl md:leading-[5rem]"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          What can Conch do?
        </motion.h1>

        <motion.p
          className="mt-2 text-center text-gray-500 md:mx-16 md:text-xl"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          <p>
            Run your essay through our proprietary algorithm and have us rewrite
            it until it becomes detection free
          </p>
        </motion.p>
      </div>
      <div className="mx-24 grid h-fit w-full max-w-screen-xl animate-[slide-down-fade_0.5s_ease-in-out] grid-cols-1 gap-5 px-5 md:grid-cols-4 xl:px-0">
        <Card
          key={"red"}
          title={"ConchBib™: In-text Citations"}
          description={
            "Write literally anything, we'll handle citations for you."
          }
          demo={
            <Image
              src="/landing/citationGenLanding.png"
              alt="Deploy with Vercel"
              width={400}
              height={400}
              sizes=""
              className=" rounded-md object-contain px-4 drop-shadow-md"
            />
          }
          large={true}
        />
        <Card
          key={"green"}
          title={"ConchEnhance™: Detect AI & Improve Style"}
          description={
            "Get a holistic score and suggestions on how to improve your essay."
          }
          demo={
            <Image
              src="/landing/checksuggestion.png"
              alt="Deploy with Vercel"
              width={450}
              height={450}
              className="rounded-md object-contain px-4  drop-shadow-md "
            />
          }
          large={true}
        />
        <Card
          key={"autocomplete"}
          title={"Autocomplete with AI"}
          description={"Can't think of your next sentence? Conch has got you."}
          demo={
            <Image
              src="/landing/autocomplete.png"
              alt="Deploy with Vercel"
              width={450}
              height={450}
              className="rounded-md object-contain px-4 drop-shadow-md"
            />
          }
          large={true}
        />
        <Card
          key={"rewrite"}
          title={"Rewrite: find the perfect words"}
          description={"Make any text shorter, longer, bolder, or more formal."}
          demo={
            <Image
              src="/landing/rewriteLanding.png"
              alt="Deploy with Vercel"
              width={450}
              height={450}
              className="rounded-md object-contain drop-shadow-md"
            />
          }
          large={true}
        />
      </div>
      <div className="relative mt-24 h-56 w-full items-center justify-center border-gray-200 px-12 md:mt-48 ">
        <div className="inline-block justify-center md:flex">
          <div className="mb-2 flex justify-center">
            <Image
              src="/chrome-logo.png"
              alt="Chrome Icon"
              width={56}
              height={56}
              className=" flex justify-center rounded-md object-contain md:mr-2"
            />
          </div>
          <motion.h1
            className="w-fit bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm sm:text-7xl md:text-5xl md:leading-[5rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Use Conch Everywhere You Go
          </motion.h1>
        </div>
        <motion.p
          className="mt-2 text-center text-gray-500 md:text-xl"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          <Balancer>
            Try the Chrome Extenion and use Conch in your favorite editor
          </Balancer>
        </motion.p>
        <motion.div
          className="mx-auto mt-6 mb-16 flex items-center justify-center space-x-5"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          <button
            onClick={() => mixpanel.track("clicked download extension landing")}
          >
            <motion.a
              variants={FADE_DOWN_ANIMATION_VARIANTS}
              href="https://chrome.google.com/webstore/detail/conch-ai/namibaeakmnknolcnomfdhklhkabkchl?hl=en&authuser=0"
              target="_blank"
              rel="noreferrer"
              className="mx-auto  flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full  border-violet-700 bg-violet-200 px-10 py-3 transition-colors"
            >
              <p className="text-lg font-semibold text-violet-700">
                Download the Extension
              </p>
            </motion.a>
          </button>
        </motion.div>
      </div>
      <div className="mx-24 mt-24 grid h-fit w-full max-w-screen-xl animate-[slide-down-fade_0.5s_ease-in-out] grid-cols-1 gap-5 px-5 md:mt-8 md:grid-cols-4 xl:px-0">
        <Card
          key={"tabSwitch"}
          title={"Stop Tab Switching"}
          description={
            "Imagine combining the power of ChatGPT with the ease of use of Grammarly. Use AI in whatever tab you're on."
          }
          demo={
            <Image
              src="/landing/chrome1.png"
              alt="Deploy with Vercel"
              width={700}
              height={700}
              className="rounded-md object-contain drop-shadow-md"
            />
          }
          large={true}
        />
        <Card
          key={"generateNext"}
          title={"You write, Conch autocompletes."}
          description={
            "Stuck while writing? Conch will generate the next sentence for you, based off the context of your previous writing"
          }
          demo={
            <Image
              src="/landing/chrome2.png"
              alt="Deploy with Vercel"
              width={700}
              height={700}
              className="rounded-md object-contain drop-shadow-md"
            />
          }
          large={true}
        />
      </div>
      <div className="mx-24 mt-6 grid w-full max-w-screen-xl animate-[slide-down-fade_0.5s_ease-in-out] grid-cols-1 gap-5 px-5 md:grid-cols-3 xl:px-0">
        {features.map(({ title, description, demo }) => (
          <Card
            key={title}
            title={title}
            description={description}
            demo={
              title === "Beautiful, reusable components" ? (
                <ComponentGrid />
              ) : (
                demo
              )
            }
          />
        ))}
      </div>

      {/* FAQ */}
      <section className="relative overflow-hidden pt-24 pb-28">
        <img
          className="absolute bottom-0 left-1/2 -translate-x-1/2 transform"
          src="flaro-assets/images/faqs/gradient.svg"
          alt=""
        />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto md:max-w-4xl">
            <p className="tracking-px mb-7 text-center text-sm font-semibold uppercase text-indigo-600">
              Have any questions?
            </p>
            <h2 className="font-heading tracking-px-n mb-16 text-center text-2xl font-bold leading-none md:text-5xl xl:text-5xl">
              Frequently Asked Questions
            </h2>
            <div className="-m-1 mb-11 flex flex-wrap">
              {questions.map(({ title, description }, i) => (
                <FaqRow
                  index={i}
                  key={i}
                  title={title}
                  description={description}
                  activeFAQ={activeFAQ}
                  setActiveFAQ={setActiveFAQ}
                />
              ))}
            </div>
           <p className="text-center font-medium text-gray-600">
              <span>Still have any questions? </span>
              <a
                className="font-semibold text-indigo-600 hover:text-indigo-700"
                href="mailto:help@getconch.ai"
              >
                Contact us
              </a>
            </p>
          </div>
          <motion.h1
            className="bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-5xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-6xl md:leading-[5rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            <p>Try Conch for Free Today</p>
          </motion.h1>

          <motion.p
            className="mt-2 text-center text-gray-500 md:text-xl"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            <p>Join 400,000+ students who are writing 3x faster with Conch</p>
          </motion.p>
          <motion.div
            className="mx-auto mt-6 flex items-center justify-center space-x-5"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            <Link
              href="/login"
              rel="noreferrer"
              className="text-lg font-semibold text-white"
            >
              <motion.button
                variants={FADE_DOWN_ANIMATION_VARIANTS}
                onClick={() => mixpanel.track("Clicked Sign Up Bottom")}
                className="mx-auto mb-5 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-400 to-violet-700 px-10 py-4 drop-shadow-lg transition-colors"
              >
                <p>Start Writing 3x Faster</p>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
const questions = [
  {
    title: "What are tokens? ",
    description:
      "Tokens are the currency you give to Conch that allow you to generate, check or rewrite content. 1 token ≈ 1 word.",
  },
  {
    title: "Is there a free plan?",
    description:
      "Yes! All users who sign-up get access to 3000 tokens which can be used across all our tools, with certain features locked.",
  },
  // {
  //   title: "Is Conch Bypass™ guaranteed to not get caught?",
  //   description:
  //     "We use an algorithm very similar to GPTZero to determine whether or not your content is written by AI. We rewrite your content until it passes this detection. You may go to gptzero.me to see how well our AI bypasser works. As GPTZero is the gold standard for ai detection, it is very difficult to make the case that an AI has written your paper if it passes their test.",
  // },
  {
    title: "Is the content from Conch original?",
    description:
      "The content that Conch generates is original content that doesn't repeat itself and passes plagiarism tests with 99.99% original content that is free and clear for publication.",
  },
  {
    title: "What languages does Conch support?",
    description:
      "In theory, Conch should support all languages. We have tested German, Japanese, Spanish and Russian.",
  },
];
const features = [
  {
    title: "Choose from 12+ Templates",
    description:
      "Beat writer's block: use templates to quickly get started. From replying to emails to summarizing text on any webpage.",
    demo: (
      <Image
        src="/landing/outline.png"
        alt="Deploy with Vercel"
        width={320}
        height={320}
      />
    ),
  },
  {
    title: "Answer anything in seconds",
    description:
      "Powered by ChatGPT. Instead of context switching and breaking your writing flow, ask Conch and have the answer instantly. ",
    demo: (
      <Image
        src="/landing/chatgpt.png"
        alt="Deploy with Vercel"
        width={320}
        height={320}
      />
    ),
  },
  {
    title: "Too Long Didn't Read",
    description:
      "Highlight and summarize hard to understand texts in seconds. Perfect for researchers, students, and writers.",
    demo: (
      <Image
        src="/landing/tldr.png"
        alt="Deploy with Vercel"
        width={320}
        height={320}
      />
    ),
  },
];
