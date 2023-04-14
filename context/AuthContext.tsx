import axios from "axios";
import { isLoggedInFirebase, signOutFirebase } from "firebase-utils/user";
import { getCurrentFirebaseUser } from "firebase-utils/user";
import { createBackendHeaders } from "mongodb-utils/user";
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { SECOND_BACKEND_URL } from "utils/constants";
import { LOCAL_STORAGE_KEY } from "utils/local-storage";
import { makePostRequest } from "utils/requests";
import { MAX_LOGIN_SESSIONS } from "../utils/constants";

type authContextType = {
  loadedInData: boolean;
  isLoggedIn: boolean;
  isUserPro: boolean;
  firebaseUser: Record<string, any>;
  mongoDBUser: Record<string, any>;
  login: () => void;
  logout: () => void;
  updateUser: () => void;
  updateUserOnFrontend: (user: Record<string, any>) => void;
};

const authContextDefaultValues: authContextType = {
  loadedInData: false,
  isLoggedIn: false,
  isUserPro: false,
  firebaseUser: {},
  mongoDBUser: {},
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  updateUserOnFrontend: (user: Record<string, any>) => {},
};

const AuthContext = createContext<authContextType>(authContextDefaultValues);

export function useAuth() {
  return useContext(AuthContext);
}

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [loadedInData, setLoadedInData] = useState(false);

  // All the user data
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUserPro, setIsUserPro] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<Record<string, any>>({});
  const [mongoDBUser, setMongoDBUser] = useState<Record<string, any>>({});

  // TODO: make this use effect trigger only once
  useEffect(() => {
    // If nothing is loaded in, then get data
    if (!loadedInData) {
      getAllInitialData();
    }
  }, [loadedInData]);

  const getAllInitialData = async () => {
    const isLoggedIn = await isLoggedInFirebase();
    setIsLoggedIn(isLoggedIn);

    if (!isLoggedIn) return;

    const firebaseUser = await getCurrentFirebaseUser();

    // if no firebase user, reject request
    if (!firebaseUser) { 
      return;
    }

    const email = firebaseUser.email;

    const accessToken = await firebaseUser.getIdToken(true);
  
    const response = await axios.post(`${SECOND_BACKEND_URL}/auth/get-user-using-email-v2`, { email }, createBackendHeaders(accessToken));
    
    // check if error
    if (response.status !== 200) {
      console.log("Error getting user data from MongoDB");
      console.log("User email: " + email);
    }

    const mongoDBUser = response.data;

    // Check if user is pro
    if (mongoDBUser && mongoDBUser.currPlan && mongoDBUser.currPlan.length > 0) {
      setIsUserPro(true);
    }

    setFirebaseUser(firebaseUser);
    setMongoDBUser(response.data);

    setLoadedInData(true);
  }

  useEffect(() => {
    // Once user is available
    if (mongoDBUser && mongoDBUser._id) {
      validateMaxTwoSessions();
    }
  }, [mongoDBUser]);


  /**
   * Generate a session token if one does not exist
   */
  const validateMaxTwoSessions = () => {
    // have a current session token
    let sessionToken = localStorage.getItem(LOCAL_STORAGE_KEY.SESSION_TOKEN) || '';

    // if no session token, generate one
    if (!sessionToken) {
      sessionToken = generateSessionToken();
    }

    // get all session tokens
    const sessionTokens = removeDuplicateArrayItems(mongoDBUser.sessions) || [];

    // see if it is already in the array --> exit
    if (sessionTokens.includes(sessionToken)) {
      return;
    }

    // if not in array and there's already 2 --> log user out with toast message
    if (sessionTokens.length >= MAX_LOGIN_SESSIONS) {
      toast.error('Maximum number of sessions exceeded. You may only be logged in 2 sessions. Please logout of one of your other sessions.', { duration: 10000 });
      // wait 3 seconds before logging out
      setTimeout(() => {
        logout();
      }, 4000);
      return;
    } else {
      // otherwise, add curr session token to sessions array on backend
      makePostRequest(`${SECOND_BACKEND_URL}/auth/add-session`, { sessionToken }).then(() => {
        // store session token locally
        localStorage.setItem("sessionToken", sessionToken);
      }).catch((err) => {
        console.error('Error setting session token:');
        console.error(err);
      });
    }
  };

  const generateSessionToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const removeDuplicateArrayItems = (arr: string[]) => {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  const login = () => {

  };

  /**
   * Handle all steps of logging out:
   * 1. Remove session token from MongoDB
   * 2. Sign out of Firebase
   * 3. Remove local storage items
   * 4. Reload window
   */
  const logout = () => {
    let sessionToken = localStorage.getItem(LOCAL_STORAGE_KEY.SESSION_TOKEN) || '';

    // remove session token (pass empty string if no sessino token)
    makePostRequest(`${SECOND_BACKEND_URL}/auth/remove-session`, { sessionToken }).then(() => {
      // sign out of firebase
      signOutFirebase().then(() => {
        // remove local storage items
        localStorage.removeItem(LOCAL_STORAGE_KEY.USER_ID);
        localStorage.removeItem(LOCAL_STORAGE_KEY.SESSION_TOKEN);

        // reload window
        window.location.reload();
      });  
    }).catch((err) => {
      console.error('Error setting session token:');
      console.error(err);
    });
  };

  const updateUser = () => {
    getAllInitialData();
  }

  const updateUserOnFrontend = (newUser: Record<string, any>) => {
    setMongoDBUser(newUser);
  }

  const value = {
    loadedInData,
    isLoggedIn,
    isUserPro,
    firebaseUser,
    mongoDBUser,
    login,
    logout,
    updateUser,
    updateUserOnFrontend
  };

  return (
    <>
      <AuthContext.Provider value={value}>
          {children}
      </AuthContext.Provider>
    </>
  );
}