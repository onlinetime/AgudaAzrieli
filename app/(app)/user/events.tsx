// app/(drawer)/events.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import * as Calendar from "expo-calendar";

type RawEvent = {
  id: string;
  title: string;
  address?: string;
  description?: string;
  startDate: string; // e.g. "21/5"
  endDate: string; // e.g. "21/5"
  picture?: string;
};

type Event = RawEvent & {
  start: Date;
  end: Date;
};

function parseDate(str: string): Date {
  // str = "DD/MM"
  const [d, m] = str.split("/").map((n) => parseInt(n, 10));
  const now = new Date();
  // assume current year
  return new Date(now.getFullYear(), m - 1, d);
}

export default function EventsScreen() {
  const { colors } = useTheme();
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
      const evs: RawEvent[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<RawEvent, "id">),
      }));
      setRawEvents(evs);
    });
    return () => unsub();
  }, []);

  // parse, filter upcoming, sort
  const events = useMemo<Event[]>(() => {
    const now = new Date();
    return rawEvents
      .map((e) => ({
        ...e,
        start: parseDate(e.startDate),
        end: parseDate(e.endDate),
      }))
      .filter((e) => e.start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [rawEvents]);

  const addToCalendar = async (ev: Event) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("אין הרשאה", "לא ניתן להוסיף ליומן ללא הרשאה");
        return;
      }
      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      const cal = calendars.find((c) => c.allowsModifications) ?? calendars[0];
      await Calendar.createEventAsync(cal.id, {
        title: ev.title,
        startDate: ev.start,
        endDate: ev.end,
        location: ev.address,
        notes: ev.description,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      Alert.alert("הושלם", "האירוע נוסף ליומן בהצלחה!");
    } catch (err: any) {
      console.error(err);
      Alert.alert("שגיאה", "לא ניתן להוסיף את האירוע ליומן");
    }
  };

  const renderItem = ({ item }: { item: Event }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {item.picture && (
        <Image source={{ uri: item.picture }} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.meta, { color: colors.text }]}>
          {item.start.toLocaleDateString()}{" "}
          {item.address ? `— ${item.address}` : ""}
        </Text>
        {item.description && (
          <Text style={[styles.desc, { color: colors.text }]}>
            {item.description}
          </Text>
        )}
        <Pressable
          style={[styles.button, { borderColor: colors.primary }]}
          onPress={() => addToCalendar(item)}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            הוסף ליומן
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
        <Text
          style={{ textAlign: "center", marginTop: 40, color: colors.text }}
        >
          אין אירועים קרובים
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    // shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    // elevation Android
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
