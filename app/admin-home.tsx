// app/admin-home.tsx
import React from "react";
import { StyleSheet, Pressable, Platform, StatusBar } from "react-native";
import { View, Text } from "../components/Themed";               // Themed.View & Themed.Text
import { useTheme } from "@react-navigation/native";             // כדי למשוך colors
import { router } from "expo-router";

const ADMIN_ACTIONS = [
  { label: "הוסף כרטיס סטודנט", to: "/admin/add-student-card" },
  { label: "הוסף אירוע", to: "/admin/add-event" },
  { label: "שלח הודעה", to: "/admin/send-message" },
  { label: "פרסם בפורום", to: "/admin/post-forum" },
  { label: "הגדרות מערכת", to: "/admin/settings" },
];

export default function AdminHome() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* סרגל עליון */}
      <View style={[styles.headerBar]}>
        <Text lightColor="#fff" darkColor="#fff" style={styles.headerText}>
          ברוך הבא אדמין יקר
        </Text>
      </View>

      {/* תפריט הכפתורים */}
      <View style={styles.menu}>
        {ADMIN_ACTIONS.map((act) => (
          <Pressable
            key={act.to}
            onPress={() => router.push(act.to as any)}
            android_ripple={{ color: colors.card }}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.border,   // כפתור אפור דינמי
                opacity: pressed ? 0.8 : 1,        // אפקט לחיצה
              },
            ]}
          >
            <Text style={styles.cardLabel}>{act.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    // אין backgroundColor פה – זה מגיע מ-Themed.View ב-root layout
  },

  /* ===== Header Bar ===== */
  headerBar: {
    paddingVertical: 26,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 28,
    backgroundColor: "#4f6cf7",      // אפשר להפוך לדינמי אם תרצה
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.3,
    // הצבע מ-Themed.Text ייגרם על ידי lightColor/darkColor שנתנו לו
  },

  /* ===== Menu ===== */
  menu: {
    flex: 1,
    paddingHorizontal: "6%",
    gap: 18,
  },

  /* ===== Card Button ===== */
  card: {
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 20,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.11,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
      },
      android: { elevation: 3 },
    }),
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: 0.4,
    // צבע יתאים אוטומטית מ-Themed.Text (colors.text)
  },
});
