import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useTheme } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 360);

interface Feedback {
  id: string;
  content: string;
  userId: string;
  userName?: string;
  creatAt?: { toDate: () => Date };
  adminResponse?: string;
}

export default function FeedbackListModern() {
  const { colors } = useTheme();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "feedback"),
      async (snapshot) => {
        const now = new Date();
        const fresh: Feedback[] = [];
        await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data() as Omit<Feedback, "id">;
            const createdAt = data.creatAt?.toDate?.();
            if (createdAt) {
              const diffDays =
                (now.getTime() - createdAt.getTime()) /
                (1000 * 60 * 60 * 24);
              if (diffDays > 30) {
                await deleteDoc(doc(db, "feedback", docSnap.id));
                return;
              }
            }
            fresh.push({ id: docSnap.id, ...data });
          })
        );
        setFeedbacks(fresh);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      },
      (error) => {
        console.error("Error fetching feedback:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const renderItem = ({ item }: { item: Feedback }) => {
    const dateStr = item.creatAt?.toDate().toLocaleDateString() || "N/A";
    return (
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.card, opacity: fadeAnim },
        ]}
      >
        <View style={styles.cardHeader}>
          <Ionicons
            name="chatbox-ellipses-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {item.userName}
          </Text>
          <Text style={[styles.cardDate, { color: colors.border }]}>
            {dateStr}
          </Text>
        </View>
        <Text style={[styles.cardContent, { color: colors.text }]}>
          {item.content}
        </Text>
        <Text style={[styles.cardResponse, { color: colors.primary }]}>
          {item.adminResponse || "אין תגובה"}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight : 0,
        },
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBar}
      >
        <View style={styles.headerContent}>
          <Ionicons
            name="chatbubbles-outline"
            size={28}
            color="#fff"
            style={styles.headerIcon}
          />
          <Text style={styles.headerText}>משוב משתמשים</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="happy-outline"
                size={60}
                color={colors.border}
              />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                אין משוב להצגה
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    paddingVertical: 18,
    alignItems: "center",
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
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "600", flex: 1 },
  cardDate: { fontSize: 12, marginLeft: 8 },
  cardContent: { fontSize: 14, marginBottom: 12 },
  cardResponse: { fontSize: 14 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: { marginTop: 12, fontSize: 16 },
});
