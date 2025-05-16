// app/main-screen.tsx
import React from "react";
import { Text, View } from "../components/Themed";      // Themed.View & Themed.Text
import { useTheme } from "@react-navigation/native";  
import { Pressable, StyleSheet, Platform, StatusBar } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const MENU_ITEMS = [
  { label: "כרטיס סטודנט", to: "/(drawer)/student-card" },
  { label: "אירועים קרובים", to: "/(drawer)/events" },
  { label: "הודעות", to: "/(drawer)/inbox" },
  { label: "פורומים", to: "/forums" },
  { label: "רשימת חנויות", to: "/(drawer)/user-store" },
  { label: "הגדרות", to: "/(drawer)/settings" },
];

export default function MainScreen() {
  const { colors, dark } = useTheme();

  // רקע גרדיאנט מותאם לכל מצב
  const bgColors: [string, string] = dark
    ? [colors.card, colors.background]
    : ["#fafbff", "#f5f7fa"];

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={bgColors} style={styles.container}>
        {/* כותרת עם צבע טקסט דינמי */}
        <Text style={[styles.title, { color: colors.text }]}>
          ברוכים הבאים לאגודת הסטודנטים 🎉
        </Text>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <CardButton
              key={item.to}
              label={item.label}
              to={item.to}
              rippleColor={colors.border}              // אפקט לחיצה דינמי
              gradientColors={[colors.primary, colors.notification] as [string, string]}
            />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

import type { ColorValue } from "react-native";

function CardButton({
  label,
  to,
  rippleColor,
  gradientColors,
}: {
  label: string;
  to: string;
  rippleColor: string;
  gradientColors: [ColorValue, ColorValue, ...ColorValue[]];
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
      android_ripple={{ color: rippleColor }}
      onPress={() => router.push(to as any)}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardBg}
      >
        <Text style={styles.cardLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: "6%",
    paddingTop: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    marginBottom: 40,
  },
  menu: {
    width: "100%",
    gap: 18,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.13,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  cardBg: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: "#fff",        
  },
});
