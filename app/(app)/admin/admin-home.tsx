import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

/** מטריצה של פעולות הניהול עם אייקונים */
const ADMIN_ACTIONS = [
  {
    label: "צפייה בפידבקים",
    to: "/admin/feedback-list",
    icon: "chatbubble-ellipses-outline",
  },
  {
    label: "פרסום בפורום",
    to: "/admin/post-forum",
    icon: "md-newspaper-outline",
  },
  { label: "הגדרות מערכת", to: "/admin/settings", icon: "settings-outline" },
  {
    label: "הוסף כרטיס סטודנט",
    to: "/admin/add-student-card",
    icon: "school-outline",
  },
  {
    label: "העלאת קובץ משתמשים ",
    to: "/admin/upload-users-file",
    icon: "cloud-upload-outline",
  },
  {
    label: "זכאות למתנה",
    to: "/admin/GiftVerify",
    icon: "gift-outline",
  },
  {
    label: "יצירת מתנה",
    to: "/admin/uploadGift",
    icon: "gift-outline",
  },
];

export default function AdminHome() {
  const [showEventOptions, setShowEventOptions] = useState(false);
  const [showStoreOptions, setShowStoreOptions] = useState(false);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4f6cf7", "#d94645"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBar}
      >
        <Text style={styles.headerText}>ברוך הבא אדמין יקר</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.menu}
        showsVerticalScrollIndicator={false}
      >
        {ADMIN_ACTIONS.map((act) => (
          <CardButton key={act.to} {...act} />
        ))}

        <CardButton
          label="ניהול אירועים"
          icon="calendar-outline"
          isToggle
          toggled={showEventOptions}
          onPress={() => setShowEventOptions(!showEventOptions)}
        />
        {showEventOptions && (
          <View style={styles.subMenu}>
            <CardButton
              label="הוסף אירוע"
              to="/admin/add-event"
              isSubButton
              icon="add-circle-outline"
            />
            <CardButton
              label="אירועים פתוחים"
              to="/admin/open-events"
              isSubButton
              icon="time-outline"
            />
          </View>
        )}

        <CardButton
          label="ניהול חנויות"
          icon="storefront-outline"
          isToggle
          toggled={showStoreOptions}
          onPress={() => setShowStoreOptions(!showStoreOptions)}
        />
        {showStoreOptions && (
          <View style={styles.subMenu}>
            <CardButton
              label="הוסף חנות"
              to="/admin/add-store"
              isSubButton
              icon="add-circle-outline"
            />
            <CardButton
              label="רשימת חנויות"
              to="/admin/list-stores"
              isSubButton
              icon="list-outline"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function CardButton({
  label,
  to,
  icon,
  isSubButton = false,
  isToggle = false,
  toggled = false,
  onPress,
}: {
  label: string;
  to?: string;
  icon: string;
  isSubButton?: boolean;
  isToggle?: boolean;
  toggled?: boolean;
  onPress?: () => void;
}) {
  const handlePress = () => {
    if (onPress) return onPress();
    if (to) router.push(to as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        isSubButton && styles.subCard,
        pressed && styles.cardPressed,
      ]}
      android_ripple={{ color: "rgba(0,0,0,0.1)" }}
    >
      <LinearGradient
        colors={isSubButton ? ["#f0f0f0", "#e8e8e8"] : ["#fafbff", "#f5f7fa"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardBg, isSubButton && styles.subCardBg]}
      >
        <Ionicons
          name={icon as any}
          size={isSubButton ? 20 : 24}
          color="#4f4f4f"
          style={styles.cardIcon}
        />
        <Text
          style={[
            styles.cardLabel,
            isSubButton && styles.subCardLabel,
            isToggle && toggled && styles.toggledLabel,
          ]}
        >
          {label}
        </Text>
        {isToggle && (
          <Ionicons
            name={toggled ? "chevron-up-outline" : "chevron-down-outline"}
            size={20}
            color="#4f4f4f"
            style={styles.toggleIcon}
          />
        )}
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
  headerBar: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  headerText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  menu: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  cardBg: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4f4f4f",
    flex: 1,
  },
  subCard: {
    marginLeft: 32,
    borderRadius: 16,
  },
  subCardBg: {
    paddingVertical: 16,
  },
  subCardLabel: {
    fontSize: 18,
    fontWeight: "500",
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  toggledLabel: {
    color: "#3C7DE5",
  },
  toggleIcon: {
    marginLeft: 8,
  },
  subMenu: {
    marginBottom: 12,
  },
});
