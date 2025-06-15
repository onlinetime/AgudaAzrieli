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
import { router } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface EventItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export default function OpenEventsModern() {
  const { colors } = useTheme();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "events"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<EventItem, "id">),
        }));
        setEvents(data);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      },
      (error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "events", id));
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      "מחק אירוע",
      "האם אתה בטוח שברצונך למחוק את האירוע?",
      [
        { text: "ביטול", style: "cancel" },
        { text: "מחק", style: "destructive", onPress: () => handleDelete(id) },
      ],
      { cancelable: true }
    );
  };

  const renderEvent = ({ item }: { item: EventItem }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>      
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.text} style={styles.eventIcon}/>
          <Text style={styles.eventTitle}>{item.title}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.text} />
          <Text style={styles.detailText}>Start: {item.startDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.text} />
          <Text style={styles.detailText}>End: {item.endDate}</Text>
        </View>
      </View>
      <Pressable
        onPress={() => confirmDelete(item.id)}
        style={({ pressed }) => [
          styles.deleteBtn,
          pressed && { opacity: 0.7 },
        ]}
      >
        <LinearGradient
          colors={["#FF6B6B", "#E64545"]}
          style={styles.deleteGradient}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      
      <LinearGradient
        colors={[colors.primary, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBar}
      >
        <View style={styles.headerContent}>
          <Ionicons name="list-circle-outline" size={28} color="#fff" style={styles.headerIcon}/>
          <Text style={styles.headerText}>אירועים פתוחים</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={renderEvent}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={60} color="#BBB" />
              <Text style={styles.emptyText}>אין אירועים פתוחים</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 360);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerBar: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: { elevation: 5 },
    }),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    alignItems: "center",
    paddingBottom: 24,
  },
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
  cardContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  eventIcon: {
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  detailText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 6,
  },
  deleteBtn: {
    marginLeft: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  deleteGradient: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9CA3AF",
  },
});
