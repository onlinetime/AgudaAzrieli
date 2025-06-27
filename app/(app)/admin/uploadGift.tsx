/* ---------------------------------------------------------------- */
/* UploadGiftScreen – after additions                               */
/* ---------------------------------------------------------------- */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../contexts/SettingsContext";

const ACCENT = "#ff1744";
import type { ColorValue } from "react-native";
const HEADER_GRAD: [ColorValue, ColorValue] = [ACCENT, "#d32f2f"];

export default function UploadGiftScreen() {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("he");
  const { darkMode } = useSettings();

  const SURFACE_BG   = darkMode ? "#121212" : "#fff";
  const TEXT_PRIMARY = darkMode ? "#E0E0E0" : "#121212";

  const [giftName,     setGiftName]     = useState("");
  const [description,  setDescription]  = useState("");
  const [imageUri,     setImageUri]     = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [gifts,        setGifts]        = useState<any[]>([]);

  const btnScale  = useRef(new Animated.Value(1)).current;
  const animateButton = (toValue: number) => {
    Animated.spring(btnScale, { toValue, friction: 3, useNativeDriver: true }).start();
  };

  /* ----------------------------------------------------------------
     fetch gifts once on mount
  ---------------------------------------------------------------- */
  useEffect(() => { fetchGifts(); }, []);
  const fetchGifts = async () => {
    const snap = await getDocs(collection(db, "gifts"));
    setGifts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  /* ----------------------------------------------------------------
     pick image  
  ---------------------------------------------------------------- */
  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert(
      isRTL ? "שגיאה" : "Error",
      isRTL ? "יש לאשר גישה למדיה" : "Media permission required"
    );
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality:    1,
    });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  /* ----------------------------------------------------------------
     submit gift           
  ---------------------------------------------------------------- */
  const handleSubmit = useCallback(async () => {
    if (!giftName.trim()) return Alert.alert(
      isRTL ? "שגיאה" : "Error",
      isRTL ? "הכנס את שם המתנה" : "Enter gift name"
    );
    setUploading(true);
    try {
      await addDoc(collection(db, "gifts"), {
        name:       giftName,
        description,
        picture:    imageUri || "",
        createdAt:  serverTimestamp(),
      });
      setGiftName(""); setDescription(""); setImageUri(null);
      fetchGifts();
      Alert.alert(
        isRTL ? "בוצע" : "Success",
        isRTL ? "המתנה נוספה בהצלחה" : "Gift added"
      );
    } catch (e) {
      console.error(e);
      Alert.alert(
        isRTL ? "שגיאה" : "Error",
        isRTL ? "הוספת המתנה נכשלה" : "Failed to add gift"
      );
    }
    setUploading(false);
  }, [giftName, description, imageUri, isRTL]);

  /* ----------------------------------------------------------------
     delete gift           
  ---------------------------------------------------------------- */
  const handleDelete = (id: string) => {
    Alert.alert(
      isRTL ? "מחק מתנה" : "Delete Gift",
      isRTL ? "האם אתה בטוח?" : "Are you sure?",
      [
        { text: isRTL ? "ביטול" : "Cancel", style: "cancel" },
        {
          text:   isRTL ? "מחק" : "Delete",
          style:  "destructive",
          onPress: async () => { await deleteDoc(doc(db, "gifts", id)); fetchGifts(); },
        },
      ]
    );
  };

  /* ----------------------------------------------------------------
     header form
  ---------------------------------------------------------------- */
  const renderHeader = () => (
    <View style={[styles.formContainer, { backgroundColor: SURFACE_BG }]}>
      <Text style={[styles.title, { color: ACCENT, textAlign: isRTL ? "right" : "left" }]}>
        {isRTL ? "הוספת מתנה" : "Upload Gift"}
      </Text>

      {/* ---------------- gift name ---------------- */}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: uploading ? "#ccc" : ACCENT,
            color:       TEXT_PRIMARY,
            textAlign:   isRTL ? "right" : "left",
          },
        ]}
        placeholder={isRTL ? "הכנס את שם המתנה" : "Enter gift name"}
        placeholderTextColor="#888"
        value={giftName}
        onChangeText={setGiftName}
        editable={!uploading}
      />

      {/* ---------------- description ---------------- */}
      <TextInput
        style={[
          styles.textArea,
          {
            borderColor: uploading ? "#ccc" : ACCENT,
            color:       TEXT_PRIMARY,
            textAlign:   isRTL ? "right" : "left",
          },
        ]}
        placeholder={isRTL ? "הכנס תיאור המתנה" : "Enter gift description"}
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline
        editable={!uploading}
      />

      {/* ---------------- image picker ---------------- */}
      <Pressable onPress={pickImage} disabled={uploading} style={styles.imagePickerBtn}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <View style={[styles.imagePlaceholder, { borderColor: ACCENT }]}>
            <Ionicons name="image-outline" size={48} color="#888" />
            <Text style={[styles.imageText, { textAlign: isRTL ? "right" : "left" }]}>
              {isRTL ? "בחר תמונה" : "Pick Image"}
            </Text>
          </View>
        )}
      </Pressable>

      {/* ---------------- submit ---------------- */}
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <Pressable
          onPressIn={() => animateButton(0.95)}
          onPressOut={() => animateButton(1)}
          onPress={handleSubmit}
          disabled={uploading}
          style={[styles.submitBtn, uploading && styles.btnDisabled]}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{isRTL ? "הוסף מתנה" : "Add Gift"}</Text>
          )}
        </Pressable>
      </Animated.View>

      {/* ---------------- list title ---------------- */}
      <Text
        style={[
          styles.sectionTitle,
          { color: TEXT_PRIMARY, textAlign: isRTL ? "right" : "left" },
        ]}
      >
        {isRTL ? "מתנות פתוחות" : "Open Gifts"}
      </Text>
    </View>
  );

  /* ----------------------------------------------------------------
     render
  ---------------------------------------------------------------- */
  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      style={[styles.flex, { backgroundColor: SURFACE_BG }]}
    >
      <LinearGradient
        colors={HEADER_GRAD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isRTL ? "הוספת מתנה" : "Upload Gift"}
        </Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={[styles.flex, { paddingBottom: insets.bottom }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={gifts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {isRTL ? "אין מתנות" : "No Gifts"}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.giftCard, { borderColor: ACCENT }]}>
              {/* === row: name + delete === */}
              <View style={styles.giftRow}>
                {/* ---------- ⬇️ NEW – translate gift name ---------- */}
                {(() => {
                  const cleanName = (item.name ?? "")
                    .trim()
                    .replace(/[\u200F\u200E]/g, "") // RLM/LRM
                    .replace(/\u00A0/g, " ")        // NBSP → space
                    .replace(/\s+/g, " ");          // collapse spaces

                  return (
                    <Text
                      style={[
                        styles.giftName,
                        { color: ACCENT, textAlign: isRTL ? "right" : "left" },
                      ]}
                    >
                      {t(cleanName, cleanName)}
                    </Text>
                  );
                })()}
                {/* --------------------------------------------------- */}

                <Pressable onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color={ACCENT} />
                </Pressable>
              </View>

              {/* ---------- ⬇️ NEW – translate description ---------- */}
              <Text
                style={[
                  styles.giftDesc,
                  { color: TEXT_PRIMARY, textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {t(item.description?.trim() ?? "", item.description)}
              </Text>
              {/* --------------------------------------------------- */}
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ----------------------------------------------------------------
   styles (unchanged)
---------------------------------------------------------------- */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems:    "center",
    justifyContent:"space-between",
    paddingHorizontal: 16,
  },
  backBtn:      { padding: 4 },
  headerTitle:  { color: "#fff", fontSize: 20, fontWeight: "700" },
  formContainer:{ padding: 16, margin: 16, borderRadius: 12, elevation: 2 },
  title:        { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  input:        { borderWidth: 2, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  textArea:     { borderWidth: 2, borderRadius: 8, padding: 12, minHeight: 100, textAlignVertical: "top", marginBottom: 12 },
  imagePickerBtn:{ alignItems: "center", marginBottom: 12 },
  imagePlaceholder:{ width: 120, height: 120, borderWidth: 2, borderStyle: "dashed", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  imageText:    { marginTop: 8, fontSize: 14, color: "#888" },
  imagePreview: { width: 200, height: 120, borderRadius: 8 },
  submitBtn:    { backgroundColor: ACCENT, paddingVertical: 14, borderRadius: 8, alignItems: "center", elevation: 2 },
  btnDisabled:  { backgroundColor: "#ccc" },
  btnText:      { color: "#fff", fontSize: 18, fontWeight: "600" },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginTop: 20 },
  giftCard:     { padding: 12, marginHorizontal: 16, marginVertical: 8, borderWidth: 2, borderRadius: 8 },
  giftRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  giftName:     { fontSize: 18, fontWeight: "700" },
  giftDesc:     { marginTop: 4, fontSize: 16 },
  emptyText:    { textAlign: "center", marginTop: 20, fontSize: 16 },
  listContent:  { paddingBottom: 40 },
});
