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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const {
    loading,
    language,
    darkMode,
    toggleLanguage,
    setDarkMode,
  } = useSettings();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      edges={["top", "bottom"]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{t("settings")}</Text>

      <View style={[styles.card, { backgroundColor: colors.card ?? colors.background }]}>  
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("language")}
          </Text>
          <View style={styles.switchContainer}>
            <Text style={[styles.valueLabel, { color: colors.text }]}>               
              {t(language === "he" ? "hebrew" : "english")}
            </Text>
            <Switch
              value={language === "en"}
              onValueChange={toggleLanguage}
              thumbColor={colors.primary}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("darkMode")}
          </Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            thumbColor={colors.primary}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
  },
  valueLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});