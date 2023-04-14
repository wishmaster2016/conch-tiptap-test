import React, { useState } from 'react'
import Chatbot from "react-chatbot-kit";

import config from '@/components/chatbot/config.js';
import MessageParser from '@/components/chatbot/MessageParser.jsx';
import ActionProvider from '@/components/chatbot/ActionProvider.jsx';
import { LOCAL_STORAGE_KEY } from 'utils/local-storage';
import Image from 'next/image';
import ManualTooltip from '../shared/manual-tooltip';
import { useAuth } from '../../context/AuthContext';

function ConchChatbot() {
  const [showBot, setShowBot] = useState(false);

  const loadMessages = () => {    
    const messages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.CHAT_MESSAGES));
    return messages;
  };

  return (
    <div>
      {showBot && 
        <div className="app-chatbot-container">
          <Chatbot
            config={config}
            actionProvider={ActionProvider}
            messageParser={MessageParser}
            messageHistory={loadMessages()}
          />
        </div>}
        <button
          className="app-chatbot-button flex justify-center items-center"
          onClick={() => setShowBot((prev) => !prev)}
        >
          <Image src="/logo_w_background.png" className='w-20' width={778} height={767} />
        </button>
    </div>
  )
}

export default ConchChatbot