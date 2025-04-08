// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Optioneel, verwijderd of becommentarieerd indien niet nodig

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "FIREBASE_API_KEY_PLACEHOLDER",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "automaatje-236a4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "automaatje-236a4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "automaatje-236a4.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "248499386899",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:248499386899:web:8bbcfe8aa0f9f21dba5de6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-T4C9XX5924"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app); // Optioneel

// Helper function for server timestamp
export const getServerTimestamp = () => {
  return new Date().toISOString();
};

// Export the services for use in other parts of the application
export { app, auth, db }; 