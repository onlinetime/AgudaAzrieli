// app/components/BackButton.tsx

import React from "react";
import {
  Pressable,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface BackButtonProps {
  onPress?: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      style={styles.button}
    >
      <Ionicons name="arrow-back-outline" size={28} color="#b71c1c" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top:
      Platform.OS === "android"
        ? (RNStatusBar.currentHeight || 0) + 12
        : 12,
    left: 16,
    zIndex: 30,
    padding: 4,
  },
});
