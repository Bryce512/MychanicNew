// firebaseService.ts
import { 
  initializeApp, 
  getApp, 
  getApps 
} from '@react-native-firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as authSignOut,
  onAuthStateChanged
} from '@react-native-firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get 
} from '@react-native-firebase/database';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZ2Xk8Kkbc-0tdkJBqWhqNZie8Ls7cEnc",
  authDomain: "fluid-tangent-405719.firebaseapp.com",
  databaseURL: "https://fluid-tangent-405719-default-rtdb.firebaseio.com",
  projectId: "fluid-tangent-405719",
  storageBucket: "fluid-tangent-405719.firebasestorage.app",
  messagingSenderId: "578434461817",
  appId: "1:578434461817:ios:5509bcf8e73151e2c524a8"
};

// Flag to track initialization status
let isInitialized = false;

// Initialize Firebase - get the existing app or create a new one
export const initializeFirebase = async () => {
  // If we've already initialized, return early to prevent duplicate initialization
  if (isInitialized) {
    console.log("Firebase already initialized by this service");
    return getApp();
  }

  try {
    // Check if already initialized
    if (getApps().length === 0) {
      // Only initialize if no apps exist
      initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully");
    } else {
      console.log("Firebase app already exists, using existing app");
    }
    isInitialized = true;
    return getApp();
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw error;
  }
};

// Function to write data to the database
export const writeData = (userId: string, name: string, email: string) => {
  const database = getDatabase();
  const userRef = ref(database, `users/${userId}`);
  
  const userData = {
    name: name,
    email: email,
  };

  return set(userRef, userData)
    .then(() => console.log("Data written successfully"))
    .catch((error) => console.error("Error writing data:", error));
};

// Function to read data from the database
export const readData = (userId: string) => {
  const database = getDatabase();
  const userRef = ref(database, `users/${userId}`);
  
  return get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log(userData);
        return userData;
      } else {
        console.log("No data available");
        return null;
      }
    })
    .catch((error) => {
      console.error("Error reading data:", error);
      throw error;
    });
};

// Authentication functions
export const signIn = async (email: string, password: string) => {
  try {
    // Basic validation before attempting sign in
    if (!email || !email.trim()) {
      return { user: null, error: { code: 'auth/empty-email', message: 'Email cannot be empty' } };
    }
    
    if (!password || password.length < 6) {
      return { user: null, error: { code: 'auth/weak-password', message: 'Password must be at least 6 characters' } };
    }
    
    // Use React Native Firebase auth
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    // Provide more specific error messages based on Firebase error codes
    console.error("Firebase authentication error:", error.code, error.message);
    
    let errorMessage = 'Failed to sign in';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account exists with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed login attempts. Please try again later';
    }
    
    return { 
      user: null, 
      error: {
        code: error.code || 'auth/unknown',
        message: errorMessage,
        originalError: error 
      }
    };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const signOut = async () => {
  const auth = getAuth();
  return authSignOut(auth);
};

export const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: FirebaseAuthTypes.User | null) => void) => {
  const auth = getAuth();
  return onAuthStateChanged(auth, callback);
};

export default {
  initializeFirebase,
  readData,
  writeData,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  onAuthChange,
};
