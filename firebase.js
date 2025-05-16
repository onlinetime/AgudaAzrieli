// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth }                        from "firebase/auth";
import { getFirestore }                   from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYnxrYwi3EgkMx4uxkfZrOky-WVKx9fFs",
  authDomain: "agudaazrieli-45e4d.firebaseapp.com",
  projectId: "agudaazrieli-45e4d",
  storageBucket: "agudaazrieli-45e4d.appspot.com",
  messagingSenderId: "936001532201",
  appId: "1:936001532201:web:3896c063dd5c8384bd8738",
};

const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(firebaseConfig);

// משתמשים רק ב–Web SDK של Firebase (works in Expo Go on mobile)
export const auth = getAuth(app);
export const db   = getFirestore(app);
