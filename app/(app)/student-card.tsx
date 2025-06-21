import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  Dimensions,
  ScrollView,
  Animated,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseAuth, db } from "../../firebase";
import { useSettings } from "../../contexts/SettingsContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const logo = require("../../assets/images/collegeLogo.png");
const AVATAR_SIZE = 160;
const NEON = "#ff1744";
const WHITE = "#ffffff";

type StudentData = {
  firstName: string;
  lastName: string;
  ID: string;
  ProfilePicture: string;
};

export default function StudentCardScreen() {
  const insets = useSafeAreaInsets();
  const { darkMode } = useSettings();
  const SURFACE_BG = darkMode ? "#121212" : WHITE;
  const TEXT_PRIMARY = darkMode ? "#E0E0E0" : "#121212";
  const TEXT_SECONDARY = darkMode ? "#C0C0C0" : "#333";
  const UPLOAD_BG = darkMode ? "#1f1f1f" : "#fff";

  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useMemo(getFirebaseAuth, []);

  // entrance animation
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  // fetch profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        try {
          const snap = await getDoc(doc(db, "users", user.email));
          if (snap.exists()) setData(snap.data() as StudentData);
        } catch {
          Alert.alert("שגיאה", "לא ניתן לטעון פרטי סטודנט");
        }
      }
      setLoading(false);
    });
    return unsub;
  }, [auth]);

  // image picker
  const pickImage = useCallback(async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert("אין הרשאה", "יש לאפשר גישה לגלריה");
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true });
    if (res.canceled || !auth.currentUser) return;
    try {
      const uri = res.assets[0].uri;
      const ext = uri.split(".").pop() || "jpg";
      const blob = await (await fetch(uri)).blob();
      const path = `profilePictures/${auth.currentUser.uid}.${ext}`;
      const ref = storageRef(getStorage(), path);
      await uploadBytes(ref, blob);
      const url = await getDownloadURL(ref);
      await updateDoc(doc(db, "users", auth.currentUser.email!), { ProfilePicture: url, lastUpdate: serverTimestamp() });
      setData((prev) => prev && { ...prev, ProfilePicture: url });
    } catch (e: any) {
      Alert.alert("שגיאה בהעלאה", e.message);
    }
  }, [auth]);

  /* ───────── loading */
  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { paddingTop: insets.top, backgroundColor: SURFACE_BG }]}>        
        <ActivityIndicator size="large" color={NEON} />
      </SafeAreaView>
    );
  }

  /* ───────── no-data */
  if (!data) {
    return (
      <SafeAreaView style={[styles.center, { paddingTop: insets.top, backgroundColor: SURFACE_BG }]}>        
        <Text style={[styles.error, { color: NEON }]}>לא נמצאו פרטי סטודנט</Text>
      </SafeAreaView>
    );
  }

  /* ───────── main UI */
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: SURFACE_BG }]} edges={["top", "bottom"]}>
      {/* Neon Wave */}
      <Svg style={styles.wave} width={SCREEN_WIDTH} height={180} viewBox={`0 0 ${SCREEN_WIDTH} 180`}>
        <Path d={`M0,0 C${SCREEN_WIDTH * 0.3},120 ${SCREEN_WIDTH * 0.7},-60 ${SCREEN_WIDTH},0 L${SCREEN_WIDTH},180 L0,180 Z`} fill={NEON} />
      </Svg>

      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 50, paddingBottom: insets.bottom + 30 }]} showsVerticalScrollIndicator={false}>
        {/* Upload */}
        <Pressable style={[styles.upload, { backgroundColor: UPLOAD_BG }]} onPress={pickImage}>
          <Ionicons name="camera" size={20} color={TEXT_PRIMARY} />
          <Text style={[styles.uploadText, { color: TEXT_PRIMARY }]}>שינוי תמונה</Text>
        </Pressable>

        {/* Card */}
        <Animated.View style={[styles.card, { backgroundColor: SURFACE_BG, borderColor: NEON, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [50,0] }) }] }]}>          
          <Text style={[styles.heading, { color: NEON }]}>כרטיס סטודנט</Text>
          <Text style={[styles.name, { color: TEXT_PRIMARY }]}>{data.firstName} {data.lastName}</Text>

          {data.ProfilePicture ? (
            <Image source={{ uri: data.ProfilePicture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}><Ionicons name="person" size={60} color="#999" /></View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="id-card" size={18} color={NEON} />
            <Text style={[styles.infoText, { color: TEXT_PRIMARY }]}>{data.ID}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color={NEON} />
            <Text style={[styles.infoText, { color: TEXT_PRIMARY }]}>{new Date().toLocaleString("he-IL")}</Text>
          </View>
        </Animated.View>

        {/* Logo */}
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { fontSize: 18, fontWeight: "600" },
  wave: { position: "absolute", top: 0, width: "100%" },
  container: { alignItems: "center", paddingHorizontal: 24 },
  upload: { position: "absolute", right: 24, top: 24, flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 20 },
  uploadText: { marginLeft: 6, fontWeight: "600" },
  card: {
    width: "100%", marginTop: 60, borderRadius: 16, borderWidth: 2, padding: 24, alignItems: "center",
    shadowColor: NEON, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  heading: { fontSize: 28, fontWeight: "800", textShadowColor: NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  name: { fontSize: 22, fontWeight: "600", marginVertical: 16 },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, borderWidth: 3, borderColor: NEON, marginBottom: 24 },
  avatarPlaceholder: { backgroundColor: "#333", justifyContent: "center", alignItems: "center" },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  infoText: { marginLeft: 8, fontSize: 16 },
  logo: { width: 150, height: 150, marginTop: 30, marginBottom: 10 },
});
