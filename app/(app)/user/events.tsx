// app/(app)/user/events.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import * as Calendar from "expo-calendar";
import { useTranslation } from "react-i18next";
import { tr } from "../../utils/translate";          // 🆕 ➊

/* -------- טיפוסי נתונים -------- */
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

/* -------- עזר: המרה ל-Date -------- */
const parseDate = (str: string): Date => {
  const [d, m] = str.split("/").map((n) => parseInt(n, 10));
  const now = new Date();
  return new Date(now.getFullYear(), m - 1, d);
};

export default function EventsScreen() {
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);

  /* --- מאזין לפיירסטור --- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
      setRawEvents(
        snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
      );
    });
    return () => unsub();
  }, []);

  /* --- סינון ומיון אירועים עתידיים --- */
  const events = useMemo<Event[]>(() => {
    const now = new Date();
    return rawEvents
      .map((e) => ({ ...e, start: parseDate(e.startDate), end: parseDate(e.endDate) }))
      .filter((e) => e.start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [rawEvents]);

  /* --- הוספה ליומן --- */
  const addToCalendar = async (ev: Event) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(tr("אין הרשאה", lang), tr("לא ניתן להוסיף ליומן ללא הרשאה", lang));
        return;
      }
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const cal = calendars.find((c) => c.allowsModifications) ?? calendars[0];
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

  /* --- כרטיס אירוע --- */
  const renderItem = ({ item }: { item: Event }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {item.picture && <Image source={{ uri: item.picture }} style={styles.image} />}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {tr(item.title, lang)}
        </Text>
        <Text style={[styles.meta, { color: colors.text }]}>
          {item.start.toLocaleDateString()}{" "}
          {item.address ? `— ${tr(item.address, lang)}` : ""}
        </Text>
        {item.description && (
          <Text style={[styles.desc, { color: colors.text }]}>
            {tr(item.description, lang)}
          </Text>
        )}
        <Pressable
          style={[styles.button, { borderColor: colors.primary }]}
          onPress={() => addToCalendar(item)}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            {tr("addToCalendar", lang)}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <FlatList
      data={events}
      keyExtractor={(e) => e.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.text }}>
          {tr("noUpcomingEvents", lang)}
        </Text>
      }
    />
  );
}

/* -------- עיצוב -------- */
const styles = StyleSheet.create({
  list: { padding: 16 },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: { width: "100%", height: 140 },
  content: { padding: 12 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  meta: { fontSize: 14, marginBottom: 8 },
  desc: { fontSize: 13, marginBottom: 12 },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  buttonText: { fontSize: 14, fontWeight: "500" },
});
