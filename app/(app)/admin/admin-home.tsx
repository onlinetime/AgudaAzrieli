import React, { useState } from "react";
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
  { label: "צפייה בפידבקים", to: "/admin/feedback-list" },
  { label: "פרסם בפורום", to: "/admin/post-forum" },
  { label: "הגדרות מערכת", to: "/admin/settings" },
  { label: "הוסף כרטיס סטודנט", to: "/admin/add-student-card" },
];

export default function AdminHome() {
  const [showEventOptions, setShowEventOptions] = useState(false);
  const [showStoreOptions, setShowStoreOptions] = useState(false);

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

        {/* כפתור ניהול אירועים */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          android_ripple={{ color: "rgba(0,0,0,0.12)" }}
          onPress={() => setShowEventOptions(!showEventOptions)}
        >
          <LinearGradient
            colors={["#fafbff", "#f5f7fa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBg}
          >
            <Text style={styles.cardLabel}>ניהול אירועים</Text>
          </LinearGradient>
        </Pressable>

        {/* אפשרויות ניהול אירועים */}
        {showEventOptions && (
          <View style={styles.eventOptions}>
            <CardButton label="הוסף אירוע" to="/admin/add-event" isSubButton />
            <CardButton
              label="אירועים פתוחים"
              to="/admin/open-events"
              isSubButton
            />
          </View>
        )}

        {/* כפתור ניהול חנויות */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          android_ripple={{ color: "rgba(0,0,0,0.12)" }}
          onPress={() => setShowStoreOptions(!showStoreOptions)}
        >
          <LinearGradient
            colors={["#fafbff", "#f5f7fa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBg}
          >
            <Text style={styles.cardLabel}>ניהול חנויות</Text>
          </LinearGradient>
        </Pressable>

        {/* אפשרויות ניהול חנויות */}
        {showStoreOptions && (
          <View style={styles.storeOptions}>
            <CardButton label="הוסף חנות" to="/admin/add-store" isSubButton />
            <CardButton
              label="רשימת חנויות"
              to="/admin/list-stores"
              isSubButton
            />
          </View>
        )}
      </View>
    </View>
  );
}

/* כפתור‑כרטיס */
function CardButton({
  label,
  to,
  isSubButton = false,
}: {
  label: string;
  to: string;
  isSubButton?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isSubButton && styles.subCard, // Apply sub-button styles if it's a sub-button
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
      android_ripple={{ color: "rgba(0,0,0,0.12)" }}
      onPress={() => router.push(to as any)}
    >
      <LinearGradient
        colors={isSubButton ? ["#f0f0f0", "#e8e8e8"] : ["#fafbff", "#f5f7fa"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardBg, isSubButton && styles.subCardBg]}
      >
        <Text style={[styles.cardLabel, isSubButton && styles.subCardLabel]}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 50 : 0,
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
    padding: 30,
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
  /* ===== Sub-Card Button ===== */
  subCard: {
    borderRadius: 12, // Smaller border radius
    marginLeft: 20, // Indent to show hierarchy
    marginRight: 20,
    overflow: "hidden",
  },
  subCardBg: {
    paddingVertical: 15, // Smaller padding
    alignItems: "center",
  },
  subCardLabel: {
    fontSize: 18, // Slightly smaller font size
    fontWeight: "400", // Lighter font weight
    color: "#4f4f4f",
  },

  /* ===== Event Options ===== */
  eventOptions: {
    marginTop: 10,
    gap: 10,
  },

  /* ===== Store Options ===== */
  storeOptions: {
    marginTop: 10,
    gap: 10,
  },
});
