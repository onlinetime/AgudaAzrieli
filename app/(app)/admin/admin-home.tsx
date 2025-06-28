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
  ColorValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import { WaveHeader } from "../user/WaveHeader";

const ACCENT = "#ff1744";  // always-red text & border
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const WAVE_HEIGHT = 120;
const OVERLAP = 40;

// משתמשים במפתחות שכבר קיימים ב-i18n
const EVENT_SUB = [
  { key: "addEventSubmit",  to: "./add-event",   icon: "add-circle-outline" },
  { key: "openEventsTitle", to: "./open-events", icon: "time-outline" },
];
const STORE_SUB = [
  { key: "addStoreSubmit",  to: "./add-store",   icon: "add-circle-outline" },
  { key: "listStoresTitle", to: "./list-stores", icon: "list-outline" },
];

const MAIN_MENU = [
  { key: "createGift",      to: "./uploadGift",        icon: "gift-outline" },
  { key: "giftEligibility", to: "./GiftVerify",        icon: "checkmark-done-outline" },
  { key: "uploadUsers",     to: "./upload-users-file", icon: "document-attach-outline" },
  { key: "feedback",        to: "/admin/feedback-list", icon: "chatbubble-outline" },
  //{ key: "forumPost",       to: "./admin-forum",       icon: "help-circle-outline" }, -- לשאול את לירון אם הוא רוצה את זה
  { key: "studentCardlist",     to: "./studentslist",       icon: "cube-outline" },
  //{ key: "waveSettings",    to: "./waveSettings",      icon: "color-palette-outline" }, --- לשאול את לירון אם הוא רוצה את זה
  { key: "settings",        to: "/settings",           icon: "settings-outline" },
];

export default function AdminHomeScreen() {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const { colors, dark } = useTheme();

  const gradientColors: [ColorValue, ColorValue] =
    dark ? ["#1e1e1e", "#121212"] : ["#ffebee", "#ffcdd2"];
  const surfaceBg   = dark ? "#121212" : "#fff";
  const statusStyle = dark ? "light-content" : "dark-content";

  const [showEvents, setShowEvents] = useState(false);
  const [showStores, setShowStores] = useState(false);

  return (
    <>
      <RNStatusBar translucent backgroundColor="transparent" barStyle={statusStyle} />
      <View
        style={[
          styles.root,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <LinearGradient colors={gradientColors} style={styles.gradient}>
          <WaveHeader />

          <View
            style={[
              styles.content,
              {
                marginTop: WAVE_HEIGHT - OVERLAP + insets.top,
                backgroundColor: surfaceBg,
              },
            ]}
          >
            <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    textAlign: isRTL ? "right" : "left",
                    writingDirection: isRTL ? "rtl" : "ltr",
                  },
                ]}
              >
                {t("welcomeAdmin")}
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {MAIN_MENU.map(({ key, to, icon }) => (
                <CardButton
                  key={key}
                  label={t(key)}
                  icon={icon}
                  to={to}
                  dark={dark}
                  isRTL={isRTL}
                  isSub={false}
                  isToggle={false}
                  toggled={false}
                />
              ))}

              <CardButton
                label={t("eventManagement")}
                icon="calendar-outline"
                isToggle
                toggled={showEvents}
                onPress={() => setShowEvents((p) => !p)}
                dark={dark}
                isRTL={isRTL}
              />
              {showEvents &&
                EVENT_SUB.map(({ key, ...rest }) => (
                  <CardButton
                    key={rest.to}
                    label={t(key)}
                    {...rest}
                    isSub
                    dark={dark}
                    isRTL={isRTL}
                  />
                ))}

              <CardButton
                label={t("storeManagement")}
                icon="storefront-outline"
                isToggle
                toggled={showStores}
                onPress={() => setShowStores((p) => !p)}
                dark={dark}
                isRTL={isRTL}
              />
              {showStores &&
                STORE_SUB.map(({ key, ...rest }) => (
                  <CardButton
                    key={rest.to}
                    label={t(key)}
                    {...rest}
                    isSub
                    dark={dark}
                    isRTL={isRTL}
                  />
                ))}
            </ScrollView>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}

type BtnProps = {
  label: string;
  to?: string;
  icon: string;
  isSub?: boolean;
  isToggle?: boolean;
  toggled?: boolean;
  onPress?: () => void;
  dark: boolean;
  isRTL?: boolean;
};

function CardButton({
  label,
  to,
  icon,
  isSub = false,
  isToggle = false,
  toggled = false,
  onPress,
  dark,
  isRTL = false,
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
      {/* plain background = screen background, red border */}
      <View
        style={[
          styles.cardBg,
          isSub && styles.cardSubBg,
          {
            backgroundColor: dark ? "#121212" : "#fff",
            borderColor: ACCENT,
            borderWidth: 2,
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={isSub ? 20 : 24}
          color={ACCENT}
          style={{
            marginRight: isRTL ? 0 : 12,
            marginLeft: isRTL ? 12 : 0,
          }}
        />
        <Text
          style={[
            styles.cardLabel,
            isSub && styles.cardLabelSub,
            { color: ACCENT, textAlign: isRTL ? "right" : "left" },
            isToggle && toggled && styles.toggledLabel,
          ]}
        >
          {label}
        </Text>
        {isToggle && (
          <Ionicons
            name={toggled ? "chevron-up-outline" : "chevron-down-outline"}
            size={20}
            color={ACCENT}
            style={{
              marginLeft: isRTL ? 0 : 8,
              marginRight: isRTL ? 8 : 0,
            }}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },

  header: {
    height: 56,
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#b71c1c" },

  scrollContent: { padding: 16 },

  /* card generic */
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },

  /* content inside button */
  cardBg: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  cardSub: { marginLeft: 32, borderRadius: 16 },
  cardSubBg: { paddingVertical: 16 },

  cardIcon: {},
  cardLabel: { fontSize: 20, fontWeight: "600", flex: 1 },
  cardLabelSub: { fontSize: 18, fontWeight: "500" },

  /* toggle extra */
  toggledLabel: { color: ACCENT },
  toggleIcon: {},
});
