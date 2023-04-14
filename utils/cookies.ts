import { setCookie, getCookie } from 'cookies-next';
import { SECOND_BACKEND_URL } from './constants';
import { makePostRequest } from './requests';

export const getUserSessionId = () => {
  // Get user session id from cookie
  const userSessionId = getCookie('userSessionId');

  if (!userSessionId) {
    // If no user session id, generate one
    const newSessionId = '1234';

    // Set cookie
    setCookie('userSessionId', newSessionId, {
      maxAge: 60 * 60 * 24 * 2000, // 1 year
      path: '/',
    });

    return newSessionId;
  }

  return userSessionId;
}

export const validateAndSetSessionId = (sessionId: string, userData: Record<string, any>) => {
  // see if user's database already contains the session
  if (userData.sessionIds.includes(sessionId)) {
    return true;
  }

  // if not, add it to the database
  makePostRequest(`${SECOND_BACKEND_URL}/auth/update-session-ids`, {
    sessionId
    });

  return true;
}

