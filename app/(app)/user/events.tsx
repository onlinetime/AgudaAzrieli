// app/(app)/user/events.tsx

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ImageBackground,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot } from "firebase/firestore";
import * as Calendar from "expo-calendar";
import { db } from "../../../firebase";
import { useTranslation } from "react-i18next";
import { tr } from "../../utils/translate";

type RawEvent = {
  id: string;
  title: string;
  address?: string;
  description?: string;
  startDate: string; // "DD/MM"
  endDate: string;   // "DD/MM"
  picture?: string;
};
type Event = RawEvent & { start: Date; end: Date };

const parseDate = (str: string): Date => {
  const [d, m] = str.split("/").map((n) => parseInt(n, 10));
  const now = new Date();
  return new Date(now.getFullYear(), m - 1, d);
};

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(() => {
    setRefreshing(true);
    const unsub = onSnapshot(
      collection(db, "events"),
      (snap) => {
        setRawEvents(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
        setRefreshing(false);
        Alert.alert(tr("שגיאה", lang), tr("לא ניתן לטעון אירועים", lang));
      }
    );
    return unsub;
  }, [lang]);

  useEffect(() => {
    const unsub = fetchEvents();
    return () => unsub();
  }, [fetchEvents]);

  const events = useMemo(() => {
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
        return Alert.alert(tr("אין הרשאה", lang), tr("לא ניתן להוסיף ליומן ללא הרשאה", lang));
      }
      const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const cal = cals.find((c) => c.allowsModifications) ?? cals[0];
      await Calendar.createEventAsync(cal.id, {
        title: tr(ev.title, lang),
        startDate: ev.start,
        endDate: ev.end,
        location: tr(ev.address ?? "", lang),
        notes: tr(ev.description ?? "", lang),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      Alert.alert(tr("הושלם", lang), tr("האירוע נוסף ליומן בהצלחה!", lang));
    } catch {
      Alert.alert(tr("שגיאה", lang), tr("לא ניתן להוסיף את האירוע ליומן", lang));
    }
  };

  const renderItem = ({ item }: { item: Event }) => {
    const dateLabel = item.start.toLocaleDateString(
      lang === "he" ? "he-IL" : "en-US",
      { day: "numeric", month: "short" }
    );

    return (
      <View style={styles.card}>
        {item.picture ? (
          <ImageBackground
            source={{ uri: item.picture }}
            style={styles.image}
            imageStyle={{ opacity: 0.8 }}
          >
            <LinearGradient
              colors={["transparent", "#000A"]}
              style={styles.imageOverlay}
            />
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{dateLabel}</Text>
            </View>
          </ImageBackground>
        ) : null}

        <View
          style={[
            styles.info,
            !item.picture && { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
            { backgroundColor: colors.card },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {tr(item.title, lang)}
          </Text>
          {item.address ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-sharp" size={14} color={colors.text} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {tr(item.address, lang)}
              </Text>
            </View>
          ) : null}
          {item.description ? (
            <Text style={[styles.metaText, { color: colors.text }]} numberOfLines={2}>
              {tr(item.description, lang)}
            </Text>
          ) : null}
          <Pressable
            style={[styles.button, { borderColor: colors.primary }]}
            android_ripple={{ color: colors.primary + "22" }}
            onPress={() => addToCalendar(item)}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={[styles.buttonText, { color: colors.primary }]}>
              {t("addToCalendar")}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loader,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Killer Header */}
      <LinearGradient
        colors={[colors.primary, "#b71c1c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Ionicons name="calendar-outline" size={28} color="#fff" />
        <Text style={styles.headerTitle}>{t("upcomingEvents")}</Text>
      </LinearGradient>

      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchEvents}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.text }]}>
            {t("noUpcomingEvents")}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginLeft: 8,
  },

  list: { padding: 16, paddingBottom: 32 },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    fontStyle: "italic",
  },

  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: { height: 140, justifyContent: "flex-end" },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  dateBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FFF8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: { fontSize: 14, fontWeight: "600", color: "#000" },

  info: { padding: 12 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  metaText: { fontSize: 13, marginLeft: 4 },

  button: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  buttonText: { marginLeft: 6, fontSize: 14, fontWeight: "600" },
});
