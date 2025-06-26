import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import { WaveHeader } from "../user/WaveHeader";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const WAVE_HEIGHT = 120;
const OVERLAP = 40;

const EVENT_SUB = [
  { label: "הוסף אירוע",     to: "./add-event",   icon: "add-circle-outline" },
  { label: "אירועים פתוחים", to: "./open-events", icon: "time-outline" },
];
const STORE_SUB = [
  { label: "הוסף חנות",      to: "./add-store",   icon: "add-circle-outline" },
  { label: "רשימת חנויות",   to: "./list-stores", icon: "list-outline" },
];


const MAIN_MENU = [
  { key: "createGift",      to: "./uploadGift",        icon: "gift-outline" },
  { key: "giftEligibility", to: "./GiftVerify",        icon: "checkmark-done-outline" },
  { key: "uploadUsers",     to: "./upload-users-file", icon: "document-attach-outline" },
  { key: "feedback",        to: "/admin/feedback-list", icon: "chatbubble-outline" },
  { key: "forumPost",       to: "./admin-forum",       icon: "help-circle-outline" },
  { key: "addCard",         to: "/student-card",       icon: "cube-outline" },
  { key: "waveSettings",    to: "./waveSettings",      icon: "color-palette-outline" },
  { key: "settings",        to: "/settings",           icon: "settings-outline" },
];

export default function AdminHomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors, dark } = useTheme();

  const gradientColors: [import("react-native").ColorValue, import("react-native").ColorValue] = dark ? ["#1e1e1e", "#121212"] : ["#ffebee", "#ffcdd2"];
  const surfaceBg     = dark ? "#121212" : "#fff";
  const statusStyle   = dark ? "light-content" : "dark-content";

  const [showEvents, setShowEvents] = useState(false);
  const [showStores, setShowStores] = useState(false);

  return (
    <>
      <RNStatusBar translucent backgroundColor="transparent" barStyle={statusStyle} />
      <View style={styles.root}>
        <LinearGradient colors={gradientColors} style={styles.gradient}>
          <WaveHeader />

          <View
            style={[
              styles.content,
              { marginTop: WAVE_HEIGHT - OVERLAP + insets.top, backgroundColor: surfaceBg },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t("welcomeAdmin")}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {MAIN_MENU.map(({ key, to, icon }) => (
                <CardButton
                  key={key}
                  label={t(key)}
                  icon={icon}
                  to={to}
                  mainGrad={dark ? ["#1e1e1e", "#121212"] : ["#4f6cf7", "#d94645"]}
                  subGrad={dark ? ["#373737", "#2a2a2a"] : ["#f0f0f0", "#e8e8e8"]}
                  textColor={colors.text}
                  dark={dark}
                />
              ))}

              <CardButton
                label={t("eventManagement")}
                icon="calendar-outline"
                isToggle
                toggled={showEvents}
                onPress={() => setShowEvents((p) => !p)}
                mainGrad={dark ? ["#1e1e1e", "#121212"] : ["#4f6cf7", "#d94645"]}
                subGrad={dark ? ["#373737", "#2a2a2a"] : ["#f0f0f0", "#e8e8e8"]}
                textColor={colors.text}
                dark={dark}
              />
              {showEvents &&
                EVENT_SUB.map((b) => (
                  <CardButton
                    key={b.to}
                    {...b}
                    isSub
                    mainGrad={dark ? ["#1e1e1e", "#121212"] : ["#4f6cf7", "#d94645"]}
                    subGrad={dark ? ["#373737", "#2a2a2a"] : ["#f0f0f0", "#e8e8e8"]}
                    textColor={colors.text}
                    dark={dark}
                  />
                ))}

              <CardButton
                label={t("storeManagement")}
                icon="storefront-outline"
                isToggle
                toggled={showStores}
                onPress={() => setShowStores((p) => !p)}
                mainGrad={dark ? ["#1e1e1e", "#121212"] : ["#4f6cf7", "#d94645"]}
                subGrad={dark ? ["#373737", "#2a2a2a"] : ["#f0f0f0", "#e8e8e8"]}
                textColor={colors.text}
                dark={dark}
              />
              {showStores &&
                STORE_SUB.map((b) => (
                  <CardButton
                    key={b.to}
                    {...b}
                    isSub
                    mainGrad={dark ? ["#1e1e1e", "#121212"] : ["#4f6cf7", "#d94645"]}
                    subGrad={dark ? ["#373737", "#2a2a2a"] : ["#f0f0f0", "#e8e8e8"]}
                    textColor={colors.text}
                    dark={dark}
                  />
                ))}
            </ScrollView>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}

/* ------------------------------------------------------------------ */
type BtnProps = {
  label: string;
  to?: string;
  icon: string;
  isSub?: boolean;
  isToggle?: boolean;
  toggled?: boolean;
  onPress?: () => void;
  mainGrad: import("react-native").ColorValue[];
  subGrad: import("react-native").ColorValue[];
  textColor: string;
  dark: boolean;
};

function CardButton({
  label,
  to,
  icon,
  isSub = false,
  isToggle = false,
  toggled = false,
  onPress,
  mainGrad,
  subGrad,
  textColor,
  dark,
}: BtnProps) {
  const handle = () => {
    if (onPress) return onPress();
    if (to) router.push(to as any);
  };

  return (
    <Pressable
      onPress={handle}
      style={({ pressed }) => [styles.card, isSub && styles.cardSub, pressed && styles.cardPressed]}
      android_ripple={{ color: "rgba(0,0,0,0.12)" }}
    >
      <LinearGradient
        colors={(isSub ? subGrad : mainGrad) as [import("react-native").ColorValue, import("react-native").ColorValue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardBg, isSub && styles.cardSubBg]}
      >
        <Ionicons
          name={icon as any}
          size={isSub ? 20 : 24}
          color={dark ? "#e6e6e6" : "#4f4f4f"}
          style={styles.cardIcon}
        />
        <Text
          style={[
            styles.cardLabel,
            isSub && styles.cardLabelSub,
            { color: textColor },
            isToggle && toggled && styles.toggledLabel,
          ]}
        >
          {label}
        </Text>
        {isToggle && (
          <Ionicons
            name={toggled ? "chevron-up-outline" : "chevron-down-outline"}
            size={20}
            color={dark ? "#e6e6e6" : "#4f4f4f"}
            style={styles.toggleIcon}
          />
        )}
      </LinearGradient>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row-reverse" },
  gradient: { flex: 1, writingDirection: "rtl" },
  content: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },

  header: {
    height: 56,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#b71c1c", textAlign: "right" },

  scrollContent: { padding: 16 },

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

  cardBg: { flexDirection: "row", alignItems: "center", paddingVertical: 20, paddingHorizontal: 16 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 20, fontWeight: "600", flex: 1 },

  /* sub-buttons */
  cardSub: { marginLeft: 32, borderRadius: 16 },
  cardSubBg: { paddingVertical: 16 },
  cardLabelSub: { fontSize: 18, fontWeight: "500" },

  /* toggle extra */
  toggledLabel: { color: "#3C7DE5" },
  toggleIcon: { marginLeft: 8 },
});
