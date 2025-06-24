import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useSettings } from "../../../contexts/SettingsContext";

import { useTranslation } from "react-i18next";   /* ← חדש */

const ACCENT = "#ff1744";
const BG_LIGHT = "#fff";

export default function UserFeedback() {
  const insets = useSafeAreaInsets();
  const { darkMode } = useSettings();
  const { t, i18n } = useTranslation();          /* ← חדש */
  const lang = i18n.language;                    /* ← חדש */

  const SURFACE_BG = darkMode ? "#121212" : BG_LIGHT;
  const TEXT_PRIMARY = darkMode ? "#E0E0E0" : "#121212";
  const TEXT_SECONDARY = darkMode ? "#C0C0C0" : "#333";

  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const btnScale = useRef(new Animated.Value(1)).current;

  const animateButton = (toValue: number) => {
    Animated.spring(btnScale, { toValue, friction: 3, useNativeDriver: true }).start();
  };

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      Alert.alert(t("enterFeedback", "אנא הזן משוב"));
      return;
    }
    setSending(true);
    try {
      const userId = "USER_ID_HERE";
      const lastQ = query(
        collection(db, "feedback"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(1),
      );
      const lastSnap = await getDocs(lastQ);
      if (!lastSnap.empty) {
        const lastAt = lastSnap.docs[0].data().createdAt?.toDate();
        if (lastAt) {
          const days = (Date.now() - lastAt.getTime()) / (1000 * 60 * 60 * 24);
          if (days < 7) {
            Alert.alert(t("feedbackLimitWeekly", "ניתן לשלוח משוב רק פעם בשבוע"));
            setSending(false);
            return;
          }
        }
      }
      let userName = "Anonymous";
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const d = userDoc.data() as any;
        if (d.firstName || d.lastName) userName = `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim();
      }
      await addDoc(collection(db, "feedback"), {
        content,
        userId,
        userName,
        adminResponse: "",
        createdAt: serverTimestamp(),
      });
      setContent("");
      Alert.alert(t("thankYou", "תודה!"), t("feedbackSent", "המשוב הוגש בהצלחה."));
    } catch (e) {
      console.error(e);
      Alert.alert(t("error", "שגיאה"), t("feedbackFailed", "לא ניתן לשלוח משוב"));
    } finally {
      setSending(false);
    }
  }, [content]);

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: SURFACE_BG }]}
      edges={["bottom", "left", "right"]}
    >
      {/* HEADER */}
      <LinearGradient
        colors={[ACCENT, "#d32f2f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{t("sendFeedback", "Send Feedback")}</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* FORM */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { paddingTop: 16 }]}>
          <Text style={[styles.title, { color: ACCENT }]}>
            {t("weValueFeedback", "We Value Your Feedback")}
          </Text>
          <Text style={[styles.subtitle, { color: TEXT_SECONDARY }]}>
            {t("letUsKnow", "Let us know your thoughts or suggestions.")}
          </Text>

          <TextInput
            style={[
              styles.input,
              { borderColor: sending ? "#ccc" : ACCENT, color: TEXT_PRIMARY },
            ]}
            placeholder={t("feedbackPlaceholder", "Type your feedback here...")}
            placeholderTextColor="#888"
            value={content}
            onChangeText={setContent}
            multiline
            editable={!sending}
          />

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <Pressable
              style={[styles.button, sending && styles.buttonDisabled]}
              onPressIn={() => animateButton(0.95)}
              onPressOut={() => animateButton(1)}
              onPress={handleSubmit}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t("sendFeedbackButton", "שלח משוב")}</Text>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  container: { flex: 1, paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: "center" },
  input: {
    flexGrow: 1,
    minHeight: 120,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  buttonDisabled: { backgroundColor: "#ccc" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  error: { fontSize: 18, textAlign: "center", marginVertical: 12 },
});
