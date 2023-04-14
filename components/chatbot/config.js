import Image from 'next/image';
import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  initialMessages: [createChatBotMessage(`Hi, how can I help you? Please wait a couple of seconds for me to respond.`), createChatBotMessage(`P.S. Type /help and then your question for me to give you customer service.`)],
  customStyles: {
    botMessageBox: {
      backgroundColor: 'rgba(123, 97, 255, 1)',
      fontWeight: '500',
      fontSize: '24px',
      marginLeft: "10px",
    },
    chatButton: {
      backgroundColor: 'rgba(123, 97, 255, 1)',
    },
  },
  customComponents: {
    // Replaces the default header
    header: () => <div className="react-chatbot-kit-header">ConchGPT</div>,
    // Replaces the default bot avatar
    botAvatar: (props) => 
      <Image
        src="/logo.png"
        alt="Conch Logo"
        className="h-10 w-10 rounded-full"
        width={200}
        height={200}
      />
    ,
 },
};

export default config;