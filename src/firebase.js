import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC3_FdwTgwjMNjuelUekf77dcnL_sTMirQ",
  authDomain: "mini-telegram-app.firebaseapp.com",
  projectId: "mini-telegram-app",
  storageBucket: "mini-telegram-app.firebasestorage.app",
  messagingSenderId: "47595332691",
  appId: "1:47595332691:web:0d19c774d41b28cb0a52a6",
  measurementId: "G-436T6W5FYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
