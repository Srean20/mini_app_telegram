import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDYToIB7z9sX0jMhucKEpY8UDCDmsXYPhU",
  authDomain: "mini-bb921.firebaseapp.com",
  projectId: "mini-bb921",
  storageBucket: "mini-bb921.firebasestorage.app",
  messagingSenderId: "169975275917",
  appId: "1:169975275917:web:ea9a592c9b7d3df3fa1dc4",
  measurementId: "G-8W2RY9XMQV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, "admin56");
export const storage = getStorage(app);
export default app;
