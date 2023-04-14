import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { TiptapContext } from "context/TiptapContext";
import React, { useContext, useEffect, useState } from "react";
import { SECOND_BACKEND_URL } from "utils/constants";
import { makePostRequest } from "utils/requests";
import LoadingDots from "../shared/loading-dots";
import { isMobile } from "react-device-detect";

// eslint-disable-next-line import/no-anonymous-default-export, react/display-name
export default (prop) => {
  const [response, setResponse] = useState();
  const [showLoading, setShowLoading] = useState(true);
  var apiCalled = false;;
  const { setShowSuggestionsModal, setIsSuggestedTextAdded, apiCalled1stTime, setDisableNextButton, setApiCalled1stTime } = useContext(TiptapContext)
  const [suggestedTextEnabled, setSuggestedTextEnabled] = useState(true);

  const [backendURL, setBackendURL] = useState(`${SECOND_BACKEND_URL}/ai/api/generate-sentence-landing`);

  useEffect(() => {
    // see if current url is index.js
    if (window.location.pathname === "/") {
      // if so, set suggestedTextEnabled to true
      setSuggestedTextEnabled(true);
      setBackendURL(`${SECOND_BACKEND_URL}/ai/api/generate-sentence-landing`)
    }
  }, [window]);

  useEffect(() => {
    if (isMobile) return;
    
    if (showLoading) {
      if (typeof setIsSuggestedTextAdded === "function") {
        setIsSuggestedTextAdded(false)
      }
    }
  }, [showLoading])

  useEffect(() => {
    const suggestedTextEnabled = localStorage.getItem("suggestedTextEnabled");    
    if (suggestedTextEnabled) {
      console.log("Setting suggest text enabled");
      console.log(suggestedTextEnabled == "true");
      setSuggestedTextEnabled(true);
    }
  }, []);

  /**
   * TODO: Should get last 100 characters from behind where
   * the cursor is at, but this instead gets it from
   * the end of the document
   * @param {*} editor
   * @returns
   */
  const getLast100CharactersText = (editor) => {
    let text = "";

    try {
      text = editor.view.state.selection.$head.parent.content.content[0].text;
      if (!text) throw new Error("text is empty");
    } catch (e) {
      text = editor.getText();
    }

    let last100Chars = "";
    if (text && text.length > 0) {
      // get last 100 characters
      last100Chars = text.substring(text.length - 100, text.length);
    }

    return last100Chars;
  }

  const get200CharactersBehindCursorPos = (editor) => {
    let text = "";
    try {
      text = editor.view.state.selection.$head.parent.content.content[0].text;
      if (!text) throw new Error("text is empty");
    } catch (e) {
      text = editor.getText();
    }
    let first200Chars = "";
    if (text && text.length > 0) {
      //store cursor position
      const cursorPos = editor.state.selection.$anchor.pos;
      // get last 100 characters
      first200Chars = text.substring(cursorPos - 200, cursorPos);
    }

    return first200Chars;
  }

  useEffect(() => {
    // get editor content and send to API
    // save response to state
    if (isMobile) return;

    if (!prop.editor) return;
    if (!suggestedTextEnabled) return;
    
    const last100Chars = getLast100CharactersText(prop.editor);
    const first100Chars = get200CharactersBehindCursorPos(prop.editor);

    const data = {
      query: first100Chars ? first100Chars : last100Chars,
    }

    if (last100Chars && last100Chars.length > 0) {
      if (!apiCalled) {
        apiCalled = true;
        makePostRequest(backendURL, data)
          .then((res) => {
            let nextSentence = res.data;
            // if(typeof setApiCallCount === "function"){
            //   setApiCallCount((prevCount) => prevCount + 1)
            // }

            if (last100Chars && last100Chars[last100Chars.length - 1] !== " ") {
              nextSentence = " " + nextSentence;
            }
            localStorage.setItem("nextSentenceText", nextSentence);
            setResponse(nextSentence);
            if (!apiCalled1stTime) {
              setApiCalled1stTime(true)
              setShowSuggestionsModal(true)
            } 
          })
          .catch((err) => {
            console.error(err);
          });
      }
    } else {
      localStorage.setItem("nextSentenceText", '');
      setResponse('');
    }
    //dispatch to store
  }, [prop.editor, suggestedTextEnabled])

  useEffect(() => {
    if (response && typeof setDisableNextButton == 'function') {
      setDisableNextButton(false)
    }
    else {
      setDisableNextButton(true)
    }
  }, [response])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [prop.editor]);

  if (window.getSelection()?.toString() || isMobile) {
    return <NodeViewWrapper className="node-view"> </NodeViewWrapper>
  }

  return (
    <NodeViewWrapper className="node-view">
      {suggestedTextEnabled ? (
        !showLoading ? (
          <span className="label" contentEditable={false}>
            {response}
          </span>
        ) : (
          <LoadingDots />
        )
      ) : (
        <></>
      )}
    </NodeViewWrapper>
  );
};
