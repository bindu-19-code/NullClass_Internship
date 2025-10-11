// src/firebase/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwnY-etlFHvSmuYtgCZrUQY2Bb2ZyRva4",
  authDomain: "internshala-clone-430ef.firebaseapp.com",
  projectId: "internshala-clone-430ef",
  storageBucket: "internshala-clone-430ef.appspot.com",
  messagingSenderId: "1035513631002",
  appId: "1:1035513631002:web:0d6d74216faf3fd8891ca3",
  measurementId: "G-V0MM0V7M2M",
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
