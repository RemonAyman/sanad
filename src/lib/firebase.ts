import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsGo0iUuWiKJjiAbzFMoD9xcTQhBUEidc",
  authDomain: "sanad-4088c.firebaseapp.com",
  projectId: "sanad-4088c",
  storageBucket: "sanad-4088c.firebasestorage.app",
  messagingSenderId: "438328893872",
  appId: "1:438328893872:web:d63e5099c7122307b0b675",
  measurementId: "G-KQWXHNXWMS"
};

// Initialize Firebase (safely check for server-side vs client-side)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
