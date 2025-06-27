import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useSettings, WaveColors } from "../../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";            // ← חדש

export default function WaveSettingsScreen() {
  const { colors } = useTheme();
  const { t }     = useTranslation();                      // ← חדש

  /* from context */
  const { waveColors, updateWaveColors } = useSettings();
  const fallbackColor = colors.primary;

  const [hex, setHex] = useState(waveColors?.topColor ?? fallbackColor);

  useEffect(() => {
    setHex(waveColors?.topColor ?? fallbackColor);
  }, [waveColors?.topColor, fallbackColor]);

  /* ---------- save ---------- */
  const handleSave = async () => {
    const valid = /^#?([0-9A-F]{6})$/i.test(hex.trim());
    if (!valid) {
      Alert.alert(t("badFormat"), t("enterValidHex"));
      return;
    }

    const formatted = hex.trim().startsWith("#") ? hex.trim() : "#" + hex.trim();
    const newColors: WaveColors = {
      topColor:    formatted,
      middleColor: formatted,
      bottomColor: formatted,
    };

    try {
      await updateWaveColors(newColors);
      Alert.alert(t("completed"), t("waveColorsSaved"));
    } catch (e) {
      console.error(e);
      Alert.alert(t("error"), t("cannotSaveWave"));
    }
  };

  /* ---------- UI ---------- */
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.label, { color: colors.text }]}>
        {t("wavePickHex")}                              {/* ← תרגום */}
      </Text>

      <TextInput
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.text },
        ]}
        value={hex}
        onChangeText={setHex}
        placeholder="#ff5252"
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View
        style={[
          styles.preview,
          { backgroundColor: hex, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.previewText, { color: colors.text }]}>{hex}</Text>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={styles.buttonText}>{t("save")}</Text>   {/* ← תרגום */}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  label:     { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  preview: {
    height: 50,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  previewText: { fontSize: 14, fontWeight: "500" },
  button:      { paddingVertical: 14, borderRadius: 6, alignItems: "center" },
  buttonText:  { color: "#fff", fontSize: 16, fontWeight: "600" },
});
