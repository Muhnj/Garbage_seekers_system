// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDfyaRaDJ-xGWisMW-Cuh8TLUGXtcgINIo",
  authDomain: "securityplus-2a8e7.firebaseapp.com",
  projectId: "securityplus-2a8e7",
  storageBucket: "securityplus-2a8e7.firebasestorage.app",
  messagingSenderId: "714532817755",
  appId: "1:714532817755:web:4a015f1bab8b4a0b11687e",
  measurementId: "G-DQPLWFTBQF"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);

// Ensure persistent session (this runs once)
setPersistence(auth, browserLocalPersistence);

export { db, auth };
