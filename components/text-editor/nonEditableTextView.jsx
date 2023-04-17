import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { useTipTap } from 'context/TiptapContext';
import React, { useEffect, useState } from 'react';
import { SECOND_BACKEND_URL } from 'utils/constants';
import { makePostRequest } from 'utils/requests';
import LoadingDots from '../shared/loading-dots';

const backendURL = `${SECOND_BACKEND_URL}/ai/api/generate-sentence-landing`;

// eslint-disable-next-line import/no-anonymous-default-export, react/display-name
export default (prop) => {
  const [response, setResponse] = useState();
  const [showLoading, setShowLoading] = useState(false);
  const [suggestedTextEnabled, setSuggestedTextEnabled] = useState(true);

  const {
    setShowSuggestionsModal,
    setIsSuggestedTextAdded,
    apiCalled1stTime,
    setDisableNextButton,
    setApiCalled1stTime,
  } = useTipTap();

  useEffect(() => {
    const suggestedTextEnabled = localStorage.getItem('suggestedTextEnabled');
    if (suggestedTextEnabled === 'true' || window.location.pathname === '/') {
      console.log('Setting suggest text enabled');
      console.log({ suggestedTextEnabled });
      setSuggestedTextEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!showLoading) {
      setIsSuggestedTextAdded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLoading]);

  useEffect(() => {
    setDisableNextButton(!response);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  /**
   * TODO: Should get last 100 characters from behind where
   * the cursor is at, but this instead gets it from
   * the end of the document
   * @param {*} editor
   * @returns
   */
  const getLast100CharactersText = (editor) => {
    let text = '';

    try {
      text = editor.view.state.selection.$head.parent.content.content[0].text;
      if (!text) throw new Error('text is empty');
    } catch (e) {
      text = editor.getText();
    }

    let last100Chars = '';
    if (text && text.length > 0) {
      // get last 100 characters
      last100Chars = text.substring(text.length - 100, text.length);
    }

    return last100Chars;
  };

  const get200CharactersBehindCursorPos = (editor) => {
    let text = '';
    try {
      text = editor.view.state.selection.$head.parent.content.content[0].text;
      if (!text) throw new Error('text is empty');
    } catch (e) {
      text = editor.getText();
    }
    let first200Chars = '';
    if (text && text.length > 0) {
      //store cursor position
      const cursorPos = editor.state.selection.$anchor.pos;
      // get last 100 characters
      first200Chars = text.substring(cursorPos - 200, cursorPos);
    }

    return first200Chars;
  };

  useEffect(() => {
    // get editor content and send to API
    // save response to state
    if (!prop.editor || !suggestedTextEnabled) return;

    const last100Chars = getLast100CharactersText(prop.editor);
    const first100Chars = get200CharactersBehindCursorPos(prop.editor);

    const data = {
      query: first100Chars ? first100Chars : last100Chars,
    };

    if (last100Chars && last100Chars.length > 0) {
      setShowLoading(true);
      makePostRequest(backendURL, data)
        .then((res) => {
          let nextSentence = res.data;

          if (last100Chars && last100Chars[last100Chars.length - 1] !== ' ') {
            nextSentence = ' ' + nextSentence;
          }
          localStorage.setItem('nextSentenceText', nextSentence);
          setResponse(nextSentence);
          if (!apiCalled1stTime) {
            setApiCalled1stTime(true);
            setShowSuggestionsModal(true);
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => setShowLoading(false));
    } else {
      localStorage.setItem('nextSentenceText', '');
      setResponse('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prop.editor, suggestedTextEnabled]);

  return (
    <NodeViewWrapper className="node-view">
      {!window.getSelection()?.toString() && suggestedTextEnabled ? (
        showLoading ? (
          <LoadingDots />
        ) : (
          <span className="label" contentEditable={false}>
            {response}
          </span>
        )
      ) : (
        <></>
      )}
    </NodeViewWrapper>
  );
};
