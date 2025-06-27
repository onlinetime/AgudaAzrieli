// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyDYnxrYwi3EgkMx4uxkfZrOky-WVKx9fFs",
  authDomain: "agudaazrieli-45e4d.firebaseapp.com",
  projectId: "agudaazrieli-45e4d",
  storageBucket: "agudaazrieli-45e4d.appspot.com",
  messagingSenderId: "936001532201",
  appId: "1:936001532201:web:3896c063dd5c8384bd8738",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
//const auth = getAuth(app);

/* ------------------------------------------------------------------
   getFirebaseAuth – גרסה שמבטיחה שה-Auth נרשם בדיוק פעם אחת
------------------------------------------------------------------ */
let cachedAuth; // ← נשמר בזיכרון

export const getFirebaseAuth = () => {
  if (cachedAuth) return cachedAuth;

  if (Platform.OS === "web") {
    // דפדפן – getAuth מספיק
    cachedAuth = getAuth(app);
    return cachedAuth;
  }

  // React-Native / Expo – ננסה קודם initializeAuth (רושם את ה-component)
  try {
    cachedAuth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // אם כבר מאותחל, ניפול לפה
    cachedAuth = getAuth(app);
  }

  return cachedAuth;
};
const auth = getFirebaseAuth();
export { db, auth, app };