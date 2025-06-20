// app/(app)/admin/admin-home.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/** תפריט ראשי – כל הכפתורים “שטוחים” (בלי תפריטי משנה) **/
const MAIN_MENU = [
  // ----- מתנות
  { key: "createGift",      to: "./uploadGift",        icon: "gift-outline" },
  { key: "giftEligibility", to: "./GiftVerify",        icon: "checkmark-done-outline" },
  { key: "uploadUsers",     to: "./upload-users-file", icon: "document-attach-outline" },

  // ----- מערכת “ישנה”
  { key: "feedback",        to: "/admin/feedback-list", icon: "chatbubble-outline" },

  { key: "forumPost",       to: "./admin-forum",       icon: "help-circle-outline" },
  { key: "addCard",         to: "/student-card",       icon: "cube-outline" },

  // ----- גל רקע (Wave Settings)
  { key: "waveSettings",    to: "./waveSettings",     icon: "color-palette-outline" },

  // ----- הגדרות
  { key: "settings",        to: "./admin-settings",    icon: "settings-outline" },
] as const;

/** כפתורי־משנה למסכי אירועים / חנויות **/
const EVENT_SUB = [
  { label: "הוסף אירוע",     to: "./admin/add-event",   icon: "add-circle-outline" },
  { label: "אירועים פתוחים", to: "./admin/open-events", icon: "time-outline" },
];
const STORE_SUB = [
  { label: "הוסף חנות",      to: "./admin/add-store",   icon: "add-circle-outline" },
  { label: "רשימת חנויות",   to: "./admin/list-stores", icon: "list-outline" },
];

export default function AdminHomeScreen() {
  const { t } = useTranslation();
  const [showEvents, setShowEvents] = useState(false);
  const [showStores, setShowStores] = useState(false);

  return (
    <View style={styles.flex}>
      {/* 🟦 סרגל עליון */}
      <LinearGradient
        colors={["#4f6cf7", "#d94645"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBar}
      >
        <Text style={styles.headerText}>{t("welcomeAdmin")}</Text>
      </LinearGradient>

      {/* 🔽 תפריט גלילה */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* כפתורי־על */}
        {MAIN_MENU.map(({ key, to, icon }) => (
          <CardButton key={key} label={t(key)} icon={icon} to={to} />
        ))}

        {/* --- ניהול אירועים --- */}
        <CardButton
          label={t("eventManagement")}
          icon="calendar-outline"
          isToggle
          toggled={showEvents}
          onPress={() => setShowEvents((p) => !p)}
        />
        {showEvents && (
          <View style={styles.subMenu}>
            {EVENT_SUB.map((b) => (
              <CardButton key={b.to} {...b} isSub />
            ))}
          </View>
        )}

        {/* --- ניהול חנויות --- */}
        <CardButton
          label={t("storeManagement")}
          icon="storefront-outline"
          isToggle
          toggled={showStores}
          onPress={() => setShowStores((p) => !p)}
        />
        {showStores && (
          <View style={styles.subMenu}>
            {STORE_SUB.map((b) => (
              <CardButton key={b.to} {...b} isSub />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*           כפתור כרטיס – ראשי, תת-כפתור או Toggle-קבוצה             */
/* ------------------------------------------------------------------ */
type BtnProps = {
  label: string;
  to?: string;
  icon: string;
  isSub?: boolean;
  isToggle?: boolean;
  toggled?: boolean;
  onPress?: () => void;
};

function CardButton({
  label,
  to,
  icon,
  isSub = false,
  isToggle = false,
  toggled = false,
  onPress,
}: BtnProps) {
  const handle = () => {
    if (onPress) return onPress();
    if (to) router.push(to as any);
  };

  return (
    <Pressable
      onPress={handle}
      style={({ pressed }) => [
        styles.card,
        isSub && styles.cardSub,
        pressed && styles.cardPressed,
      ]}
      android_ripple={{ color: "rgba(0,0,0,0.12)" }}
    >
      <LinearGradient
        colors={isSub ? ["#f0f0f0", "#e8e8e8"] : ["#fafbff", "#f5f7fa"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardBg, isSub && styles.cardSubBg]}
      >
        <Ionicons
          name={icon as any}
          size={isSub ? 20 : 24}
          color="#4f4f4f"
          style={styles.cardIcon}
        />
        <Text
          style={[
            styles.cardLabel,
            isSub && styles.cardLabelSub,
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

/* ------------------------------------------------------------------ */
/*                              Styles                                 */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  /* header */
  headerBar: {
    paddingVertical: 28,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 6 }, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  headerText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  /* scroll content */
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    minHeight: SCREEN_HEIGHT + 40,
  },

  /* card generic */
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },

  cardBg: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 20, fontWeight: "600", color: "#4f4f4f", flex: 1 },

  /* sub-buttons */
  cardSub: { marginLeft: 32, borderRadius: 16 },
  cardSubBg: { paddingVertical: 16 },
  cardLabelSub: { fontSize: 18, fontWeight: "500" },

  /* toggle extra */
  toggledLabel: { color: "#3C7DE5" },
  toggleIcon: { marginLeft: 8 },

  /* submenu wrapper */
  subMenu: { marginBottom: 12 },
});
