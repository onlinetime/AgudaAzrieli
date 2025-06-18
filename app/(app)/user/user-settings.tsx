import React from "react";
import { View, Text, Switch, StyleSheet, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../contexts/SettingsContext";
import { useTheme } from "@react-navigation/native";

export default function UserSettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { language, darkMode, toggleLanguage, setDarkMode, loading } =
    useSettings();

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

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
  container: { flex: 1, padding: 24 },
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
