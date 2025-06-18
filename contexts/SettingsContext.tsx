// contexts/SettingsContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import i18n from "../internationalization/internationalization";
import { db } from "../firebase";

/* ---------- טיפוסים ---------- */
type Settings = { language: "he" | "en"; darkMode: boolean };
const DEFAULT: Settings = { language: "he", darkMode: false };

type Ctx = Settings & {
  toggleLanguage: () => void;
  setDarkMode: (v: boolean) => void;
  loading: boolean;
};

/* ---------- יצירת קונטקסט ---------- */
const SettingsContext = createContext<Ctx>({
  ...DEFAULT,
  toggleLanguage() {},
  setDarkMode() {},
  loading: true,
});

export const useSettings = () => useContext(SettingsContext);

/* ---------- Provider ---------- */
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);

  /* מאזין לשינויי התחברות + הגדרות משתמש ב-Firestore */
  useEffect(() => {
    const auth = getAuth();

    const unAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState(DEFAULT);
        i18n.changeLanguage(DEFAULT.language);
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", user.uid, "settings", "prefs");

      const unSub = onSnapshot(
        ref,
        async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Partial<Settings>;
            const merged = { ...DEFAULT, ...data } as Settings;
            setState(merged);
            i18n.changeLanguage(merged.language);
          } else {
            await setDoc(ref, { ...DEFAULT, createdAt: serverTimestamp() });
            setState(DEFAULT);
            i18n.changeLanguage(DEFAULT.language);
          }
          setLoading(false);
        },
        console.error
      );

      return unSub;
    });

    return unAuth;
  }, []);

  /* ---------- פעולות ---------- */
  const save = async (patch: Partial<Settings>) => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    const ref = doc(db, "users", uid, "settings", "prefs");
    await setDoc(ref, patch, { merge: true });
  };

  const toggleLanguage = () =>
    save({ language: state.language === "he" ? "en" : "he" });

  const setDarkMode = (v: boolean) => save({ darkMode: v });

  return (
    <SettingsContext.Provider
      value={{ ...state, toggleLanguage, setDarkMode, loading }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
