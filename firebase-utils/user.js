

import firebase_app from "./config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from "axios";
import { SECOND_BACKEND_URL } from "utils/constants";
import { LOCAL_STORAGE_KEY, storeLocally } from "utils/local-storage";
import mixpanel
 from "mixpanel-browser";
 import { decryptHash } from "@/lib/utils";
import { createBackendHeaders, createUserInMongoDB } from "mongodb-utils/user";
import { toast } from "react-hot-toast";

export const auth = getAuth(firebase_app);



export function mapAuthCodeToMessage(authCode) {

  // get string part of authCode if not already
  if (authCode && authCode.errorCode) authCode = authCode.errorCode;

  console.warn("AUTH CODE:");
  console.log(authCode);


  // if popup is blocked, authCode is null
  if ( authCode &&authCode.includes("popup")) {
    return "Sign in popup was blocked. Please enable popups in top-right of address bar for this website, or login with email / password.";
  }

  if (authCode) { 
    switch (authCode) {
      case "auth/wrong-password":
      case "auth/invalid-password":
        return "Wrong password.";

      case "auth/invalid-email":
        return "Email provided is invalid";

      case "auth/email-already-in-use":
        return "Email provided is already in use. Please login.";

      case "auth/user-not-found":
        return "User not found, please use another email or sign up.";

      default:
        return "Oh no, a server error happened! Please email help@getconch.ai or DM us on socials and we will respond ASAP!";
    }
  }

  return "Oh no, a server error happened! Please email help@getconch.ai or DM us on socials and we will respond ASAP!";
}
export async function checkIfRefer(routeTo, email, accessToken) {
  let result = null,
  error = null;
  try {
    if (routeTo.toString().includes("referredBy")) {
      const referredBy = routeTo.split("=")[1];
      const referrer = decryptHash(referredBy.toString());
      mixpanel.track("successful referral");

      console.log("CALLING REFERRAL!");

      const resp = await axios.post(`${SECOND_BACKEND_URL}/auth/handle-referral`, { currUserEmail: email, referrerEmail: referrer }, createBackendHeaders(accessToken));
      if (resp.status !== 200) {
        throw new Error("Server error creating referral in database, please try again.");
      }
    }
  } catch (e) {
    console.log("ERROR CREATING REFERRAL!");
    console.log(e);
    error = mapAuthCodeToMessage(e.code);
  }
}

export async function signUpFirebase(email, password, routeTo = "") {
    let result = null,
        error = null;
        console.log(routeTo, "routeTo1")
    try {
        result = await createUserWithEmailAndPassword(auth, email, password);

        console.log("Result:");
        console.log(result);

        // Important: from now on, use same email as firebase (lowercase / format / etc)
        const firebaseEmail = result.user.email ? result.user.email : email.toLowerCase();
        const access_token = await result.user.getIdToken();

        console.log("Firebase email: ", firebaseEmail);
        console.log("Firebase access token: ", access_token);

        // then send post request to create user in mongodb using axios
        await createUserInMongoDB(firebaseEmail, access_token);
     
        await checkIfRefer(routeTo, result.user.email, access_token)
    } catch (e) {
      console.log(e);
      error = mapAuthCodeToMessage(e.code);
    }

    return { result, error };
}
 
export async function signInFirebase(email, password) {
  let result = null,
      error = null;
  try {
      result = await signInWithEmailAndPassword(auth, email, password);

      console.log("Firebase result:");
      console.log(result);

      // Important: from now on, use same email as firebase (lowercase / format / etc)
      const firebaseEmail = result.user.email ? result.user.email : email.toLowerCase();
      const access_token = await result.user.getIdToken();

      // then send post request to create user in mongodb using axios
      await createUserInMongoDB(firebaseEmail, access_token);

  } catch (e) {
    error = mapAuthCodeToMessage(e.code);
  }

  return { result, error };
}


export const isUserLoggedIn = () => { 
  return new Promise((resolve, reject) => {
     auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        console.log('User is logged in!');
        console.log('Email: ' + user.email);
        console.log('UID: ' + user.uid);
         window.location.replace('/onboarding');
    } else {
        // User is signed out.
        console.log('No user is logged in');
        window.location.replace('/check');
    }
    }
    )
})}

export const signOutFirebase = () => {
  return new Promise((resolve, reject) => {
    auth.signOut().then(() => {
      // Sign-out successful.
      console.log('User signed out');
      window.location.replace('/');
    }).catch((error) => {
      // An error happened.
      console.log(error);
    });
  })}


export async function isLoggedInFirebase() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(!!user);
    }, reject);
  });
}

export async function getCurrentFirebaseUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

export async function getReqHeadersWithFirebaseAccessToken() {
  const user = await getCurrentFirebaseUser();
  if (!user) return null;

  const accessToken = await user.getIdToken(true);

  return {
    headers: {
      access_token: accessToken,
      email: user.email,
    }
  }
}


