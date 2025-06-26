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
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.95, 380);
const ACCENT = "#ff1744";
import type { ColorValue } from "react-native";
const HEADER_COLORS: [ColorValue, ColorValue] = ["#ff1744", "#b71c1c"];

export default function FeedbackListModern() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "feedback"),
      async (snapshot) => {
        const now = new Date();
        const fresh = [];
        await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const createdAt = data.creatAt?.toDate?.();
            if (createdAt) {
              const diffDays =
                (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
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
          duration: 500,
          useNativeDriver: true,
        }).start();
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const renderItem = ({ item }) => {
    const dateStr = item.creatAt?.toDate().toLocaleDateString() || "N/A";
    return (
      <Animated.View
        style={[styles.card, { opacity: fadeAnim, backgroundColor: colors.card }]}
      >
        <View style={styles.accentBar} />
        <View style={styles.cardContentWrapper}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color={ACCENT} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {item.userName || t("anonymous")}
            </Text>
            <Text style={[styles.cardDate, { color: colors.text }]}>
              {dateStr}
            </Text>
          </View>
          <Text style={[styles.cardText, { color: colors.text }]}>
            {item.content}
          </Text>
          {item.adminResponse ? (
            <View style={[styles.responseBox, { borderColor: ACCENT }]}>              
              <Text style={[styles.responseLabel, { color: ACCENT }]}>
                {t("adminResponse")}
              </Text>
              <Text style={[styles.responseText, { color: colors.text }]}>                
                {item.adminResponse}
              </Text>
            </View>
          ) : null}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar backgroundColor={ACCENT} barStyle="light-content" />
      <LinearGradient
        colors={HEADER_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.headerBar, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.push('..'))}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("usersFeedbackTitle")}</Text>
        <View style={{ width: 32 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={ACCENT} />
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
              <Ionicons name="happy-outline" size={80} color={ACCENT} />
              <Text style={[styles.emptyText, { color: colors.text }]}>                
                {t("noFeedback")}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  backBtn: { padding: 6 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingVertical: 16, alignItems: "center" },
  card: {
    width: CARD_WIDTH,
    flexDirection: "row",
    marginVertical: 12,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  accentBar: { width: 6, backgroundColor: ACCENT },
  cardContentWrapper: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: "700", flex: 1, marginLeft: 8 },
  cardDate: { fontSize: 12, color: "#666" },
  cardText: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  responseBox: { borderTopWidth: 1, paddingTop: 8 },
  responseLabel: { fontSize: 14, fontWeight: "600" },
  responseText: { fontSize: 14, marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 18, marginTop: 16 },
});
