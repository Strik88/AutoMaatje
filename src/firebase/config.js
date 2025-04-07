// Mock Firebase configuratie
// Deze configuratie vervangt tijdelijk de echte Firebase-verbinding

// Creëer dummy objecten om te exporteren
const app = {
  name: 'mock-firebase-app'
};

const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    callback(null);
    return () => {}; // return unsubscribe function
  }
};

const db = {
  collection: (name) => ({
    doc: (id) => ({
      get: async () => ({
        exists: false,
        data: () => null,
        id
      }),
      set: async () => true,
      update: async () => true,
      delete: async () => true
    }),
    add: async (data) => ({ id: 'mock-id-' + Date.now() }),
    where: () => ({
      get: async () => ({
        empty: true,
        docs: [],
        forEach: () => {}
      }),
      onSnapshot: (callback) => {
        callback({
          empty: true,
          docs: [],
          forEach: () => {}
        });
        return () => {}; // return unsubscribe function
      }
    }),
    onSnapshot: (callback) => {
      callback({
        empty: true,
        docs: [],
        forEach: () => {}
      });
      return () => {}; // return unsubscribe function
    }
  })
};

// Export de services voor gebruik in andere delen van de applicatie
export { app, auth, db };

/*
// Originele Firebase configuratie (uitgeschakeld)
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Optioneel, verwijderd of becommentarieerd indien niet nodig
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-K6NnhyAA6tORCGf4Cp9_V6Z8z6Mcj6c",
  authDomain: "automaatje-236a4.firebaseapp.com",
  projectId: "automaatje-236a4",
  storageBucket: "automaatje-236a4.appspot.com", // <-- .appspot.com is gebruikelijker dan .firebasestorage.app
  messagingSenderId: "248499386899",
  appId: "1:248499386899:web:8bbcfe8aa0f9f21dba5de6",
  measurementId: "G-T4C9XX5924"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app); // Optioneel

// Export the services for use in other parts of the application
export { app, auth, db };

// TODO: Add helper functions for authentication (login, logout, check status)
// TODO: Add helper functions for Firestore interactions (fetch data, update data) 
*/ 