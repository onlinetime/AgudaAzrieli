// firebase.js
<<<<<<< HEAD
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
=======
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
>>>>>>> 3126498e541a08da60489832cbc3f20c82a22fb2

const firebaseConfig = {
  apiKey: "AIzaSyDYnxrYwi3EgkMx4uxkfZrOky-WVKx9fFs",
  authDomain: "agudaazrieli-45e4d.firebaseapp.com",
  projectId: "agudaazrieli-45e4d",
  storageBucket: "agudaazrieli-45e4d.appspot.com",
  messagingSenderId: "936001532201",
  appId: "1:936001532201:web:3896c063dd5c8384bd8738",
};

<<<<<<< HEAD
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
export { db, auth };
=======
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
>>>>>>> 3126498e541a08da60489832cbc3f20c82a22fb2
