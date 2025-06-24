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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import * as Calendar from "expo-calendar";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { tr } from "../../utils/translate";
import { useSettings } from "../../../contexts/SettingsContext";

const ACCENT   = "#ff1744";
const BG_LIGHT = "#fff";

/* ───────────────── helper ───────────────── */
const clean = (s: string) =>
  s.replace(/\u200F|\u200E|\u202A|\u202B|\u202C/g, "")
   .replace(/\s+/g, " ")
   .trim();

type RawEvent = {
  id: string;
  title: string;
  address?: string;
  description?: string;
  startDate: string;
  endDate: string;
  picture?: string;
};
type Event = RawEvent & { start: Date; end: Date };

const parseDate = (str: string): Date => {
  const [d, m] = str.split("/").map((n) => parseInt(n, 10));
  const now = new Date();
  return new Date(now.getFullYear(), m - 1, d);
};

export default function EventsScreen() {
  const insets       = useSafeAreaInsets();
  const { t, i18n }  = useTranslation();
  const lang         = i18n.language;
  const { darkMode } = useSettings();
  const fadeAnim     = useRef(new Animated.Value(0)).current;

  const SURFACE_BG     = darkMode ? "#121212" : BG_LIGHT;
  const TEXT_PRIMARY   = darkMode ? "#E0E0E0" : "#121212";
  const TEXT_SECONDARY = darkMode ? "#C0C0C0" : "#555";

  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
      setRawEvents(snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })));
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    });
    return () => unsub();
  }, []);

  const events = useMemo<Event[]>(() => {
    const now = new Date();
    return rawEvents
      .map((e) => ({ ...e, start: parseDate(e.startDate), end: parseDate(e.endDate) }))
      .filter((e) => e.start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [rawEvents]);

  const addToCalendar = async (ev: Event) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("noPermission"), t("needCalendarPermission"));
        return;
      }
      const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const cal  = cals.find((c) => c.allowsModifications) ?? cals[0];
      await Calendar.createEventAsync(cal.id, {
        title: t( i18n.exists(ev.title) ? ev.title : clean(ev.title) ),
        startDate: ev.start,
        endDate: ev.end,
        location: ev.address
          ? t( i18n.exists(ev.address!) ? ev.address! : clean(ev.address!) )
          : undefined,
        notes: ev.description
          ? t( i18n.exists(ev.description!) ? ev.description! : clean(ev.description!) )
          : undefined,
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
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{t("upcomingEvents")}</Text>
        <View style={{ width: 28 }} />
      </LinearGradient>

      {/* LIST */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: ACCENT }]}>{t("noUpcomingEvents")}</Text>
          }
          renderItem={({ item }) => {
            // תרגום תקין גם לכותרות סטטיות
            const titleKey = item.title;
            const displayTitle = t(
              i18n.exists(titleKey) ? titleKey : clean(item.title)
            );
            const displayAddress = item.address
              ? t(
                  i18n.exists(item.address!) ? item.address! : clean(item.address!)
                )
              : "";
            const displayDesc = item.description
              ? t(
                  i18n.exists(item.description!) ? item.description! : clean(item.description!)
                )
              : "";

            return (
              <View style={[styles.card, { backgroundColor: SURFACE_BG, borderColor: ACCENT }]}>
                {item.picture && <Image source={{ uri: item.picture }} style={styles.image} />}
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: TEXT_PRIMARY }]}>{displayTitle}</Text>
                  <Text style={[styles.cardDate, { color: TEXT_SECONDARY }]}>
                    {item.start.toLocaleDateString()}
                    {displayAddress ? ` — ${displayAddress}` : ""}
                  </Text>
                  {!!displayDesc && (
                    <Text style={[styles.cardDesc, { color: TEXT_SECONDARY }]}>{displayDesc}</Text>
                  )}
                  <Pressable style={styles.cardButton} onPress={() => addToCalendar(item)}>
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={styles.cardButtonText}>{t("addToCalendar")}</Text>
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

  list: { padding: 16 },

  card: {
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 2,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  image: { width: "100%", height: 150 },

  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  cardDate:  { fontSize: 14, marginBottom: 8 },
  cardDesc:  { fontSize: 13, marginBottom: 12 },

  cardButton: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: ACCENT,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  cardButtonText: { color: "#fff", marginLeft: 6, fontSize: 14, fontWeight: "500" },

  emptyText: { textAlign: "center", marginTop: 40, fontSize: 16 },
});
