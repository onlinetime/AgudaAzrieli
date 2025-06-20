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
type Settings = {
  language: "he" | "en";
  darkMode: boolean;
};
const DEFAULT_SETTINGS: Settings = {
  language: "he",
  darkMode: false,
};

export type WaveColors = {
  topColor: string;
  middleColor: string;
  bottomColor: string;
};
const DEFAULT_WAVE_COLORS: WaveColors = {
  topColor: "#ff8a80",
  middleColor: "#ff5252",
  bottomColor: "#f44336",
};

/* ---------- סוג הקונטקסט וסכימת הערכים ---------- */
type Ctx = Settings & {
  toggleLanguage: () => void;
  setDarkMode: (v: boolean) => void;
  loading: boolean;
  // הוספנו:
  waveColors: WaveColors;
  updateWaveColors: (c: WaveColors) => Promise<void>;
};

const SettingsContext = createContext<Ctx>({
  ...DEFAULT_SETTINGS,
  toggleLanguage: () => {},
  setDarkMode: () => {},
  loading: true,
  waveColors: DEFAULT_WAVE_COLORS,
  updateWaveColors: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

/* ---------- ה־Provider ---------- */
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // סטייט של שפה ומצב חשוך
  const [state, setState] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // סטייט של צבעי הגלים
  const [waveColors, setWaveColors] =
    useState<WaveColors>(DEFAULT_WAVE_COLORS);

  /* מאזין לשינויי auth + הגדרות משתמש ב־Firestore */
  useEffect(() => {
    const auth = getAuth();
    const unAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // משתמש לא מחובר
        setState(DEFAULT_SETTINGS);
        i18n.changeLanguage(DEFAULT_SETTINGS.language);
        setLoading(false);
        return;
      }

      // מאזינים למסמך settings של המשתמש
      const ref = doc(db, "users", user.uid, "settings", "prefs");
      const unSub = onSnapshot(
        ref,
        async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Partial<Settings>;
            const merged: Settings = {
              ...DEFAULT_SETTINGS,
              ...data,
            };
            setState(merged);
            i18n.changeLanguage(merged.language);
          } else {
            // יצירת ברירת מחדל במסוף
            await setDoc(ref, { ...DEFAULT_SETTINGS, createdAt: serverTimestamp() });
            setState(DEFAULT_SETTINGS);
            i18n.changeLanguage(DEFAULT_SETTINGS.language);
          }
          setLoading(false);
        },
        console.error
      );
      return unSub;
    });
    return unAuth;
  }, []);

  /* מאזין לצבעי גל גלובליים במסמך settings/ui בפיירסטור */
  useEffect(() => {
    const refUI = doc(db, "settings", "ui");
    const unSubUI = onSnapshot(
      refUI,
      (snap) => {
        const data = snap.data();
        if (data?.waveColors) {
          setWaveColors(data.waveColors as WaveColors);
        }
      },
      console.error
    );
    return unSubUI;
  }, []);

  /* פונקציות לעדכון ב־Firestore */
  const toggleLanguage = () => {
    const newLang = state.language === "he" ? "en" : "he";
    // רק שמירת Prefs המשתמשית
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    const ref = doc(db, "users", uid, "settings", "prefs");
    setDoc(ref, { language: newLang }, { merge: true });
  };

  const setDarkMode = (v: boolean) => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    const ref = doc(db, "users", uid, "settings", "prefs");
    setDoc(ref, { darkMode: v }, { merge: true });
  };

  const updateWaveColors = async (c: WaveColors) => {
    setWaveColors(c);
    const refUI = doc(db, "settings", "ui");
    await setDoc(refUI, { waveColors: c }, { merge: true });
  };

  return (
    <SettingsContext.Provider
      value={{
        ...state,
        toggleLanguage,
        setDarkMode,
        loading,
        waveColors,
        updateWaveColors,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
