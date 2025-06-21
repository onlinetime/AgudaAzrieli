// app/(app)/settings.tsx
import React from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext"; //     ← נתיב מקוצר

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const {
    loading,
    language,          // "he" | "en"
    darkMode,          // boolean
    toggleLanguage,    // () => void
    setDarkMode,       // (v:boolean)=>void
  } = useSettings();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("settings")}</Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t("language")} ({t(language === "he" ? "hebrew" : "english")})
        </Text>
        <Switch value={language === "en"} onValueChange={toggleLanguage} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>{t("darkMode")}</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 32 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  label: { fontSize: 18, fontWeight: "500" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});