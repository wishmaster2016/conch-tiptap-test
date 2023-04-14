import { useState, useRef, useEffect, ReactNode, useContext } from "react";
import Sidebar from "../layout/sidebar";
import Drawer from "../layout/drawer";
import { Tiptap } from "@/components/text-editor/tiptap";
import CitationPopover from "@/components/app-home/citation/citation-popover";
import { isMobile } from "react-device-detect";
import Image from "next/image";
import { SECOND_BACKEND_URL } from "utils/constants";
import axios from "axios";
import {
  FaPen,
  FaRegFileAlt,
  FaRegFileWord,
  FaRegSave,
  FaUser,
} from "react-icons/fa";
import { TiptapContext } from "context/TiptapContext";
import { makePostRequest } from "utils/requests";
import { LOCAL_STORAGE_KEY } from "../../utils/local-storage";
import { BYPASS_PATH } from "../../utils/constants";
import { useRouter } from "next/router";
import mixpanel from "mixpanel-browser";
import { incrementClicks } from "@/lib/utils";
import Link from "next/link";
import useWindowSize from "@/lib/hooks/use-window-size";
import { useAdQueueModal } from "@/components/AdQueueModal";
import UpgradeModal from "../rewrite/upgrade-modal";
import { useAccountModal } from "../AccountModal";
import {
  convertBackendTextToHTML,
  convertTextToHTML,
} from "utils/editor-content";
import { useConfirmModal } from "./utils/confirm-modal";
import { useInputModal } from "./utils/input-modal";
import { toast } from "react-hot-toast";
import { asBlob } from "html-docx-js-typescript";
// if you want to save the docx file, you need import 'file-saver'
import { saveAs } from "file-saver";
import { useAuth } from "context/AuthContext";

interface AppHomeProps {
  conchResponse: string;
  setConchResponse: (text: string) => void;
  templateResponse: string;
  setTemplateResponse: (text: string) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;
  foldersWithEssays: Record<string, any>;
  setFoldersWithEssays: (folders: Record<string, any>) => void;
  essaysWithoutFolders: Record<string, any>[];
  setEssaysWithoutFolders: (essays: Record<string, any>[]) => void;
  loadedData: boolean;
  currDocument: Record<string, any>;
  setCurrDocument: (doc: Record<string, any>) => void;
  defaultTextHTML: string;
  setDefaultTextHTML: (text: string) => void;
  setShowOutOfTokensModal: (show: boolean) => void;
  editor: any;
  setEditor: (editor: any) => void;
}

export default function Home({
  conchResponse,
  setConchResponse,
  selectedText,
  setSelectedText,
  templateResponse,
  setTemplateResponse,
  foldersWithEssays,
  setFoldersWithEssays,
  essaysWithoutFolders,
  setEssaysWithoutFolders,
  loadedData,
  currDocument,
  setCurrDocument,
  defaultTextHTML,
  setDefaultTextHTML,
  setShowOutOfTokensModal,
  editor,
  setEditor
}: AppHomeProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [rewriteObjects, setRewriteObjects] = useState<any[]>([]);
  const [removedRewriteObjects, setRemovedRewriteObjects] = useState<any[]>([]);
  const [textString, setTextString] = useState("");
  const [textHTML, setTextHTML] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const suggestText = useRef(true);
  const [tokensToRewriteAll, setTokensToRewriteAll] = useState(0);
  const [isUserPro, setIsUserPro] = useState(false);

  const {     
    loadedInData,
    isLoggedIn,
    firebaseUser,
    mongoDBUser
  } = useAuth();

  const { showAdQueueModal, AdQueueModal, setShowAdQueueModal } =
    useAdQueueModal();
  const { showAccountModal, AccountModal, setShowAccountModal } =
    useAccountModal();

  useEffect(() => {
    setShowAdQueueModal(false);
    // get mongo data
    //prettier-ignore
    console.log(isMobile.toString(), "isMobile")
    mixpanel.track("Screen load webapp", {
      isMobile: isMobile.toString(),
      isPro: isUserPro.toString(),
    });
  }, []);

  useEffect(() => {
    if (mongoDBUser && mongoDBUser.currPlan && mongoDBUser.currPlan.length > 0) {
      setIsUserPro(true);
    }
  }, [mongoDBUser]);

  // Handle conch response changed
  useEffect(() => {
    if (conchResponse) {
      // const transaction = editor.state.tr.insertText(conchResponse);
      // editor.view.dispatch(transaction);
      const htmlText = convertBackendTextToHTML(conchResponse);
      editor.commands.insertContent(htmlText);
      editor.commands.focus();
      setConchResponse("");
    }
  }, [conchResponse]);

  // Handle template response changed
  useEffect(() => {
    if (templateResponse && templateResponse.length > 0) {
      const htmlText = convertBackendTextToHTML(templateResponse);
      editor.commands.insertContent(htmlText);
      editor.commands.focus();
      setTemplateResponse("");
    }
  }, [templateResponse]);

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

  const handleUndo = () => {
    // get the last removed rewrite object
    const lastRemovedRewriteObject =
      removedRewriteObjects[removedRewriteObjects.length - 1];
    if (lastRemovedRewriteObject) {
      // add it back to the rewrite objects
      setRewriteObjects([...rewriteObjects, lastRemovedRewriteObject]);
      // remove it from the removed rewrite objects
      const newRemovedRewriteObjects = removedRewriteObjects.filter(
        (rewriteObject) => {
          if (rewriteObject.id === lastRemovedRewriteObject.id) {
            return false;
          } else {
            return true;
          }
        },
      );
      setRemovedRewriteObjects(newRemovedRewriteObjects);
    }
  };

  const [showTextSelectedPopover, setShowTextSelectedPopover] = useState(false);
  const [citationPosFromBottom, setCitationPosFromBottom] = useState(false);
  const [citationPopoverTopOffset, setCitationPopoverTopOffset] = useState(0);
  const [popoverTopOffset, setPopoverTopOffset] = useState(0);
  const [popoverBottomOffset, setPopoverBottomOffset] = useState(0);
  const [popoverLeftOffset, setPopoverLeftOffset] = useState(0);

  const [showCitationPopover, setShowCitationPopover] = useState(false);
  const [citations, setCitations] = useState<Record<string, any>[]>([]);
  const [citationsLoaded, setCitationsLoaded] = useState(false);

  // Keep track of the last footnote number used
  const [currFootnoteNumber, setCurrFootnoteNumber] = useState(-1);

  const closeAllPopovers = () => {
    setShowCitationPopover(false);
    setShowTextSelectedPopover(false);
  };

  // this will keep track whether nextSentence btn should br disabled or not
  const {   //@ts-ignore
    disableNextButton
  } = useContext(TiptapContext);

  /**
   * Handle text selected
   * @param text
   * @param start
   * @param end
   */
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
    const TOP_OFFSET_PIXELS = 5;
    const height = isMobile ? 310 : 429;

    // see if top of popover is off screen
    if (end.bottom + height > window.innerHeight) {
      setPopoverTopOffset(end.bottom + TOP_OFFSET_PIXELS);
      setCitationPopoverTopOffset(
        window.innerHeight - height - TOP_OFFSET_PIXELS,
      );
    } else {
      // if not, set top of popover to be at the bottom of the text
      setPopoverTopOffset(end.bottom + TOP_OFFSET_PIXELS);
      setCitationPopoverTopOffset(end.bottom + TOP_OFFSET_PIXELS);
    }

    setPopoverLeftOffset(start.left);
    setShowTextSelectedPopover(true);
  };

  /**
   * Make a request to backend to get citations based on selected text
   * and show the citation popover
   */
  const handleShowCitation = () => {
    if (isUserPro) {
      mixpanel.track("clicked cite not pro");
    } else {
      mixpanel.track("clicked cite webapp");
    }
    setCitations([]);
    setCitationsLoaded(false);

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

  /**
   * Add a citation to the editor
   * @param citation - citation object to add to editor
   */
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
      replacementText = `${selectedText}(${" " + intextCitation})<a href='${citation.link
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

  /**
   * Update the initial currFootnoteNumber
   */
  useEffect(() => {
    // only run if textHTML is not empty
    if (textHTML) {
      // get the last occurence of <sup> in the text
      const lastIndex = textHTML.lastIndexOf("<sup>");

      // get the last occurence of </sup> in the text
      const lastIndex2 = textHTML.lastIndexOf("</sup>");

      // get the text in between
      const textBetween = textHTML.substring(lastIndex, lastIndex2);

      // get the number in between
      const number = textBetween.match(/\d+/g);

      // if number is not null, set currFootnoteNumber to the number
      if (number) {
        setCurrFootnoteNumber(parseInt(number[0]));
      } else {
        setCurrFootnoteNumber(0);
      }
    }
  }, [currFootnoteNumber, textHTML]);

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

  const router = useRouter();

  const handleAIDetection = async () => {
    await saveDocument();

    mixpanel.track("clicked ai detection webapp");
    const text = editor.getText();
    localStorage.setItem(LOCAL_STORAGE_KEY.BYPASS_TEXT, text);

    router.push(BYPASS_PATH);
  };

  const setDocumentAsCurrent = (document: Record<string, any>) => {
    setCurrDocument(document);

    // if document has essay content, set it as the default text html
    if (document.essayContent && document.essayContent.length > 0) {
      setDefaultTextHTML(document.essayContent);
    } else {
      // otherwise, set it to empty paragraph (otherwise, it won't get updated)
      setDefaultTextHTML("<p></p>");
    }
  };

  /**
   * If loaded data and no current document,
   * find an essay and set it as the current one.
   * Otherwise, create a new document and set it as the current one.
   */
  useEffect(() => {
    console.log("LOADED DATA: ", loadedData);
    console.log("CURR DOCUMENT: ", currDocument);

    if (
      Object.keys(currDocument).length === 0 &&
      currDocument.constructor === Object &&
      loadedData
    ) {
      // see if there's essays at root
      if (essaysWithoutFolders.length > 0) {
        // get last document
        setDocumentAsCurrent(
          essaysWithoutFolders[essaysWithoutFolders.length - 1],
        );
      } else {
        // see if foldersWithEssays has any essays
        for (const folderId in foldersWithEssays) {
          const folder = foldersWithEssays[folderId];
          // this folder has essays
          if (folder.essays.length > 0) {
            // set last essay as current document
            setDocumentAsCurrent(folder.essays[folder.essays.length - 1]);
            return;
          }
        }

        let newDocumentName = "New Essay";

        // get mm/dd
        const date = new Date();
        let mm = (date.getMonth() + 1).toString();
        let dd = date.getDate().toString();

        if (parseInt(dd) < 10) dd = "0" + dd;
        if (parseInt(mm) < 10) mm = "0" + mm;

        // append mm/dd to new document name
        newDocumentName = `${newDocumentName} ${mm}/${dd}`;

        // no essays found, create a new document
        const documentData = {
          essayName: newDocumentName,
          essayContent: "",
        };
        setEssaysWithoutFolders([
          ...essaysWithoutFolders,
          { userId: "", folderId: "", ...documentData },
        ]);

        makePostRequest(
          `${SECOND_BACKEND_URL}/api/writing/storage/create-essay`,
          documentData,
        );
        setDocumentAsCurrent({ userId: "", folderId: "", ...documentData });

        console.log("CREATED DOCUMENT!");
        console.log(documentData);
      }
    }
  }, [currDocument, loadedData]);

  const openDocument = (document: Record<string, any>) => {
    // get current text html
    const currTextHTML = editor.getHTML();

    const folderId = currDocument.folderId;

    // save current document's essay content
    if (folderId && folderId.length > 0) {
      const newFoldersWithEssays = { ...foldersWithEssays };

      if (newFoldersWithEssays[folderId]) {
        const newEssays = newFoldersWithEssays[folderId].essays.map(
          (essay: Record<string, any>) => {
            if (essay._id === currDocument._id) {
              essay.essayContent = currTextHTML;
            }
            return essay;
          },
        );
        newFoldersWithEssays[folderId].essays = newEssays;
        setFoldersWithEssays(newFoldersWithEssays);
      }
    } else {
      const newEssaysWithoutFolders = essaysWithoutFolders.map((essay) => {
        if (essay._id === currDocument._id) {
          essay.essayContent = currTextHTML;
        }
        return essay;
      });
      setEssaysWithoutFolders(newEssaysWithoutFolders);
    }

    // set the document id
    setCurrDocument(document);

    // if document has essay content, set it as the default text html
    if (document.essayContent && document.essayContent.length > 0) {
      setDefaultTextHTML(document.essayContent);
    } else {
      // otherwise, set it to empty paragraph (otherwise, it won't get updated)
      setDefaultTextHTML("<p></p>");
    }
  };

  const generateNextSentence = () => {
    editor.commands.insertContent(`<react-component></react-component>`);
    mixpanel.track("clicked generate next sentence");
    if (mongoDBUser.currTokensLeft < 0) {
      mixpanel.track("show out of tokens next sentence");
      setShowOutOfTokensModal(true);
      return;
    }
    const numClicks = incrementClicks();
    if (numClicks >= 3 && !isUserPro) {
      mixpanel.track("show ad generate template");
      setShowAdQueueModal(true);
      return;
    }

    let text = "";

    try {
      text = editor.view.state.selection.$head.parent.content.content[0].text;
    } catch (e) {
      console.error(e);
      text = editor.getText();
    }

    let last100Chars: string = "";

    if (text.length > 0) {
      // get last 100 characters
      last100Chars = text.substring(text.length - 100, text.length);
    }

    if (!window.getSelection()?.toString()) {
      const text = localStorage.getItem("nextSentenceText") || "";

      // make post request
      if (!text) {
        makePostRequest(`${SECOND_BACKEND_URL}/ai/api/generate-sentence-webapp`, {
          query: last100Chars,
        })
          .then((res) => {
            let nextSentence: string = res.data;

            if (last100Chars && last100Chars[last100Chars.length - 1] !== " ") {
              nextSentence = " " + nextSentence;
            }

            const htmlText = convertBackendTextToHTML(nextSentence);
            editor.commands.insertContent(htmlText);
            editor.commands.focus();
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        // otherwise, paste text in
        
        if (editor.commands.deleteNode("reactComponent")) {
          editor.commands.insertContent(" " + text)
        } else {
          editor.chain().focus().setTextSelection(editor.view.state.selection.$anchor.pos + 1).run()
        }
      }
    }
  };

  const saveDocument = async () => {
    mixpanel.track("clicked save document");
    const html = editor.getHTML();
    makePostRequest(
      `${SECOND_BACKEND_URL}/api/writing/storage/update-essay-content`,
      { _id: currDocument._id, essayContent: html },
    ).then((res) => {
      toast.success("Saved document!");
    });
  };

  const handleConfirmBypassClick = () => {
    mixpanel.track("clicked confirm bypass");
    setShowConfirmModal(false);
    handleAIDetection();
  };

  const { showConfirmModal, ConfirmModal, setShowConfirmModal } =
    useConfirmModal({
      handleConfirm: handleConfirmBypassClick,
    });

  const [input, setInput] = useState("");

  const handleModalInput = (input: string) => {
    if (createType.length === 0) {
      handleRenameDocument(input);
    } else {
      setInput(input);
    }
  };

  const handleRenameDocument = (essayName: string) => {
    makePostRequest(
      `${SECOND_BACKEND_URL}/api/writing/storage/update-essay-name`,
      { _id: currDocument._id, essayName },
    ).then((res) => {
      setCurrDocument({ ...currDocument, essayName });
      updateDocument({ ...currDocument, essayName });
    });
  };

  const updateDocument = (currDocument: Record<string, any>) => {
    const folderId = currDocument.folderId;

    // save current document's essay content
    if (folderId && folderId.length > 0) {
      const newFoldersWithEssays = { ...foldersWithEssays };
      const newEssays = newFoldersWithEssays[folderId].essays.map(
        (essay: Record<string, any>) => {
          if (essay._id === currDocument._id) {
            essay = currDocument;
          }
          return essay;
        },
      );
      newFoldersWithEssays[folderId].essays = newEssays;
      setFoldersWithEssays(newFoldersWithEssays);
    } else {
      // delete from essaysWithoutFolders
      const newEssaysWithoutFolders = essaysWithoutFolders.map((essay) => {
        if (essay._id === currDocument._id) {
          essay = currDocument;
        }
        return essay;
      });
      setEssaysWithoutFolders(newEssaysWithoutFolders);
    }
  };

  const { showInputModal, InputModal, setShowInputModal } = useInputModal({
    submitInput: handleModalInput,
  });

  const [createType, setCreateType] = useState("");

  const exportDocument = async () => {
    const html = editor.getHTML();
    const opt = {
      margin: {
        top: 100,
      },
      orientation: "landscape" as const, // type error: because typescript automatically widen this type to 'string' but not 'Orient' - 'string literal type'
    };
    const data = await asBlob(html, opt);
    saveAs(data as Blob, "file.docx"); // save as docx file
  };

  return (
    <div
      className={
        isMobile
          ? "layoutApp flex w-screen flex-col items-center overflow-hidden"
          : "layoutApp flex w-screen flex-col items-center px-12"
      }
    >
      <AdQueueModal />
      <ConfirmModal />
      <InputModal />
      <AccountModal />
      <Drawer
        isOpen={isOpen}
        closeDrawer={() => setIsOpen(false)}
        foldersWithEssays={foldersWithEssays}
        setFoldersWithEssays={setFoldersWithEssays}
        essaysWithoutFolders={essaysWithoutFolders}
        setEssaysWithoutFolders={setEssaysWithoutFolders}
        openDocument={openDocument}
        currDocument={currDocument}
        setCurrDocument={setCurrDocument}
        setDefaultTextHTML={setDefaultTextHTML}
        createType={createType}
        setCreateType={setCreateType}
        setShowInputModal={setShowInputModal}
        input={input}
        setInput={setInput}
      />
      <div className="flex w-full flex-row justify-between">
        <div
          className={`mt-7 flex items-center ${isMobile ? "flex-row" : "w-11/12"
            } ml-2 flex-row justify-start leading-none`}
        >
          <span onClick={() => setIsOpen(true)} className="cursor-pointer">
            <Image
              src="/images/hamburger-icon.svg"
              width={25}
              height={30}
              alt="Sidebar Image"
              className={isMobile ? "ml-[5px]" : "mr-2"}
            />
          </span>
          {!isMobile && (
            <button onClick={() => setShowInputModal(true)}>
              <span
                className={
                  isMobile
                    ? "mt-[5px] text-[14px] text-[#7A7A7A]"
                    : "text-[20px] text-[#7A7A7A]"
                }
              >
                {currDocument.essayName}
              </span>
            </button>
          )}
          <button onClick={() => setShowAccountModal(true)}>
            <FaUser className="ml-4 text-gray-500" />
          </button>
        </div>
        <div
          className={
            isMobile
              ? "mt-6 flex w-9/12 justify-between space-x-1"
              : "mt-6 flex w-11/12 justify-end"
          }
        >
          <button
            className={
              isMobile
                ? "inline-flex items-center rounded-full bg-Blue-50 py-2 px-3 text-Blue-100 drop-shadow-lg"
                : "mr-5 inline-flex items-center rounded-full bg-Blue-50 py-2 px-4 text-Blue-100 drop-shadow-lg"
            }
            onClick={saveDocument}
          >
            <span>
              <FaRegSave className="mr-1" size={isMobile ? 12 : 16} />
            </span>
            <span
              className={
                isMobile ? "text-[10px] font-bold" : "text-sm font-semibold"
              }
            >
              Save
            </span>
          </button>
          <button
            className={`inline-flex items-center rounded-full bg-Blue-50 py-2 px-3 text-Blue-100 drop-shadow-md ${isMobile ? "" : "mr-5"
              } disabled:opacity-50 disabled:cursor-not-allowed"`}
            onClick={generateNextSentence}
          >
            <span>
              <Image
                src="/images/Lightning.png"
                width={isMobile ? 10 : 18}
                height={isMobile ? 15 : 25}
                alt="Sidebar Image"
                className="mr-1"
              />
            </span>
            <span
              className={
                isMobile ? "text-[10px] font-bold" : "text-sm font-semibold"
              }
            >
              {isMobile ? "Autocomplete" : "Next Sentence"}
            </span>
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            className={
              isMobile
                ? "mr-[10px] inline-flex items-center rounded-full bg-Blue-50 py-2 px-3 text-Blue-100 drop-shadow-md"
                : "inline-flex items-center rounded-full  bg-Blue-50 py-2 px-4 text-Blue-100 drop-shadow-md"
            }
          >
            <span>
              <Image
                src="/images/ShieldCheck.png"
                width={isMobile ? 10 : 18}
                height={isMobile ? 15 : 25}
                alt="Sidebar Image"
                className="mr-1"
              />
            </span>
            <span
              className={
                isMobile ? "text-[10px] font-bold" : " text-sm font-semibold"
              }
            >
              Enhance
            </span>
          </button>
          {!isMobile && !isUserPro && (
            <button
              onClick={() => router.push("/upgrade")}
              className="ml-4 inline-flex items-center rounded-full  bg-black py-2 px-4 drop-shadow-lg"
            >
              <span className="font-semibold text-white">🚀 Upgrade</span>
            </button>
          )}
        </div>
      </div>
      <div
        className={
          isMobile
            ? "mt-6 h-screen  w-full pl-[5px] pr-[5px]"
            : "mt-6 h-screen w-[53rem] shadow-white"
        }
      >
        {isMobile && (
          <span className="mb-4 flex w-full items-center justify-center text-lg font-bold text-gray-800">
            {currDocument.essayName}
            {/* TODO handle change essay name logic + new document bug + drawer bug*/}
            <button onClick={() => setShowInputModal(true)}>
              <FaPen size={12} className="ml-2" />
            </button>
          </span>
        )}
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
          currDocument={currDocument}
        />
        <div
          className={`flex flex-row items-center justify-between px-1 ${isMobile ? "" : ""
            }`}
        >
          <p className={`wordCount mt-3 text-center md:mr-auto `}>
            words: {wordCount}
          </p>
          <button
            className={
              "rewriteButton mt-3 inline-flex items-center rounded-full bg-Blue-50 py-1 px-3 text-white drop-shadow-lg"
            }
            onClick={exportDocument}
          >
            <span>
              <FaRegFileWord className="mr-1" size={isMobile ? 12 : 16} />
            </span>
            <span
              className={
                isMobile ? "text-[10px] font-bold" : "text-sm font-semibold"
              }
            >
              Export
            </span>
          </button>
        </div>
      </div>

      {/* Citation Popover Card */}
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
                  {!isUserPro ? (
                    <Link href="/upgrade" rel="noreferrer">
                      <p className="tracking-wide">Cite (Pro Feature)</p>
                    </Link>
                  ) : (
                    <p className="tracking-wide">Cite</p>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
