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
  getDoc,
  setDoc,
  updateDoc,
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

/* ---------- קונטקסט ---------- */
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

  useEffect(() => {
    const stop = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        setState(DEFAULT);
        i18n.changeLanguage(DEFAULT.language);
        setLoading(false);
        return;
      }

      const userDocId = user.email ?? user.uid;   // תואם למסמך-המשתמש
      const ref = doc(db, "users", userDocId);

      /* --- טעינת הגדרות --- */
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          const fromDB = (data.settings as Partial<Settings>) ?? {};
          const merged = { ...DEFAULT, ...fromDB } as Settings;
          setState(merged);
          i18n.changeLanguage(merged.language);
        } else {
          // אם משום-מה מסמך לא קיים – נוצר מינימלי
          await setDoc(ref, { settings: DEFAULT }, { merge: true });
          setState(DEFAULT);
          i18n.changeLanguage(DEFAULT.language);
        }
      } catch (e) {
        console.error("settings-load", e);
        setState(DEFAULT);
      }
      setLoading(false);
    });

    return stop;
  }, []);

  /* --- שמירה --- */
  const save = async (patch: Partial<Settings>) => {
    const u = getAuth().currentUser;
    if (!u) return;
    const userDocId = u.email ?? u.uid;
    const ref = doc(db, "users", userDocId);
    await updateDoc(ref, {
      [`settings`]: { ...state, ...patch },   // merge בתוך map-field
    });
    const newState = { ...state, ...patch } as Settings;
    setState(newState);
    if (patch.language) i18n.changeLanguage(patch.language);
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
