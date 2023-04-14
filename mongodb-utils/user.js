import axios from "axios";
import { getCurrentFirebaseUser } from "firebase-utils/user";
import { SECOND_BACKEND_URL } from "utils/constants";
import { getUserSessionId } from "utils/cookies";
import { getLocally, LOCAL_STORAGE_KEY, storeLocally } from "utils/local-storage";


export function createBackendHeaders(accessToken) {
  let req_config = {
    headers: {
      access_token: accessToken,
    }
  }
  
  return req_config;
}


export async function createUserInMongoDB(email, access_token="") {
  // then send post request to create user in mongodb using axios
  const resp = await axios.post(
    `${SECOND_BACKEND_URL}/auth/create-user-db-v2`, 
    { email, isFromWebApp: true },
    createBackendHeaders(access_token)
  );

  // If error
  if (resp.status !== 200) {
    throw new Error("Server error creating user in database, please try again.");
  }

  const userId = resp.data;
  // Store userId locally
  storeLocally(LOCAL_STORAGE_KEY.USER_ID, userId);

  return userId;
}

/**
 * Get mongodb user data using the current Firebase user's email
 * @returns {Promise<{result: User Data, error: empty object }>}
 */
export function getMongoUserData() {  
  return new Promise(async function(resolve, reject) {
    const firebaseUser = await getCurrentFirebaseUser();

    // if no firebase user, reject request
    if (!firebaseUser) { 
      reject({}); 
      return;
    }

    const email = firebaseUser.email;

    const accessToken = await firebaseUser.getIdToken(true);
  
    const response = await axios.post(`${SECOND_BACKEND_URL}/auth/get-user-using-email-v2`, { email }, createBackendHeaders(accessToken));
    
    // check if error
    if (response.status !== 200) {
      console.log("Error getting user data from MongoDB");
      console.log("User email: " + email);
      // unable to get data
      reject({});
    }

    resolve(response.data);
  });
}

/**
 * Get mongodb user data using the current Firebase user's email
 * @returns {Promise<{result: User Data, error: empty object }>}
 */
export function checkIfUserExists(email) {  
  return new Promise(async function(resolve, reject) {
    const firebaseUser = await getCurrentFirebaseUser();

    // if no firebase user, reject request
    if (!firebaseUser) { 
      resolve(false); 
      return;
    }

    const accessToken = await firebaseUser.getIdToken(true);
  
    const response = await axios.post(`${SECOND_BACKEND_URL}/auth/get-user-using-email-v2`, { email }, createBackendHeaders(accessToken));
    
    // check if error
    if (response.status !== 200) {
      resolve(false);
    } else {
      resolve(true);
    }
  });
}


/**
 * Charge current firebase user in MongoDB using their email
 * @param {int} tokensToCharge 
 * @returns 
 */
export async function chargeUser(tokensToCharge) {
  const firebaseUser = await getCurrentFirebaseUser();
  
  if (firebaseUser) {
    const email = firebaseUser.email;
    const accessToken = await firebaseUser.getIdToken(true);
    const response = await axios.post(`${SECOND_BACKEND_URL}/auth/charge-user-using-email-v2`, { email, tokensToCharge }, createBackendHeaders(accessToken));
    return response.data;
  }

  return null;
}