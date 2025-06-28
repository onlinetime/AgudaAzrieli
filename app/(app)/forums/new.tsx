import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  LayoutRectangle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { router } from "expo-router";
import { db } from "../../../firebase";
import { useSettings } from "../../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";

/* צבעים */
const PRIMARY    = "#ff5252";
const LIGHT_BG   = "#ffffff";
const LIGHT_GREY = "#EEE";

/* קטגוריות */
const CATEGORIES = [
  "תוכנה",
  "תעשייה וניהול",
  "חומרים",
  "בניין",
  "פארמה",
  "מדעי המחשב",
  "חשמל ואלקטרוניקה",
  "מכונות",
  "אחר",
] as const;

export default function NewForum() {
  const insets = useSafeAreaInsets();
  const { darkMode }     = useSettings();
  const { t, i18n }      = useTranslation();
  const isRTL            = i18n.dir() === "rtl";

  /* -- palette -- */
  const SURFACE_BG   = darkMode ? "#121212" : LIGHT_BG;
  const FIELD_BG     = darkMode ? "#1f1f1f" : LIGHT_GREY;
  const TEXT_PRIMARY = darkMode ? "#E0E0E0" : "#121212";
  const BORDER_COLOR = PRIMARY;

  /* auth */
  const auth = getAuth();
  const user = auth.currentUser;

  /* ------- state ------- */
  const [title, setTitle]       = useState("");
  const [category, setCategory] = useState<string>("");
  const [desc, setDesc]         = useState("");
  const [saving, setSaving]     = useState(false);
  const [open, setOpen]         = useState(false);
  const pickerRef               = useRef<View>(null);
  const [pickerLayout, setPickerLayout] = useState<LayoutRectangle | null>(null);

  /* ------- save ------- */
  const handleSave = async () => {
    if (!title.trim() || !category) {
      Alert.alert(
        t("error", "שגיאה"),
        t("errorFillTitleAndCategory", "חובה למלא כותרת וקטגוריה")
      );
      return;
    }
    if (!user) {
      Alert.alert(t("error", "שגיאה"), t("errorNoUser", "אין משתמש מחובר"));
      return;
    }

    setSaving(true);
    try {
      /* מציאת שם מלא מה-users */
      let displayName = user.displayName || t("unknown", "Unknown");
      const uDoc      = await getDoc(doc(db, "users", user.uid));
      if (uDoc.exists()) {
        const u     = uDoc.data() as any;
        const full  = `${u.firstName || ""} ${u.lastName || ""}`.trim();
        if (full) displayName = full;
      }

      /* ---------- addDoc עם שדות האישור + נעיצה ---------- */
      await addDoc(collection(db, "forums"), {
        title:       title.trim(),
        category,
        description: desc.trim(),
        createdAt:   serverTimestamp(),

        /* שדות חדשים לאישור */
        approvalRequestedAt: serverTimestamp(),
        expireAt:            serverTimestamp(),   // לוגיקת מחיקה אוטומטית בקצה-שרת
        isApproved:          false,

        /* שדות נעיצה (ברירת-מחדל) */
        isPinned: false,
        pinnedAt: null,

        /* שדות קיימים */
        createdBy:   { displayName },
        isActive:    true,
        lastActivity: serverTimestamp(),
        likes:        0,
        commentsCount: 0,
      });

      router.back();
    } catch (e: any) {
      Alert.alert(
        t("error", "שגיאה"),
        e?.message || t("errorCannotSave", "לא ניתן לשמור פורום")
      );
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: SURFACE_BG }]}
      edges={["top", "bottom"]}
    >
      {/* HEADER */}
      <LinearGradient
        colors={[PRIMARY, "#ff1744"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={LIGHT_BG} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {t("newForumTitle", "יצירת פורום חדש")}
        </Text>
        <View style={styles.headerBtn} />
      </LinearGradient>

      {/* FORM */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* כותרת */}
          <Text
            style={[
              styles.label,
              { color: TEXT_PRIMARY, textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t("forumTitleLabel", "כותרת פורום *")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: BORDER_COLOR,
                backgroundColor: FIELD_BG,
                color: TEXT_PRIMARY,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
            placeholder={t("forumTitlePlaceholder", "הכנס כותרת")}
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />

          {/* קטגוריה */}
          <Text
            style={[
              styles.label,
              { color: TEXT_PRIMARY, textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t("categoryLabel", "קטגוריה *")}
          </Text>
          <View
            ref={pickerRef}
            onLayout={({ nativeEvent: { layout } }) => setPickerLayout(layout)}
          >
            <Pressable
              style={[
                styles.pickerButton,
                { borderColor: BORDER_COLOR, backgroundColor: FIELD_BG },
              ]}
              onPress={() => setOpen(o => !o)}
            >
              <Text
                style={[
                  styles.pickerText,
                  {
                    color: category ? TEXT_PRIMARY : "#888",
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {category
                  ? t(category, category)
                  : t("categoryPlaceholder", "בחר קטגוריה")}
              </Text>
              <Ionicons
                name={open ? "chevron-up" : "chevron-down"}
                size={20}
                color={TEXT_PRIMARY}
              />
            </Pressable>
          </View>

          {/* dropdown */}
          {open && pickerLayout && (
            <View
              style={[
                styles.dropdown,
                {
                  top: pickerLayout.y + pickerLayout.height,
                  left: pickerLayout.x,
                  width: pickerLayout.width,
                  backgroundColor: FIELD_BG,
                  borderColor: BORDER_COLOR,
                },
              ]}
            >
              <ScrollView nestedScrollEnabled>
                {CATEGORIES.map(c => (
                  <Pressable
                    key={c}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCategory(c);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        {
                          color: TEXT_PRIMARY,
                          textAlign: isRTL ? "right" : "left",
                        },
                      ]}
                    >
                      {t(c, c)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* תיאור */}
          <Text
            style={[
              styles.label,
              { color: TEXT_PRIMARY, textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t("descLabel", "תיאור (לא חובה)")}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                borderColor: BORDER_COLOR,
                backgroundColor: FIELD_BG,
                color: TEXT_PRIMARY,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
            placeholder={t("descPlaceholder", "הכנס תיאור")}
            placeholderTextColor="#888"
            value={desc}
            onChangeText={setDesc}
            multiline
          />

          {/* כפתור שמירה */}
          <Pressable
            style={[styles.saveBtn, { backgroundColor: PRIMARY }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={LIGHT_BG} />
            ) : (
              <Text style={styles.saveTxt}>{t("saveForum", "שמור פורום")}</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------- styles -------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  headerTitle: { color: LIGHT_BG, fontSize: 20, fontWeight: "700" },
  headerBtn:   { width: 32, height: 32, justifyContent: "center", alignItems: "center" },

  container: { padding: 16, paddingBottom: 24 },

  label: { fontSize: 16, fontWeight: "600", marginBottom: 6, marginTop: 12 },

  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: "top" },

  pickerButton: {
    height: 44,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  pickerText: { fontSize: 16 },

  dropdown: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 999,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dropdownText: { fontSize: 16 },

  saveBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveTxt: { color: LIGHT_BG, fontSize: 16, fontWeight: "600" },
});
