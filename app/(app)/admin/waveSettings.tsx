// app/(app)/admin/wave-settings.tsx

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

export default function WaveSettingsScreen() {
  const { colors } = useTheme();
  const { waveColors, updateWaveColors } = useSettings();

  const [hex, setHex] = useState(waveColors.topColor);

  // סנכרון עם ה־context
  useEffect(() => {
    setHex(waveColors.topColor);
  }, [waveColors.topColor]);

  const handleSave = async () => {
    // לוודא פורמט #RRGGBB
    const valid = /^#?([0-9A-F]{6})$/i.test(hex.trim());
    if (!valid) {
      Alert.alert("פורמט שגוי", "אנא הכנס קוד hex תקין, לדוגמה #ff0000");
      return;
    }
    const formatted = hex.trim().startsWith("#") ? hex.trim() : "#" + hex.trim();
    const newColors: WaveColors = {
      topColor: formatted,
      middleColor: formatted,
      bottomColor: formatted,
    };
    try {
      await updateWaveColors(newColors);
      Alert.alert("✅ הושלם", "צבעי הגלים עודכנו בהצלחה!");
    } catch (e) {
      console.error(e);
      Alert.alert("❌ שגיאה", "לא ניתן לעדכן את צבעי הגלים.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.label, { color: colors.text }]}>
        בחר/הדבק קוד HEX לצבע הגלים:
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
        <Text style={[styles.previewText, { color: colors.text }]}>
          {hex}
        </Text>
      </View>
      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={[styles.buttonText, { color: "#fff" }]}>שמירה</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  label: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
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
  button: {
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
