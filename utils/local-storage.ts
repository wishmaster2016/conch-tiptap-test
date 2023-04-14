// Local storage constants

export const LOCAL_STORAGE_KEY = {
  // General site
  SITE_VERSION: 'siteVersion',
  
  // User
  USER_ID: 'userId',

  // Bypass
  BYPASS_TEXT: 'bypassText',

  // Access Token for Session Management
  SESSION_TOKEN: 'sessionToken',

  // Chatbot
  CHAT_MESSAGES: 'chatMessages',
}

export const storeLocally = (key: string, value: string) => {
  // store item in local storage
  localStorage.setItem(key, value);
}

export const getLocally = (key: string) => {
  // get item from local storage
  return localStorage.getItem(key);
}
