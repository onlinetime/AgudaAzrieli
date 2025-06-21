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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { getFirebaseAuth, db } from "../../firebase";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const logo = require("../../assets/images/collegeLogo.png");
const AVATAR_SIZE = 160;
const NEON = "#ff1744";
const WHITE = "#ffffff";  // updated to true white
const DARK = "#121212";

type StudentData = {
  firstName: string;
  lastName: string;
  ID: string;
  ProfilePicture: string;
};

export default function StudentCardScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useMemo(getFirebaseAuth, []);

  // entrance animation for card
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // fetch profile from Firestore
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        try {
          const snap = await getDoc(doc(db, "users", user.email));
          if (snap.exists()) {
            setData(snap.data() as StudentData);
          }
        } catch (e) {
          Alert.alert("שגיאה", "לא ניתן לטעון פרטי סטודנט");
        }
      }
      setLoading(false);
    });
    return unsub;
  }, [auth]);

  // image picker + upload
  const pickImage = useCallback(async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      return Alert.alert("אין הרשאה", "יש לאפשר גישה לגלריה");
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (res.canceled || !auth.currentUser) return;
    try {
      const uri = res.assets[0].uri;
      const ext = uri.split(".").pop() || "jpg";
      const blob = await (await fetch(uri)).blob();
      const path = `profilePictures/${auth.currentUser.uid}.${ext}`;
      const ref = storageRef(getStorage(), path);
      await uploadBytes(ref, blob);
      const url = await getDownloadURL(ref);
      await updateDoc(doc(db, "users", auth.currentUser.email!), {
        ProfilePicture: url,
        lastUpdate: serverTimestamp(),
      });
      setData((prev) => prev && { ...prev, ProfilePicture: url });
    } catch (e: any) {
      Alert.alert("שגיאה בהעלאה", e.message);
    }
  }, [auth]);

  // === loading state ===
  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.center,
          { paddingTop: insets.top, backgroundColor: WHITE },
        ]}
      >
        <ActivityIndicator size="large" color={NEON} />
      </SafeAreaView>
    );
  }

  // === no-data state ===
  if (!data) {
    return (
      <SafeAreaView
        style={[
          styles.center,
          { paddingTop: insets.top, backgroundColor: WHITE },
        ]}
      >
        <Text style={[styles.error, { color: NEON }]}>
          לא נמצאו פרטי סטודנט
        </Text>
      </SafeAreaView>
    );
  }

  // === main UI ===
  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: WHITE }]}
      edges={["top", "bottom"]}
    >
      {/* Neon Wave Background */}
      <Svg
        style={styles.wave}
        width={SCREEN_WIDTH}
        height={180}
        viewBox={`0 0 ${SCREEN_WIDTH} 180`}
      >
        <Path
          d={`
            M0,0
            C${SCREEN_WIDTH * 0.3},120 ${SCREEN_WIDTH * 0.7},-60 ${SCREEN_WIDTH},0
            L${SCREEN_WIDTH},180 L0,180 Z
          `}
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
        {/* Upload Button */}
        <Pressable style={styles.upload} onPress={pickImage}>
          <Ionicons name="camera" size={20} color={DARK} />
          <Text style={styles.uploadText}>שינוי תמונה</Text>
        </Pressable>

        {/* Animated Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.heading}>כרטיס סטודנט</Text>
          <Text style={styles.name}>
            {data.firstName} {data.lastName}
          </Text>

          {data.ProfilePicture ? (
            <Image
              source={{ uri: data.ProfilePicture }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={60} color="#999" />
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="id-card" size={18} color={NEON} />
            <Text style={[styles.infoText, { color: DARK }]}>{data.ID}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color={NEON} />
            <Text style={[styles.infoText, { color: DARK }]}>
              {new Date().toLocaleString("he-IL")}
            </Text>
          </View>
        </Animated.View>

        {/* College Logo */}
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { fontSize: 18, fontWeight: "600" },

  wave: { position: "absolute", top: 0, width: "100%" },

  container: {
    alignItems: "center",
    paddingHorizontal: 24,
  },

  upload: {
    position: "absolute",
    right: 24,
    top: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
  },
  uploadText: {
    marginLeft: 6,
    color: DARK,
    fontWeight: "600",
  },

  card: {
    width: "100%",
    marginTop: 60,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: NEON,
    padding: 24,
    alignItems: "center",
    shadowColor: NEON,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  heading: {
    color: NEON,
    fontSize: 28,
    fontWeight: "800",
    textShadowColor: NEON,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  name: {
    color: DARK,
    fontSize: 22,
    fontWeight: "600",
    marginVertical: 16,
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: NEON,
    marginBottom: 24,
  },
  avatarPlaceholder: {
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    // uses DARK above for contrast
  },

  logo: {
    width: 150,
    height: 150,
    marginTop: 30,
    marginBottom: 10,
  },
});
