/* app/(app)/student-card.tsx */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

import { getFirebaseAuth, db } from "../../firebase";      // ← התאמת-נתיב
const logo = require("../../assets/images/collegeLogo.png");

type StudentData = {
  firstName: string;
  lastName:  string;
  ID:        string;
  ProfilePicture: string;
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function StudentCardScreen() {
  const [data,    setData]    = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [now,     setNow]     = useState(new Date());

  const auth = useMemo(getFirebaseAuth, []);

  /* שעון */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* משיכת נתונים */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        const snap = await getDoc(doc(db, "users", user.email));
        if (snap.exists()) setData(snap.data() as StudentData);
      }
      setLoading(false);
    });
    return unsub;
  }, [auth]);

  /* העלאת-תמונה */
  const handlePickImage = useCallback(async () => {
    try {
      /* הרשאות גלריה (נדרש במובייל) */
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("אין הרשאה", "צריך לאשר גישה לגלריה כדי להעלות תמונה");
        return;
      }

      /* פתיחת-Picker */
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:    ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality:       0.85,
      });
      if (res.canceled) return;

      if (!auth.currentUser) {
        Alert.alert("שגיאה", "לא אותר משתמש מחובר");
        return;
      }

      const uri = res.assets[0].uri;
      const ext = uri.split(".").pop() ?? "jpg";

      /* fetch → blob */
      const blob: Blob = await (await fetch(uri)).blob();

      /* Storage */
      const storage = getStorage();
      const path    = `profilePictures/${auth.currentUser.uid}.${ext}`;
      const ref     = storageRef(storage, path);
      await uploadBytes(ref, blob);

      const url = await getDownloadURL(ref);

      /* Firestore */
      await updateDoc(doc(db, "users", auth.currentUser.email!), {
        ProfilePicture: url,
        lastUpdate:     serverTimestamp(),
      });

      setData((prev) => prev && { ...prev, ProfilePicture: url });
    } catch (err: any) {
      console.error(err);
      Alert.alert("שגיאת העלאה", err?.message ?? "אירעה שגיאה לא ידועה");
    }
  }, [auth]);

  /* ---------- UI מצבי ביניים ---------- */
  if (loading)
    return <Center><ActivityIndicator size="large" /></Center>;

  if (!data)
    return <Center><Text>לא נמצאו פרטי סטודנט 🤷‍♂️</Text></Center>;

  /* ---------- UI ראשי ---------- */
  return (
    <LinearGradient colors={["#fafbff", "#f5f7fa"]} style={styles.container}>
      {/* כפתור-העלאה */}
      <Pressable style={styles.uploadBtn} onPress={handlePickImage}>
        <Text style={styles.uploadTxt}>העלה תמונה</Text>
      </Pressable>

      {/* לוגו */}
      <Image source={logo} style={styles.logo} resizeMode="contain" />

      {/* כותרת + שם */}
      <Text style={styles.title}>כרטיס סטודנט</Text>
      <Text style={styles.name}>
        {data.firstName} {data.lastName}
      </Text>

      {/* תמונת-פרופיל */}
      {data.ProfilePicture ? (
        <Image source={{ uri: data.ProfilePicture }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholder]}>
          <Text style={{ color: "#999" }}>אין תמונה</Text>
        </View>
      )}

      {/* ת״ז + שעון */}
      <Text style={styles.idLabel}>תעודת זהות:</Text>
      <Text style={styles.idNumber}>{data.ID}</Text>
      <Text style={styles.time}>
        {now.toLocaleDateString("he-IL")} {now.toLocaleTimeString("he-IL")}
      </Text>
    </LinearGradient>
  );
}

/* ---------- קומפוננטת Center ---------- */
const Center = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.center}>{children}</View>
);

/* ---------- StyleSheet ---------- */
const AVATAR_SIZE = 200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ?? 0) + 20
        : 50,
    backgroundColor: "#fafbff",
    minHeight: SCREEN_HEIGHT,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  uploadBtn: {
    position: "absolute",
    top: 15,
    right: 20,
    backgroundColor: "#4f6cf7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 2,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3 },
      android: { elevation: 4 },
    }),
  },
  uploadTxt: { color: "#fff", fontWeight: "600" },

  logo:  { width: 160, height: 60, marginBottom: 10 },

  title: { fontSize: 30, fontWeight: "700", color: "#333", marginBottom: 20 },
  name:  { fontSize: 24, fontWeight: "600", marginBottom: 16 },

  avatar: {
    width:  AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#4f6cf7",
    marginBottom: 18,
    overflow: "hidden",
    backgroundColor: "#eef1ff",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: { backgroundColor: "#eef1ff" },

  idLabel:  { fontSize: 18, marginBottom: 2, color: "#555" },
  idNumber: { fontSize: 22, fontWeight: "500", letterSpacing: 1 },
  time:     { marginTop: 26, fontSize: 16, color: "#666" },
});