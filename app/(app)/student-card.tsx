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
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion, addDoc, collection } from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { getFirebaseAuth, db } from "../../firebase";
import { useSettings } from "../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const logo = require("../../assets/images/collegeLogo.png");

const AVATAR_SIZE = 160;
const NEON = "#ff1744";
const WHITE = "#ffffff";

type StudentData = {
  firstName: string;
  lastName: string;
  id: string;
  ProfilePicture: string;
};

export default function StudentCardScreen() {
  /* hooks -–––––––––––––––––––––––––––––– */
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { darkMode } = useSettings();

  /* צבעים בהתאם למצב-לילה */
  const SURFACE_BG = darkMode ? "#121212" : WHITE;
  const TEXT_PRIMARY = darkMode ? "#E0E0E0" : "#121212";
  const TEXT_SECOND = darkMode ? "#C0C0C0" : "#333";
  const UPLOAD_BG = darkMode ? "#1f1f1f" : "#fff";

  /* state */
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]); // Add this state
  const [saving, setSaving] = useState(false); // Add saving state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const auth = useMemo(getFirebaseAuth, []);

  /* אנימציית כניסה */
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  /* שליפת נתוני סטודנט */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid)); // <-- use uid
          if (snap.exists()) setData(snap.data() as StudentData);
        } catch {
          Alert.alert(t("error"), t("couldNotLoadStudent"));
        }
      }
      setLoading(false);
    });
    return unsub;
  }, [auth, t]);

  /* בחירת תמונה חדשה */
  const pickImage = useCallback(async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert(t("noPermission"), t("needGalleryAccess"));

    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (res.canceled || !auth.currentUser) return;

    try {
      const uri = res.assets[0].uri;
      const ext = uri.split(".").pop() || "jpg";
      const blob = await (await fetch(uri)).blob();
      const path = `profilePictures/${auth.currentUser.uid}.${ext}`; // <-- use uid

      const ref = storageRef(getStorage(), path);
      await uploadBytes(ref, blob);
      const url = await getDownloadURL(ref);

      await updateDoc(
        doc(db, "users", auth.currentUser.uid), // <-- use uid
        { ProfilePicture: url, lastUpdate: serverTimestamp() }
      );
      setData((prev) => prev && { ...prev, ProfilePicture: url });
    } catch (e: any) {
      Alert.alert(t("uploadError"), e.message);
    }
  }, [auth, t]);

  // Multi-image picker
  const pickImages = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("שגיאה", "אין הרשאה לגישה לתמונות");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...uris]);
    }
  }, []);

  // Remove selected image by index
  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadImagesAndGetUrls = async (uris: string[]) => {
    const storage = getStorage();
    const user = auth.currentUser!;
    const uploadPromises = uris.map(async (uri, idx) => {
      const response = await fetch(uri);
      const blob = await response.blob();
      const timestamp = Date.now();
      const imageRef = storageRef(
        storage,
        `gallery/${user.uid}/${timestamp}_${idx}`
      );
      await uploadBytes(imageRef, blob);
      const downloadUrl = await getDownloadURL(imageRef);
      return downloadUrl;
    });
    return Promise.all(uploadPromises);
  };

  // Submit new gallery images for the current user
  const handleSubmit = async () => {
    // Require at least one of title, content, or images
    if (!title.trim() && !content.trim() && images.length === 0) {
      Alert.alert("שגיאה", "יש למלא לפחות אחד מהשדות: כותרת, תוכן או תמונה");
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('משתמש לא מזוהה');

      // Upload images if any
      const imageUrls = images.length
        ? await uploadImagesAndGetUrls(images)
        : [];

      // Add new post to Firestore (posts collection)
      await addDoc(collection(db, "posts"), {
        title: title.trim(),
        content: content.trim(),
        images: imageUrls,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      Alert.alert("הצלחה", "הפוסט נוצר בהצלחה", [
        { text: "אישור", onPress: () => {
          setTitle('');
          setContent('');
          setImages([]);
        } },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', 'אירעה שגיאה בהעלאת התמונות');
    } finally {
      setSaving(false);
    }
  };

  /* ––––––––––––––––– UI ––––––––––––––––– */

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { paddingTop: insets.top, backgroundColor: SURFACE_BG }]}>
        <ActivityIndicator size="large" color={NEON} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={[styles.center, { paddingTop: insets.top, backgroundColor: SURFACE_BG }]}>
        <Text style={[styles.error, { color: NEON }]}>{t("studentNotFound")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: SURFACE_BG }]} edges={["top", "bottom"]}>
      {/* גל ניאון עליון */}
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
        {/* Multi-image upload button */}
        <Pressable style={[styles.upload, { backgroundColor: UPLOAD_BG }]} onPress={pickImages}>
          <Ionicons name="images" size={20} color={TEXT_PRIMARY} />
          <Text style={[styles.uploadText, { color: TEXT_PRIMARY }]}>
            {t("uploadPhotos", "העלה תמונות")}
          </Text>
        </Pressable>

        {/* Show selected images with remove option */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}>
          {images.map((uri, idx) => (
            <View key={uri} style={{ margin: 4, position: "relative" }}>
              <Image source={{ uri }} style={{ width: 70, height: 70, borderRadius: 8 }} />
              <TouchableOpacity
                onPress={() => removeImage(idx)}
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  backgroundColor: "#ff1744",
                  borderRadius: 12,
                  padding: 2,
                }}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit Button for uploading images */}
        {images.length > 0 && (
          <View style={{ width: "100%", alignItems: "center", marginBottom: 10 }}>
            <Pressable
              style={{
                backgroundColor: NEON,
                paddingHorizontal: 24,
                paddingVertical: 10,
                borderRadius: 20,
                opacity: saving ? 0.5 : 1,
              }}
              onPress={handleSubmit}
              disabled={saving}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {saving ? t("uploading", "מעלה...") : t("uploadToGallery", "העלה לגלריה")}
              </Text>
            </Pressable>
          </View>
        )}

        {/* כרטיס הסטודנט */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: SURFACE_BG,
              borderColor: NEON,
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
          <Text style={[styles.heading, { color: NEON }]}>
            {t("studentCardHeading")}
          </Text>

          <Text style={[styles.name, { color: TEXT_PRIMARY }]}>
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
            <Text style={[styles.infoText, { color: TEXT_PRIMARY }]}>{data.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color={NEON} />
            <Text style={[styles.infoText, { color: TEXT_PRIMARY }]}>
              {new Date().toLocaleString("he-IL")}
            </Text>
          </View>
        </Animated.View>

        {/* Upload to gallery button */}
        <View style={{ width: "100%", alignItems: "center", marginVertical: 10 }}>
          <Pressable
            style={{
              backgroundColor: NEON,
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 20,
              opacity: images.length ? 1 : 0.5,
            }}
            onPress={handleSubmit} // Use handleSubmit here
            disabled={!images.length}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {t("uploadToGallery", "העלה לגלריה")}
            </Text>
          </Pressable>
        </View>

        {/* לוגו מוסד */}
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ––– Styles ––– */
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
  logo: { width: 150, height: 150, marginTop: 30, marginBottom: 10 },
});
