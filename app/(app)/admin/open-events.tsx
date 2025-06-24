/* ─────────────────────────────────────────────────────────
   app/(app)/admin/open-events.tsx   – FULL, FIXED VERSION
   ───────────────────────────────────────────────────────── */
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { eventTitleDict } from "../../../libs/utils/eventTitleDict";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ───────── Types ───────── */
interface EventItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export default function OpenEventsScreen() {
  const { colors } = useTheme();
  const { i18n } = useTranslation();

  const [events, setEvents]   = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim              = useRef(new Animated.Value(0)).current;

  /* -------- Firestore listener -------- */
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "events"),
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<EventItem, "id">),
        }));
        setEvents(data);
        setLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      },
      (err) => { console.error("events fetch:", err); setLoading(false); }
    );
    return () => unsub();
  }, []);

  /* -------- Helpers -------- */
  const tDir = i18n.language === "en" ? "he" : "en";        // לאן מתרגמים
  const localizeTitle = (raw: string) =>
    eventTitleDict[tDir as "he" | "en"][raw.trim()] ?? raw;

  const label = (he: string, en: string) => (i18n.language === "en" ? en : he);

  /* -------- Delete flow -------- */
  const reallyDelete = async (id: string) => {
    try { await deleteDoc(doc(db, "events", id)); }
    catch (e) { console.error("delete event:", e); }
  };

  const confirmDelete = (id: string) =>
    Alert.alert(
      label("מחק אירוע", "Delete Event"),
      label("האם אתה בטוח?", "Are you sure?"),
      [
        { text: label("ביטול", "Cancel"), style: "cancel" },
        { text: label("מחק",  "Delete"),  style: "destructive", onPress: () => reallyDelete(id) },
      ],
      { cancelable: true }
    );

  /* -------- Single card -------- */
  const renderEvent = ({ item }: { item: EventItem }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.text} style={styles.eventIcon} />
          <Text style={styles.eventTitle}>{localizeTitle(item.title)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.text} />
          <Text style={styles.detailText}>{label("התחלה", "Start")}: {item.startDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.text} />
          <Text style={styles.detailText}>{label("סיום", "End")}: {item.endDate}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => confirmDelete(item.id)}
        style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
      >
        <LinearGradient colors={["#FF6B6B", "#E64545"]} style={styles.deleteGradient}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  /* -------- UI -------- */
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.background]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.headerBar}
      >
        <View style={styles.headerContent}>
          <Ionicons name="list-circle-outline" size={28} color="#fff" style={styles.headerIcon} />
          <Text style={styles.headerText}>{label("אירועים פתוחים", "Open Events")}</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(i) => i.id}
          renderItem={renderEvent}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={60} color="#BBB" />
              <Text style={styles.emptyText}>{label("אין אירועים פתוחים", "No open events")}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

/* ───────── Styles (unchanged) ───────── */
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 360);

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  headerBar: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 5 },
    }),
  },
  headerContent: { flexDirection: "row", alignItems: "center" },
  headerIcon: { marginRight: 8 },
  headerText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { alignItems: "center", paddingBottom: 24 },
  card: {
    width: CARD_WIDTH,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
  },
  cardContent: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  eventIcon: { marginRight: 8 },
  eventTitle: { fontSize: 18, fontWeight: "600", color: "#111827", flex: 1 },
  detailRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  detailText: { fontSize: 14, color: "#4B5563", marginLeft: 6 },
  deleteBtn: { marginLeft: 12, borderRadius: 20, overflow: "hidden" },
  deleteGradient: { padding: 8, alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 16, color: "#9CA3AF" },
});
