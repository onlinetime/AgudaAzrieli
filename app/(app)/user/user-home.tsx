import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
  Easing,
  StatusBar as RNStatusBar,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { WaveHeader } from "./WaveHeader";
import { router } from "expo-router";
import { useSettings } from "../../../contexts/SettingsContext";
import QUOTES from "../../../data/quotes";

import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WAVE_HEIGHT = 120;
const OVERLAP = 40;
const DRAWER_WIDTH = 260;

// parseDate utility
const parseDate = (value: any): Date => {
  if (value && typeof value === "object" && "seconds" in value) {
    return new Date((value as Timestamp).seconds * 1000);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }
  if (typeof value === "string" && value.includes("/")) {
    const [d, m] = value.split("/").map(Number);
    return new Date(new Date().getFullYear(), m - 1, d);
  }
  return new Date(value);
};

type RawEvent = {
  id: string;
  title: string;
  startDate: any;
  endDate?: any;
};

type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
};

export default function UserHome() {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const { darkMode } = useSettings();

  const SURFACE_BG = darkMode ? "#121212" : "#fff";
  const TEXT_PRIMARY = darkMode ? "#E0E0E0" : "#121212";
  const TEXT_SECONDARY = darkMode ? "#C0C0C0" : "#555";
  // lighter red accent
  const ACCENT = "#ff5252";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  // Quotes rotation
  const [quoteIndex, setQuoteIndex] = useState(0);
  const hasQuotes = Array.isArray(QUOTES) && QUOTES.length > 0;
  const displayQuote = hasQuotes ? QUOTES[quoteIndex] : t("noQuotes", "אין ציטוטים זמינים");

  useEffect(() => {
    const id = setInterval(() => {
      if (hasQuotes) setQuoteIndex(i => (i + 1) % QUOTES.length);
    }, 3600000);
    return () => clearInterval(id);
  }, [hasQuotes]);

  // Firestore events
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), snap => {
      setRawEvents(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  // derive upcoming with start & end
  const upcoming = useMemo<Event[]>(() => {
    const now = new Date();
    return rawEvents
      .map(e => {
        const start = parseDate(e.startDate);
        const end = e.endDate ? parseDate(e.endDate) : new Date(start);
        if (!e.endDate) end.setHours(23, 59, 59, 999);
        return { id: e.id, title: t(e.title) || e.title, start, end };
      })
      .filter(e => e.end >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 2);
  }, [rawEvents, t]);

  // Drawer animation
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: drawerOpen ? 0 : DRAWER_WIDTH,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [drawerOpen]);

  const MENU_ITEMS = [
    { label: t("studentCard"), to: "../student-card", icon: "card-outline" },
    { label: t("upcomingEvents"), to: "./events", icon: "calendar-outline" },
    { label: t("forums","פורומים"), to: "/forums", icon: "chatbubble-ellipses-outline" },
    { label: t("collectGift","איסוף מתנה"), to: "./ClaimGift", icon: "gift-outline" },
    { label: t("storesList"), to: "./user-store", icon: "storefront-outline" },
    { label: t("sendFeedback"), to: "./user-feedback", icon: "pencil-outline" },
    { label: t("settings"), to: "/settings", icon: "settings-outline" },
  ];

  const gradientColors: [string,string] = darkMode
    ? ["#1e1e1e","#121212"]
    : ["#ffebee","#ffcdd2"];
  const statusStyle = darkMode ? "light-content" : "dark-content";
  const drawerText = darkMode ? "#fff" : "#2a3f5f";
  const drawerIcon = darkMode ? "#fff" : "#2a3f5f";

  return (
    <>
      <RNStatusBar translucent backgroundColor="transparent" barStyle={statusStyle} />

      <View style={[styles.root, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <LinearGradient colors={gradientColors} style={styles.gradient}>
          <WaveHeader />

          {/* hamburger stays right */}
          {!drawerOpen && (
            <Pressable
              onPress={() => setDrawerOpen(true)}
              style={[styles.menuButton, { top: insets.top + 8 }]}
            >
              <Ionicons name="menu-outline" size={28} color={'#ffffff'} />
            </Pressable>
          )}

          {drawerOpen && (
            <Pressable
              style={[styles.overlay, { top: insets.top }]}
              onPress={() => setDrawerOpen(false)}
            />
          )}

          <Animated.View
            style={[
              styles.drawer,
              { transform: [{ translateX }], top: insets.top, backgroundColor: SURFACE_BG },
            ]}
          >
            <Text style={[styles.drawerTitle, { color: drawerText }]}>{t("menu","תפריט")}</Text>
            {MENU_ITEMS.map(item => (
              <Pressable
                key={item.to}
                onPress={() => {
                  setDrawerOpen(false);
                  router.push(item.to as any);
                }}
                style={styles.drawerItem}
              >
                <View
                  style={[
                    styles.drawerItemRow,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={22} color={drawerIcon} />
                  <Text
                    style={[
                      styles.drawerItemText,
                      { color: drawerText, textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setDrawerOpen(false)}
              style={[styles.closeButton, isRTL ? { left: 16 } : { right: 16 }]}
            >
              <Ionicons name="close-outline" size={28} color={ACCENT} />
            </Pressable>
          </Animated.View>

          <View
            style={[
              styles.content,
              { marginTop: WAVE_HEIGHT - OVERLAP + insets.top, backgroundColor: SURFACE_BG },
            ]}
          >
            {/* HEADER */}
            <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text
                style={[
                  styles.headerTitle,
                  { color: ACCENT, textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {t("homeOfStudents","הבית של הסטודנטים")}
              </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Quote */}
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: ACCENT, textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {t("quoteOfMoment","ציטוט של הרגע")}
                </Text>
                <View style={[styles.quoteCard, { backgroundColor: SURFACE_BG }]}>
                  <Text style={styles.quoteText}>"{displayQuote}"</Text>
                </View>
              </View>

              {/* Upcoming Events */}
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: ACCENT, textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {t("upcomingEvents")}
                </Text>
                {upcoming.length > 0 ? (
                  upcoming.map(e => (
                    <View key={e.id} style={styles.card}>
                      <Text
                        style={[
                          styles.cardText,
                          {
                            color: darkMode ? "#000" : TEXT_SECONDARY,
                            textAlign: isRTL ? "right" : "left",
                          },
                        ]}
                      >
                        • {e.title} — {e.start.toLocaleDateString()} עד{" "}
                        {e.end.toLocaleDateString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text
                    style={[
                      styles.cardText,
                      {
                        color: darkMode ? "#000" : TEXT_SECONDARY,
                        textAlign: isRTL ? "right" : "left",
                      },
                    ]}
                  >
                    {t("noUpcomingEvents")}
                  </Text>
                )}
              </View>

              {/* About Section */}
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: ACCENT, textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {t("aboutAssociation","קצת עלינו")}
                </Text>
                {/* only this text is translated via i18n */}
                <Text
                  style={[
                    styles.aboutText,
                    { color: TEXT_PRIMARY, textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {t(
                    "aboutText",
                    i18n.language === "en"
                      ? `Welcome to the Azrieli College Jerusalem Student Association! We represent students, improve campus life, organize events and promote academic and welfare initiatives.`
                      : `אגודת הסטודנטים במכללת עזריאלי בירושלים מייצגת את הסטודנטים, משפרת את חוויית הקמפוס, מארגנת אירועים וקידום יוזמות אקדמיות ורווחה.`
                  )}
                </Text>
              </View>
            </ScrollView>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1 },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 15,
  },
  menuButton: { position: "absolute", right: 16, zIndex: 30, padding: 4 },
  drawer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: DRAWER_WIDTH,
    zIndex: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: -4, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  drawerTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  drawerItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  drawerItemRow: { alignItems: "center" },
  drawerItemText: { fontSize: 16 },
  closeButton: { position: "absolute", top: 16 },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  scrollContent: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  quoteCard: { borderRadius: 12, padding: 16, marginBottom: 8, alignSelf: "stretch" },
  quoteText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#880e4f",
  },
  card: {
    backgroundColor: "#ffebee",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  cardText: { fontSize: 16 },
  aboutText: { fontSize: 16, lineHeight: 22 },
});
