import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ שים לב: אין react-native פה
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYnxrYwi3EgkMx4uxkfZrOky-WVKx9fFs",
  authDomain: "agudaazrieli-45e4d.firebaseapp.com",
  projectId: "agudaazrieli-45e4d",
  storageBucket: "agudaazrieli-45e4d.appspot.com",
  messagingSenderId: "936001532201",
  appId: "1:936001532201:web:3896c063dd5c8384bd8738",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
