// screens/events/index.tsx

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import * as Calendar from "expo-calendar";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useSettings } from "../../../contexts/SettingsContext";

const ACCENT = "#ff1744";
const BG_LIGHT = "#fff";

// Remove invisible characters
const clean = (s: string) =>
  s.replace(/\u200F|\u200E|\u202A|\u202B|\u202C/g, "")
   .replace(/\s+/g, " ")
   .trim();

type RawEvent = {
  id: string;
  title: string;
  address?: string;
  description?: string;
  startDate: any;
  endDate: any;
  picture?: string;
};
type Event = RawEvent & { start: Date; end: Date };

// Parse various date formats
const parseDate = (value: any): Date => {
  if (value && typeof value === "object" && "seconds" in value) {
    return new Date((value as Timestamp).seconds * 1000);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value + "T00:00:00");
  }
  if (typeof value === "string" && value.includes("/")) {
    const [d, m] = value.split("/").map(Number);
    const y = new Date().getFullYear();
    return new Date(y, m - 1, d);
  }
  return new Date(value);
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.95, 380);

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const { darkMode } = useSettings();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const SURFACE_BG = darkMode ? "#121212" : BG_LIGHT;
  const TEXT_PRIMARY = darkMode ? "#E0E0E0" : "#121212";
  const TEXT_SECONDARY = darkMode ? "#C0C0C0" : "#555";

  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), snap => {
      setRawEvents(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    });
    return () => unsub();
  }, []);

  const events = useMemo<Event[]>(() => {
    const now = new Date();
    return rawEvents
      .map(e => {
        const start = parseDate(e.startDate);
        let end = parseDate(e.endDate ?? e.startDate);
        if (e.endDate == null) {
          end = new Date(start);
          end.setHours(23, 59, 59, 999);
        }
        return { ...e, start, end };
      })
      .filter(e => e.end >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [rawEvents]);

  const tLines = (str: string) =>
    str
      .split("\n")
      .map(ln => t(i18n.exists(ln.trim()) ? ln.trim() : clean(ln.trim())))
      .join("\n");

  const addToCalendar = async (ev: Event) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("noPermission"), t("needCalendarPermission"));
        return;
      }
      const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const cal = cals.find(c => c.allowsModifications) ?? cals[0];
      await Calendar.createEventAsync(cal.id, {
        title: t(i18n.exists(ev.title) ? ev.title : clean(ev.title)),
        startDate: ev.start,
        endDate: ev.end,
        location: ev.address
          ? t(i18n.exists(ev.address!) ? ev.address! : clean(ev.address!))
          : undefined,
        notes: ev.description ? tLines(ev.description) : undefined,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      Alert.alert(t("completed"), t("eventAdded"));
    } catch {
      Alert.alert(t("error"), t("cannotAddEvent"));
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.loadingContainer, { backgroundColor: SURFACE_BG }]}>
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.flex, { backgroundColor: SURFACE_BG }]}>
      {/* HEADER */}
      <LinearGradient
        colors={[ACCENT, "#d32f2f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={[styles.headerTitle, { textAlign: isRTL ? "right" : "left" }]}>
          {t("upcomingEvents")}
        </Text>
        <View style={{ width: 28 }} />
      </LinearGradient>

      {/* LIST */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={events}
          keyExtractor={e => e.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: ACCENT, textAlign: "center" }]}>
              {t("noUpcomingEvents")}
            </Text>
          }
          renderItem={({ item }) => {
            const displayTitle = t(i18n.exists(item.title) ? item.title : clean(item.title));
            const displayAddress = item.address
              ? t(i18n.exists(item.address!) ? item.address! : clean(item.address!))
              : "";
            const displayDesc = item.description ? tLines(item.description) : "";

            return (
              <View style={[styles.card, { backgroundColor: SURFACE_BG, borderColor: ACCENT }]}>
                {item.picture && <Image source={{ uri: item.picture }} style={styles.image} />}
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: TEXT_PRIMARY, textAlign: isRTL ? "right" : "left" }]}>
                    {displayTitle}
                  </Text>
                  <Text style={[styles.cardDate, { color: TEXT_SECONDARY, textAlign: isRTL ? "right" : "left" }]}>
                    {item.start.toLocaleDateString()} – {item.end.toLocaleDateString()}
                    {displayAddress ? ` — ${displayAddress}` : ""}
                  </Text>
                  {!!displayDesc && (
                    <Text style={[styles.cardDesc, { color: TEXT_SECONDARY, textAlign: isRTL ? "right" : "left" }]}>
                      {displayDesc}
                    </Text>
                  )}
                  {/* Button below description so it never overlaps text */}
                  <Pressable style={[styles.calendarBtn, { alignSelf: "flex-start" }]} onPress={() => addToCalendar(item)}>
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={styles.calendarBtnText}>{t("addToCalendar")}</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },

  list: { padding: 16, alignItems: "center" },

  card: {
    width: CARD_WIDTH,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 2,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: { shadowColor: ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  image: { width: "100%", height: 150 },

  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  cardDate: { fontSize: 14, marginBottom: 8 },
  cardDesc: { fontSize: 13, marginBottom: 12 },

  calendarBtn: {
    marginTop: 8,
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignContent: "flex-start",
  },
  calendarBtnText: { color: "#fff", marginLeft: 6, fontSize: 14, fontWeight: "500" },

  emptyText: { fontSize: 16 },
});
