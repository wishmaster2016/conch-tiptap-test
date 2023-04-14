import React, { useEffect } from 'react';
import { SECOND_BACKEND_URL } from 'utils/constants';
import { LOCAL_STORAGE_KEY } from 'utils/local-storage';
import { makePostRequest } from 'utils/requests';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const ActionProvider = ({ createChatBotMessage, state, setState, children }) => {

  const  { isLoggedIn } = useAuth();

  const saveMessages = (messages) => {
    localStorage.setItem(LOCAL_STORAGE_KEY.CHAT_MESSAGES, JSON.stringify(messages));
  };

  const sendMessage = (message) => {
    const botMessage = createChatBotMessage(message);
    setState((prev) => {
      const messages = [...prev.messages, botMessage];
      
      // save messages
      saveMessages(messages);

      // set new state
      return {
        ...prev,
        messages,
      }
    });
  };
  
  useEffect(() => {
    console.log(state);
  }, [state]);


  /**
   * Handle a normal ConchGPT request
   */
  const handleChatRequest = (message) => {
    if (!isLoggedIn) {
      sendMessage("You must be logged in to use the ConchGPT chatbot. You can only use /help otherwise.");
      return;
    }
    if (!message) {
      sendMessage("Please say something, don't give me an empty text like my friends do!");
      return;
    }
    makePostRequest(`${SECOND_BACKEND_URL}/ai/api/generate-conch-alternate`, { query: message })
      .then((res) => {
        const reqId = res.data;

        // Keep checking for response every X Seconds
        const POLLING_RATE = 3 * 1000;
        const MAX_POLLING_ATTEMPTS = 25;

        let pollingAttempts = 0;
        const interval = setInterval(() => {
          // If max polling attempts reached, stop polling
          if (pollingAttempts >= MAX_POLLING_ATTEMPTS) {
            clearInterval(interval);
            return;
          }

          // Make request to check if response is ready
          makePostRequest(`${SECOND_BACKEND_URL}/ai/api/get-conch-response`, {
            reqId,
          })
            .then((res) => {
              const response = res.data;

              // If a response is retrieved and processed = true, stop polling
              if (response && response.processed) {
                // Clear interval
                clearInterval(interval);

                sendMessage(response.response);
              } else {
                console.log("Response not ready yet");
              }
            })
            .catch((err) => {
              console.log(err);
              setConchPopover(false);
            });

          // Increment polling attempts
          pollingAttempts++;
        }, POLLING_RATE);

        // insertTextIntoFocusedElement(response, customDocument, isIframe);
      })
      .catch((err) => {
        // if response code = 402
        if (err.response && err.response.status === 402) {
          // show out of tokens modal
          setShowOutOfTokensModal(true);
        } else {
          console.log(err);
          toast.error("Something went wrong. Please save document, refresh, and try again.");
        }
      });
  }

  /**
   * Handle a /help command
   */
  const handleHelp = (message) => {
    // remove /help from message
    message = message.replace('/help', '');
    // remove space from front
    message = message.trim();

    if (!message) {
      console.log("message");
      console.log(message);
      
      sendMessage("Please enter a request after help like: /help how do I use the citation feature?");
      return;
    }

    makePostRequest(`${SECOND_BACKEND_URL}/chatbot/help`, { message })
    .then((res) => {
      // Get and send response as message
      const response = res.data;
      sendMessage(response);
    })
    .catch((err) => {
      // if response code = 402
      if (err.response && err.response.status === 402) {
        // show out of tokens modal
        setShowOutOfTokensModal(true);
      } else {
        console.log(err);
        toast.error("Something went wrong. Please save document, refresh, and try again.");
      }
    });
  }

  /**
   * Actions possible by the chatbot that can be called in MessageParser
   */
  const actions = {
    handleChatRequest,
    handleHelp
  }

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions,
        });
      })}
    </div>
  );
};

export default ActionProvider;