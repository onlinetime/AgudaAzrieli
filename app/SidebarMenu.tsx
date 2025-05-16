import React from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

/** יעד הנתיב והכותרת של כל פריט */
const MENU_ITEMS = [
  { label: "כרטיס סטודנט", to: "/(drawer)/student-card" },
  { label: "אירועים קרובים", to: "/(drawer)/events" },
  { label: "הודעות", to: "/(drawer)/inbox" },
  { label: "פורומים", to: "/(drawer)/forums" },
  { label: "הגדרות משתמש", to: "/(drawer)/user-settings" },
  { label: "רשימת חנויות", to: "/(drawer)/user-store" },
];

export default function SidebarMenu() {
  return (
    <View style={styles.container}>
      {MENU_ITEMS.map((item) => (
        <Pressable
          key={item.to}
          style={styles.menuItem}
          onPress={() => router.push(item.to as any)}
        >
          <LinearGradient
            colors={["#4f6cf7", "#d94645"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.menuItemBg}
          >
            <Text style={styles.menuText}>{item.label}</Text>
          </LinearGradient>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f7fa",
  },
  menuItem: {
    marginBottom: 15,
  },
  menuItemBg: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  menuText: {
    color: "#fff",
    fontSize: 18,
  },
});
