// firebase.js
import { Platform } from "react-native";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDYnxrYwi3EgkMx4uxkfZrOky-WVKx9fFs",
  authDomain: "agudaazrieli-45e4d.firebaseapp.com",
  projectId: "agudaazrieli-45e4d",
  storageBucket: "agudaazrieli-45e4d.appspot.com",
  messagingSenderId: "936001532201",
  appId: "1:936001532201:web:3896c063dd5c8384bd8738",
};

/* ----------- App singleton ----------- */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/* ----------- Auth with persistence ----------- */
// **הגדרה של auth באופן חיצוני**:
let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    //initializeAuth מחזיר מופע auth עם AsyncStorage
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // אם כבר מאותחל (hot reload)
    auth = getAuth(app);
    // לוודא שה־auth הקיים יקבל persistence
    setPersistence(auth, getReactNativePersistence(AsyncStorage));
  }
}

/* ----------- Firestore ----------- */
const db = getFirestore(app);

/* ----------- Export ----------- */
export { app, auth, db };
