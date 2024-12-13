// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence, fetchSignInMethodsForEmail, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, Timestamp, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc,arrayRemove,onSnapshot, orderBy,writeBatch, serverTimestamp  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getStorage, ref, getDownloadURL, uploadBytes, deleteObject, getMetadata, listAll } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";

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

// Export all Firebase services and functions
export { app, auth, db, storage, fetchSignInMethodsForEmail, createUserWithEmailAndPassword, listAll,  deleteObject ,analytics, Timestamp,serverTimestamp , doc, getDoc, query, where, collection, getDocs,orderBy, writeBatch ,getMetadata,addDoc, updateDoc, setDoc, deleteDoc,arrayRemove, onSnapshot, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence, ref, getDownloadURL, uploadBytes, logEvent };
