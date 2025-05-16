import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

/** יעד הנתיב והכותרת של כל פריט */
const MENU_ITEMS = [
  { label: "כרטיס סטודנט", to: "/(drawer)/student-card" },
  { label: "אירועים קרובים", to: "./events" },
  { label: "הודעות", to: "/(drawer)/inbox" },
  { label: "פורומים", to: "/(drawer)/forums" },
  { label: "רשימת חנויות", to: "./user-store" },
];

export default function MainScreen() {
  return (
    <LinearGradient colors={["#fafbff", "#f5f7fa"]} style={styles.container}>
      <Text style={styles.title}>ברוכים הבאים לאגודת הסטודנטים🎉</Text>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <CardButton key={item.to} label={item.label} to={item.to} />
        ))}
      </View>
    </LinearGradient>
  );
}

/* כפתור‑כרטיס */
function CardButton({ label, to }: { label: string; to: string }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
      android_ripple={{ color: "rgba(0,0,0,0.15)" }}
      onPress={() => router.push(to as any)}
    >
      <LinearGradient
        colors={["#4f6cf7", "#d94645"]} /* כחול → אדום עדין */
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
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    marginBottom: 40,
    color: "#333",
  },
  menu: {
    width: "88%",
    gap: 18,
  },
  card: {
    borderRadius: 16,
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
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});
