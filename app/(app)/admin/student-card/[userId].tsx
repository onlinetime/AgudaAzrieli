// app/(app)/student-card/[userId].tsx

import React, { useCallback, useEffect, useRef, useState } from "react";
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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../../../firebase";
import { useSettings } from "../../../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AVATAR_SIZE = 160;
const NEON = "#ff1744";

type StudentData = {
  firstName: string;
  lastName: string;
  id: string;
  ProfilePicture?: string;
};

export default function StudentCardScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { darkMode } = useSettings();

  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    async function loadStudent() {
      try {
        const snap = await getDoc(doc(db, "users", userId));
        if (snap.exists()) {
          setData(snap.data() as StudentData);
        } else {
          Alert.alert(t("studentNotFound"), t("noSuchStudent"));
        }
      } catch {
        Alert.alert(t("error"), t("couldNotLoadStudent"));
      }
      setLoading(false);
    }
    loadStudent();
  }, [userId, t]);

  const pickImage = useCallback(async () => {
    if (!data) return;
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert(t("noPermission"), t("needGalleryAccess"));

    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true });
    if (res.canceled) return;

    try {
      const uri = res.assets[0].uri;
      const ext = uri.split(".").pop() || "jpg";
      const blob = await (await fetch(uri)).blob();
      const path = `profilePictures/${userId}.${ext}`;
      const ref = storageRef(getStorage(), path);
      await uploadBytes(ref, blob);
      const url = await getDownloadURL(ref);

      await updateDoc(doc(db, "users", userId), {
        ProfilePicture: url,
        lastUpdate: serverTimestamp(),
      });
      setData(prev => prev && { ...prev, ProfilePicture: url });
    } catch (e: any) {
      Alert.alert(t("uploadError"), e.message);
    }
  }, [userId, data, t]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.center, { paddingTop: insets.top, backgroundColor: darkMode ? "#121212" : "#fff" }]}
      >
        <ActivityIndicator size="large" color={NEON} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView
        style={[styles.center, { paddingTop: insets.top, backgroundColor: darkMode ? "#121212" : "#fff" }]}
      >
        <Text style={[styles.error, { color: NEON }]}>{t("studentNotFound")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: darkMode ? "#121212" : "#fff" }]}
      edges={["top", "bottom"]}
    >
      <Svg style={styles.wave} width={SCREEN_WIDTH} height={180} viewBox={`0 0 ${SCREEN_WIDTH} 180`}>
        <Path
          d={`M0,0 C${SCREEN_WIDTH * 0.3},120 ${SCREEN_WIDTH * 0.7},-60 ${SCREEN_WIDTH},0 L${SCREEN_WIDTH},180 L0,180 Z`}
          fill={NEON}
        />
      </Svg>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 50, paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={[styles.upload, { backgroundColor: darkMode ? "#1f1f1f" : "#fff" }]} onPress={pickImage}>
          <Ionicons name="camera" size={20} color={darkMode ? "#E0E0E0" : "#121212"} />
          <Text style={[styles.uploadText, { color: darkMode ? "#E0E0E0" : "#121212" }]}>
            {t("changePhoto")}
          </Text>
        </Pressable>

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: darkMode ? "#121212" : "#fff",
              borderColor: NEON,
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.heading, { color: NEON }]}>{t("studentCardHeading")}</Text>
          <Text style={[styles.name, { color: darkMode ? "#E0E0E0" : "#121212" }]}>
            {data.firstName} {data.lastName}
          </Text>

          {data.ProfilePicture ? (
            <Image source={{ uri: data.ProfilePicture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={60} color="#999" />
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="id-card" size={18} color={NEON} />
            <Text style={[styles.infoText, { color: darkMode ? "#E0E0E0" : "#121212" }]}>
              {data.id}
            </Text>
          </View>


          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color={NEON} />
            <Text style={[styles.infoText, { color: darkMode ? "#E0E0E0" : "#121212" }]}>
              {new Date().toLocaleString(i18n.language)}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { fontSize: 18, fontWeight: "600" },
  wave: { position: "absolute", top: 0, width: "100%" },
  container: { alignItems: "center", paddingHorizontal: 24 },
  upload: {
    position: "absolute",
    right: 24,
    top: 24,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 20,
  },
  uploadText: { marginLeft: 6, fontWeight: "600" },
  card: {
    width: "100%",
    marginTop: 60,
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: "center",
    shadowColor: NEON,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    textShadowColor: NEON,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  name: { fontSize: 22, fontWeight: "600", marginVertical: 16 },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: NEON,
    marginBottom: 24,
  },
  avatarPlaceholder: { backgroundColor: "#333", justifyContent: "center", alignItems: "center" },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  infoText: { marginLeft: 8, fontSize: 16 },
});  
