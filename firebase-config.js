// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, setPersistence, 
browserSessionPersistence, fetchSignInMethodsForEmail, updateEmail,
updatePassword ,reauthenticateWithCredential, sendEmailVerification, EmailAuthProvider} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator, Timestamp, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc,arrayRemove,onSnapshot, orderBy,writeBatch, serverTimestamp  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getStorage, connectStorageEmulator, ref, getDownloadURL, uploadBytes, deleteObject, getMetadata, listAll } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0MdCc0SJlf-CClySe3Ty8gX_dkWFU_V0",
  authDomain: "crf-biotech.firebaseapp.com",
  projectId: "crf-biotech",
  storageBucket: "crf-biotech.appspot.com",
  messagingSenderId: "128138667065",
  appId: "1:128138667065:web:f12e9a8dff3c9c065099e8",
  measurementId: "G-8WVH7505EQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Services Initialization
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const functions = getFunctions(app);

// Connect to Firebase Emulators (for local development)
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  // Connect to Firebase Emulators

  // Use Firestore Emulator
  connectFirestoreEmulator(db, 'localhost', 8080); // Default port for Firestore

  // Use Auth Emulator
  connectAuthEmulator(auth, "http://localhost:9099"); // Default port for Auth

  // Use Storage Emulator
  connectStorageEmulator(storage, 'localhost', 9199); // Default port for Storage

  // Optional: Use Functions Emulator (if needed)
  connectFunctionsEmulator(functions, 'localhost', 5001); // Default port for Functions
}


// Export all Firebase services and functions
export { 
  app, auth, db, storage,functions, updateEmail, updatePassword, fetchSignInMethodsForEmail,reauthenticateWithCredential, sendEmailVerification, EmailAuthProvider,
  listAll,  deleteObject ,analytics, Timestamp,serverTimestamp , doc, getDoc, query, where, collection, getDocs,orderBy, writeBatch ,getMetadata,addDoc, updateDoc, 
  setDoc, deleteDoc,arrayRemove, onSnapshot, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, setPersistence, 
  browserSessionPersistence, ref, getDownloadURL, uploadBytes, logEvent, httpsCallable, connectFirestoreEmulator, connectAuthEmulator, connectStorageEmulator,connectFunctionsEmulator
};