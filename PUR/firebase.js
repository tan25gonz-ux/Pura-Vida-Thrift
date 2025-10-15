import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2zZyGVjvuy0MVwW9YmCR2cIsat-FBbV0",
  authDomain: "puravidathrift.firebaseapp.com",
  projectId: "puravidathrift",
  storageBucket: "puravidathrift.firebasestorage.app",
  messagingSenderId: "242318763823",
  appId: "1:242318763823:web:a01bde9f4baa0aad1563da",
  measurementId: "G-MTCVZ42BYG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
