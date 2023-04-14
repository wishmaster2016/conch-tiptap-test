import { useEditor, EditorContent, useSuggest } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { isMobile } from "react-device-detect";
import { motion } from "framer-motion";
import {
  FaBold,
  FaHeading,
  FaItalic,
  FaListOl,
  FaListUl,
  FaQuoteLeft,
  FaRedo,
  FaStrikethrough,
  FaUnderline,
  FaUndo,
} from "react-icons/fa";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import Paragraph from "@tiptap/extension-paragraph";
import Link from "@tiptap/extension-link";
import Superscript from "@tiptap/extension-superscript";
// import Placeholder from '@tiptap/extension-placeholder'
import NonEditableText from "./nonEditableText";
// import NonEditableTextView from './nonEditableTextView';
import debounce from "lodash.debounce";
import { TiptapContext } from "context/TiptapContext";

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className={isMobile ? "mobileMenuBar" : "menuBar"}>
      <div>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is_active" : ""}
        >
          <FaBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is_active" : ""}
        >
          <FaItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is_active" : ""}
        >
          <FaUnderline />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is_active" : ""}
        >
          <FaStrikethrough />
        </button>
        {/* <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is_active" : ""
          }
        >
          <FaHeading />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is_active" : ""
          }
        >
          <FaHeading className="heading3" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is_active" : ""}
        >
          <FaListUl />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is_active" : ""}
        >
          <FaListOl />
        </button> */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is_active" : ""}
        >
          <FaQuoteLeft />
        </button>
      </div>
      <div>
        <button onClick={() => editor.chain().focus().undo().run()}>
          <FaUndo />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()}>
          <FaRedo />
        </button>
      </div>
    </div>
  );
};

export const Tiptap = ({
  isWebApp,
  setEditor,
  defaultTextHTML,
  setTextHTML,
  setTextString,
  setWordCount,
  scrollToPplSentence,
  handleTextSelected,
  suggestText,
  currDocument
}) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showOnce, setShowOnce] = useState(false);
  const {
    showSuggestionsModal,
    setShowSuggestionsModal,
    isSuggestedTextAdded,
    setIsSuggestedTextAdded,
  } = useContext(TiptapContext);


  const editor = isMobile ?  useEditor({
    // extensions
    extensions: [StarterKit, Underline, CharacterCount, Highlight.configure({
      multicolor: true
    }),
    Paragraph.configure({
      HTMLAttributes: {
        class: 'tiptap-paragraph',
      },
    }), 
    Link.configure({
      openOnClick: true,
    }), Superscript],
    // when typed
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      setWordCount(editor.storage.characterCount.words());
      setTextHTML(html);
      setTextString(text);

      addListenerToHighlights();

      // add a debouncer to save the text
      saveDocumentDebounced(html, currDocument);
    },
    onTransaction: ({ editor }) => {
      const { doc } = editor.view.state;
      if (suggestText && !suggestText.current) {
        suggestText.current = true;
     
        doc.descendants((node, pos) => {
          if (node.type.name === "reactComponent") {
            if(typeof setShowSuggestionsModal == 'function'){
              setIsSuggestedTextAdded(true)
            }
            editor.commands?.deleteRange({ from: pos, to: pos + 1 });
          }
        });
      }
      doc.descendants((node, pos) => {
        if (node.type.name === "reactComponent") {
          setShowModal(true);
        }
      });
      handleTextSelection(editor);
    },
  }) :  useEditor({
    // extensions
    extensions: [StarterKit, Underline, CharacterCount, Highlight.configure({
      multicolor: true
    }),
    NonEditableText,
    Paragraph.configure({
      HTMLAttributes: {
        class: 'tiptap-paragraph',
      },
    }), 
    Link.configure({
      openOnClick: true,
    }), Superscript],
    // when typed
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      setWordCount(editor.storage.characterCount.words());
      setTextHTML(html);
      setTextString(text);

      addListenerToHighlights();

      // add a debouncer to save the text
      saveDocumentDebounced(html, currDocument);
    },
    onTransaction: ({ editor }) => {
      const { doc } = editor.view.state;
      if (suggestText && !suggestText.current) {
        suggestText.current = true;
     
        doc.descendants((node, pos) => {
          if (node.type.name === "reactComponent") {
            if(typeof setShowSuggestionsModal == 'function'){
              setIsSuggestedTextAdded(true)
            }
            editor.commands?.deleteRange({ from: pos, to: pos + 1 });
          }
        });
      }
      doc.descendants((node, pos) => {
        if (node.type.name === "reactComponent") {
          setShowModal(true);
        }
      });
      handleTextSelection(editor);
    },
  });

  // Set editor for parent component
  useEffect(() => {
    setEditor(editor);
    return () => {};
  }, [editor, setEditor]);

  // Set default text initially and also for future manual changes
  // defaultTextHTML is modified and this useEffect is triggered
  useEffect(() => {
    if (editor && editor.commands && defaultTextHTML) {
      editor.commands?.setContent(defaultTextHTML, true);
    }
  }, [editor, defaultTextHTML]);

  const highlightClickListener = (mark) => {
    scrollToPplSentence(mark);
  }

  const addListenerToHighlights = () => {
    // get all mark elements
    const marks = document.querySelectorAll("mark");
    // loop through all mark elements
    marks.forEach((mark) => {
      // remove click listener if it exists
      mark.removeEventListener("click", () => {});

      // add click event listener
      mark.addEventListener("click", () => highlightClickListener(mark));
    });
  };

  const handleTextSelection = (editor) => {
    const view = editor.view;

    let state = view.state;

    const { from, to } = state.selection;
    const text = state.doc.textBetween(from, to, " ");

    // These are in screen coordinates
    let start = view.coordsAtPos(from),
      end = view.coordsAtPos(to);


    if (handleTextSelected) {
      // Always called
      handleTextSelected(text, start, end);
    }
  };

  /**
   * Debounce function to filter cities
   */
  const saveDocumentDebounced = debounce((html, currDocument) => {
    // Only save if current document
    if (currDocument && currDocument._id) {
      // save to backend
      // makePostRequest(`${SECOND_BACKEND_URL}/api/writing/storage/update-essay-content`, { _id : currDocument._id, essayContent: html });
    }
  }, 1000);

  return (
    <div
      className={isMobile ? "mobileTextEditor" : isWebApp && router.asPath.includes("app") ? "textEditorApp" : "textEditor"}
      style={{ height: `${isWebApp ? "90vh !important" : ""}` }}
    >
      {/* {showModal && !router.asPath.includes("app") && !router.asPath.includes("bypass") ? (
        <motion.div className="infoDiv">
          <p>Info Div</p>
        </motion.div>
      ):("")} */}

      <div className={`${isWebApp ? "webApp" : ""}`}>
        {(isWebApp && router.asPath.includes("app")) ||
        router.asPath.includes("bypass") ? (
          <MenuBar editor={editor} />
        ) : (
          ""
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
