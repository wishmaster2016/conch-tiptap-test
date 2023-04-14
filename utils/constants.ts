export const SITE_VERSION = '1.2.0';

export const getBackendUrl = () => {
  // generate a random number between 0 and 10
  const randomNum = Math.floor(Math.random() * 10);
  
  // if number is greater than >= 8, return alternate backend url
  if (randomNum >= 8) {
    return BACKEND_URL_ALTERNATE;
  } else {
    return BACKEND_URL;
  }
};

export const getAlternateBackendUrl = () => {
  // generate a random number between 0 and 10
  const randomNum = Math.floor(Math.random() * 10);

  // if number is greater than >= 6, return alternate backend url
  if (randomNum >= 6) {
    return BACKEND_URL_ALTERNATE;
  } else {
    return BACKEND_URL;
  }
};

export const BACKEND_URL = process.env.NEXT_PUBLIC_PRODUCTION == 'true'
  ? 'https://conch-checker-backend-tloc7.ondigitalocean.app' :
  'https://conch-checker-backend-tloc7.ondigitalocean.app';

export const BACKEND_URL_ALTERNATE = process.env.NEXT_PUBLIC_PRODUCTION == 'true'
  ? 'https://conch-checker-backend.herokuapp.com' :
  'https://conch-checker-backend.herokuapp.com';

export const SECOND_BACKEND_URL = process.env.NEXT_PUBLIC_PRODUCTION == 'true'
  ? 'https://penora-ai.herokuapp.com' :
  'http://localhost:5009';

// Perplexity colors
export const YELLOW_PERPLEXITY_MAX = 55;
export const RED_PERPLEXITY_MAX = 35;

// Score colors
export const YELLOW_SCORE_MAX = 60;
export const RED_SCORE_MAX = 40;
// score boost to add to the score after using a rewrite
export const REWRITE_ALL_SCORE_BOOST = 20;
export const REWRITE_PARAGRAPH_SCORE_BOOST = 7;

// Highlights
export const RED_HIGHLIGHT = 'rgb(255, 171, 171)';
export const YELLOW_HIGHLIGHT = 'rgb(254, 249, 204)';
export const BLUE_HIGHLIGHT = 'rgb(121, 184, 216)';

// Message types
export const AI_WRITTEN_MESSAGE = 'Your text was likely written by AI.';
export const MOSTLY_HUMAN_MESSAGE = 'Your text was mostly written by a human, but some parts may be AI written.';
export const HUMAN_WRITTEN_MESSAGE = 'Your text is likely to be written entirely by a human!';


// Sessions
export const MAX_LOGIN_SESSIONS = 3;

// Product Name
export const REWRITER_PRODUCT_NAME = 'Enhancer';

export const URL_AFTER_AUTH = '/enhance';
export const SIGNUP_PATH = '/sign-up';
export const ONBOARDING_PATH = '/onboarding';
export const BYPASS_PATH = '/enhance';
