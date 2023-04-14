import React, { useEffect } from 'react';

const MessageParser = ({ children, actions }) => {

  /**
   * Handles incoming messages
   * @param {*} message - string
   */
  const parse = (message) => {
    // if message begins with /help
    if (message.startsWith('/help')) {
      actions.handleHelp(message);
    } else {
      actions.handleChatRequest(message);
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          parse: parse,
          actions,
        });
      })}
    </div>
  );
};

export default MessageParser;