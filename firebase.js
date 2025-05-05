import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDYnxrYwi3EgkMx4uxkfZrOky-WVKx9fFs",
  authDomain: "agudaazrieli-45e4d.firebaseapp.com",
  projectId: "agudaazrieli-45e4d",
  storageBucket: "agudaazrieli-45e4d.firebasestorage.app",
  messagingSenderId: "936001532201",
  appId: "1:936001532201:web:3896c063dd5c8384bd8738",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
