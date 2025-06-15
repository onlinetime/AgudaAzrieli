import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import * as Calendar from "expo-calendar";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type RawEvent = {
  id: string;
  title: string;
  address?: string;
  description?: string;
  startDate: string;
  endDate: string;
  picture?: string;
};

type Event = RawEvent & {
  start: Date;
  end: Date;
};

function parseDate(str: string): Date {
  const [d, m] = str.split("/").map((n) => parseInt(n, 10));
  const now = new Date();
  return new Date(now.getFullYear(), m - 1, d);
}

export default function EventsScreen() {
  const { colors } = useTheme();
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "events"),
      (snap) => {
        const evs: RawEvent[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<RawEvent, "id">),
        }));
        setRawEvents(evs);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const events = useMemo<Event[]>(() => {
    const now = new Date();
    return rawEvents
      .map((e) => ({
        ...e,
        start: parseDate(e.startDate),
        end: parseDate(e.endDate),
      }))
      .filter((e) => isNaN(e.start.getTime()) || e.start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [rawEvents]);

  // apply search filter
  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCalendar = async (ev: Event) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("אין הרשאה", "לא ניתן להוסיף ליומן ללא הרשאה");
        return;
      }
      const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const cal = cals.find((c) => c.allowsModifications) ?? cals[0];
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
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      {item.picture && (
        <Image source={{ uri: item.picture }} style={styles.image} />
      )}
      <View style={[styles.content, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.meta, { color: colors.text }]}>
          📅 {item.start.toLocaleDateString()}{" "}
          {item.address ? `- ${item.address}` : ""}
        </Text>
        {item.description && (
          <Text style={[styles.desc, { color: colors.text }]}>
            {item.description}
          </Text>
        )}
        <Pressable
          onPress={() => addToCalendar(item)}
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.7 },
            { borderColor: colors.primary },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            הוסף ליומן
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* search bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card }]}
          placeholder="חפש אירוע..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text style={[styles.emptyText, { color: colors.text }]}>
            אין אירועים קרובים
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 2,
  },
  searchIcon: { paddingHorizontal: 12 },
  searchInput: { flex: 1, height: 40, fontSize: 16, paddingRight: 12 },
  list: { padding: 16 },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
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
  emptyText: { textAlign: "center", marginTop: 40, fontSize: 16 },
});
