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
  getDocs,
  getDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { useSettings } from "../../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";

const ACCENT = "#ff1744";

export default function UserFeedback() {
  const insets = useSafeAreaInsets();
  const { darkMode } = useSettings();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("he");

  const SURFACE_BG = darkMode ? "#121212" : "#fff";
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
      Alert.alert(
        t("error", "שגיאה"),
        t("enterFeedback", "אנא הזן משוב")
      );
      return;
    }
    setSending(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert(t("error", "שגיאה"), t("notLoggedIn", "משתמש לא מחובר"));
        setSending(false);
        return;
      }
      // בודקים אם נשלח משוב בשבוע האחרון
      const oneWeekAgo = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyQ = query(
        collection(db, "feedbacks"),
        where("userId", "==", userId),
        where("createdAt", ">=", oneWeekAgo)
      );
      const weeklySnap = await getDocs(weeklyQ);
      if (!weeklySnap.empty) {
        Alert.alert(
          t("feedbackLimitWeekly", "ניתן לשלוח משוב רק פעם בשבוע")
        );
        setSending(false);
        return;
      }
      // לשמור את המשוב
      let userName = "Anonymous";
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const d = userDoc.data() as any;
        if (d.firstName || d.lastName) {
          userName = `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim();
        }
      }
      await addDoc(collection(db, "feedbacks"), {
        content,
        userId,
        userName,
        adminResponse: "",
        createdAt: serverTimestamp(),
      });
      setContent("");
      Alert.alert(
        t("thankYou", "תודה!"),
        t("feedbackSent", "המשוב הוגש בהצלחה.")
      );
    } catch (e) {
      console.error(e);
      Alert.alert(
        t("error", "שגיאה"),
        t("feedbackFailed", "לא ניתן לשלוח משוב")
      );
    } finally {
      setSending(false);
    }
  }, [content]);

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      style={[styles.flex, { backgroundColor: SURFACE_BG }]}
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
        <Text style={styles.headerTitle}>
          {t("sendFeedback", "שלח משוב")}
        </Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* FORM */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { paddingTop: 16 }]}>
          <Text
            style={[
              styles.title,
              { color: ACCENT, textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t("weValueFeedback", "אנו מעריכים את המשוב שלך")}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: TEXT_SECONDARY, textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t("letUsKnow", "השאר לנו את המחשבות או ההצעות שלך.")}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                borderColor: sending ? "#ccc" : ACCENT,
                color: TEXT_PRIMARY,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
            placeholder={t("feedbackPlaceholder", "הקלד את המשוב שלך כאן…")}
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
                <Text style={styles.buttonText}>
                  {t("sendFeedbackButton", "שלח משוב")}
                </Text>
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
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  container: { flex: 1, paddingHorizontal: 24 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
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
});
