import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuratie
const firebaseConfig = {
  apiKey: "AIzaSyB-K6NnhyAA6tORCGf4Cp9_V6Z8z6Mcj6c",
  authDomain: "automaatje-236a4.firebaseapp.com",
  projectId: "automaatje-236a4",
  storageBucket: "automaatje-236a4.firebasestorage.app",
  messagingSenderId: "248499386899",
  appId: "1:248499386899:web:8bbcfe8aa0f9f21dba5de6",
  measurementId: "G-T4C9XX5924"
};

// Firebase initialiseren
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 