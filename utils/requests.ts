import axios from "axios";
import { getReqHeadersWithFirebaseAccessToken } from "firebase-utils/user";

/**
 * Wrapper around axios to make post requests
 * @param url 
 * @param data 
 * @param useHeaders 
 * @returns 
 */
export const makePostRequest = async (url: string, data: Record<string, any>, useHeaders = true) => {
  // If should use headers, get headers
  let reqHeaders = {}
  if (useHeaders) {
    reqHeaders = await getReqHeadersWithFirebaseAccessToken() || {};
  }
  
  // Return axios post request
  return axios.post(url, data, reqHeaders);
};