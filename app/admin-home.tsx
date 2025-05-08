// app/admin-home.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

/** מטריצה של פעולות הניהול */
const ADMIN_ACTIONS = [
  { label: "הוסף כרטיס סטודנט", to: "/admin/add-student-card" },
  { label: "הוסף אירוע", to: "/admin/add-event" },
  { label: "שלח הודעה", to: "/admin/send-message" },
  { label: "פרסם בפורום", to: "/admin/post-forum" },
  { label: "הגדרות מערכת", to: "/admin/settings" },
];

export default function AdminHome() {
  return (
    <View style={styles.container}>
      {/* סרגל עליון צבעוני */}
      <LinearGradient
        colors={["#4f6cf7", "#d94645"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBar}
      >
        <Text style={styles.headerText}>ברוך הבא אדמין יקר</Text>
      </LinearGradient>

      {/* אזור כפתורי הניהול */}
      <View style={styles.menu}>
        {ADMIN_ACTIONS.map((act) => (
          <CardButton key={act.to} label={act.label} to={act.to} />
        ))}
      </View>
    </View>
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
      android_ripple={{ color: "rgba(0,0,0,0.12)" }}
      onPress={() => router.push(to as any)}
    >
      <LinearGradient
        colors={["#fafbff", "#f5f7fa"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  /* ===== Header Bar ===== */
  headerBar: {
    paddingVertical: 26,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 28,
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
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.3,
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
  cardBg: {
    paddingVertical: 20,
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: "500",
    color: "#4f4f4f",
    letterSpacing: 0.4,
  },
});
