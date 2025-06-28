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

/* ------------------------------------------------------------------
   טיפוסים והגדרות ברירת-מחדל
   ------------------------------------------------------------------ */
type Settings = {
  language: "he" | "en";
  darkMode: boolean;
};

const DEFAULT_SETTINGS: Settings = { language: "he", darkMode: false };

/** ✨ טיפוס הקונטקסט – הוספנו isAdmin */
type Ctx = Settings & {
  toggleLanguage: () => void;
  setDarkMode: (v: boolean) => void;
  /**  האם המשתמש מוגדר כאדמין ב-Firestore */
  isAdmin: boolean;
  /**  האם הטעינה הראשונית עדיין רצה */
  loading: boolean;
};

/* ------------------------------------------------------------------
   יצירת הקונטקסט עם ערכים ראשוניים ריקים
   ------------------------------------------------------------------ */
const SettingsContext = createContext<Ctx>({
  ...DEFAULT_SETTINGS,
  toggleLanguage() {},
  setDarkMode() {},
  isAdmin: false,
  loading: true,
});

/* הוק נוח */
export const useSettings = () => useContext(SettingsContext);

/* ------------------------------------------------------------------
   SettingsProvider – עוטף את האפליקציה כולה
   ------------------------------------------------------------------ */
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  /*  state להגדרות משתמש */
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  /*  state לדגל אדמין  */
  const [isAdmin, setIsAdmin]   = useState(false);
  /*  state ל־spinner ראשוני  */
  const [loading, setLoading]   = useState(true);

  /* --------------------------------------------------------------
     מאזין ל־Auth + קריאת המסמך מה־Firestore
     -------------------------------------------------------------- */
  useEffect(() => {
    const stop = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        setSettings(DEFAULT_SETTINGS);
        setIsAdmin(false);
        i18n.changeLanguage(DEFAULT_SETTINGS.language);
        setLoading(false);
        return;
      }

      const uid = user.uid;                      // תמיד UID
      const ref = doc(db, "users", uid);

      try {
        const snap = await getDoc(ref);

        /* --- הגדרות --- */
        const fromDB =
          (snap.exists() && (snap.data() as any).settings) ?? {};
        const merged = { ...DEFAULT_SETTINGS, ...fromDB } as Settings;

        setSettings(merged);
        i18n.changeLanguage(merged.language);

        /* --- ‎isAdmin‎ --- */
        const adminFlag =
          snap.exists() && Boolean((snap.data() as any).isAdmin);
        setIsAdmin(adminFlag);
      } catch (e) {
        console.error("settings-load", e);
        setSettings(DEFAULT_SETTINGS);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return stop; // clean-up
  }, []);

  /* --------------------------------------------------------------
     שמירת patch להגדרות
     -------------------------------------------------------------- */
  const save = async (patch: Partial<Settings>) => {
    const user = getAuth().currentUser;
    if (!user) return;

    const uid = user.uid;
    const ref = doc(db, "users", uid);

    const newState = { ...settings, ...patch } as Settings;

    /* עידכון-מצב מקומי לפני קריאת-הרשת */
    setSettings(newState);
    if (patch.language) i18n.changeLanguage(patch.language);

    await updateDoc(ref, { settings: newState });
  };

  /* פעולות נוחות */
  const toggleLanguage = () =>
    save({ language: settings.language === "he" ? "en" : "he" });
  const setDarkMode = (v: boolean) => save({ darkMode: v });

  /* --------------------------------------------------------------
     ספק הערכים לילדים
     -------------------------------------------------------------- */
  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        toggleLanguage,
        setDarkMode,
        isAdmin,   // ✨ זמין לכל האפליקציה
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
