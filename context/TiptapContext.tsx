import React, { createContext, useContext, useState } from "react";

type tiptapContextType = {
  showSuggestionsModal: boolean;
  setShowSuggestionsModal: (val: boolean) => void;
  setIsSuggestedTextAdded: (val: boolean) => void;
  isSuggestedTextAdded: boolean;
  stopHighlightModal: boolean;
  setStopHighlightModal: (val: boolean) => void;
  disableNextButton: boolean;
  setDisableNextButton: (val: boolean) => void;
  apiCalled1stTime: boolean;
  setApiCalled1stTime: (val: boolean) => void;
  apiCallCount: number;
  setApiCallCount: (val: number) => void;
};

//@ts-ignore
export const TiptapContext = createContext<tiptapContextType>({});

export function useTipTap() {
  return useContext(TiptapContext);
}

const TiptapContextProvider = ({ children }: any) => {
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [isSuggestedTextAdded, setIsSuggestedTextAdded] = useState(false);
  const [apiCallCount, setApiCallCount] = useState(0);
  const [apiCalled1stTime, setApiCalled1stTime] = useState(false);
  const [stopHighlightModal, setStopHighlightModal] = useState(false);
  const [disableNextButton, setDisableNextButton] = useState(true);

  return (
    <TiptapContext.Provider
      value={{
        showSuggestionsModal,
        setShowSuggestionsModal,
        isSuggestedTextAdded,
        setStopHighlightModal,
        disableNextButton,
        setDisableNextButton,
        stopHighlightModal,
        setIsSuggestedTextAdded,
        apiCalled1stTime,
        setApiCalled1stTime,
        apiCallCount,
        setApiCallCount
      }}
    >
      {children}
    </TiptapContext.Provider>
  );
};

export default TiptapContextProvider;
