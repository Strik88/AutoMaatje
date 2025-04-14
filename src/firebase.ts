import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
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

// Gebruikersrollen
export const USER_ROLES = {
  ADMIN: 'admin',         // Klasouders/docenten
  DRIVER: 'driver',       // Rijdende ouders
  PARENT: 'parent',       // Niet-rijdende ouders
};

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  TRIPS: 'trips',
  CARS: 'cars',
  CHILDREN: 'children',
  ASSIGNMENTS: 'assignments',
};

// Helper functies voor gebruikersbeheer
export const createUserProfile = async (userId, userData) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: new Date().toISOString(),
    role: userData.role || USER_ROLES.PARENT, // Standaard is niet-rijdende ouder
  });
};

export const getUserProfile = async (userId) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
};

export const updateUserProfile = async (userId, userData) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, userData);
};

export default app; 