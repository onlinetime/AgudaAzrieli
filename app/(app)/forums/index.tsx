// app/(app)/forums/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { router } from "expo-router";
import { db } from "../../../firebase";
import { useSettings } from "../../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";

/* ---------- constants ---------- */
const PRIMARY    = "#ff1744";
const WHITE      = "#ffffff";
const LIGHT_GREY = "#EEE";

const CATEGORIES = [
  "תוכנה","תעשייה וניהול","חומרים","בניין","פארמה",
  "מדעי המחשב","חשמל ואלקטרוניקה","מכונות","אחר",
] as const;

const STATUS_OPTIONS = [
  { key: "all",    label: "הכל"     },
  { key: "active", label: "פעיל"    },
  { key: "closed", label: "לא פעיל"},
] as const;

/* ---------- types ---------- */
export type Forum = {
  id: string;
  title: string;
  category: (typeof CATEGORIES)[number];
  createdAt?: Timestamp;
  createdBy: { displayName: string };
  isActive: boolean;
  isApproved: boolean;
  /* isPinned בוטל */
  lastActivity?: Timestamp;
  likes?: number;
};

/* ================================================================= */
export default function ForumsHome() {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { darkMode, isAdmin } = useSettings();
  const isRTL = i18n.dir() === "rtl";

  /* palette */
  const SURFACE_BG     = darkMode ? "#121212" : WHITE;
  const CARD_BG        = darkMode ? "#1f1f1f" : WHITE;
  const GREY_BG        = darkMode ? "#2A2A2A" : LIGHT_GREY;
  const TEXT_PRIMARY   = darkMode ? "#E0E0E0" : "#121212";
  const TEXT_SECONDARY = darkMode ? "#C0C0C0" : "#555";

  /* state */
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"" | (typeof CATEGORIES)[number]>("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "closed">("all");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  /* ---------- Firestore fetch ---------- */
  const fetchForums = () => {
    setRefreshing(true);
    const q = query(
      collection(db, "forums"),
      where("isApproved", "==", true),
      orderBy("createdAt", "desc")      // ← ‎(בלי ‎isPinned)
    );
    return onSnapshot(
      q,
      snap => {
        const arr = snap.docs.map(
          d => ({ id: d.id, ...(d.data() as Omit<Forum, "id">) })
        ) as Forum[];
        setForums(arr);
        setLoading(false);
        setRefreshing(false);
      },
      () => {
        setLoading(false);
        setRefreshing(false);
      }
    );
  };
  useEffect(() => { const u = fetchForums(); return () => u(); }, []);
  useEffect(() => {
    if (!loading) Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [loading]);

  /* ---------- filter ---------- */
  const filtered = useMemo(
    () =>
      forums.filter(f => {
        if (category && f.category !== category) return false;
        if (search && !f.title.toLowerCase().includes(search.toLowerCase()))
          return false;
        if (statusFilter === "active" && !f.isActive) return false;
        if (statusFilter === "closed" && f.isActive) return false;
        return true;
      }),
    [forums, category, search, statusFilter]
  );

  /* ---------- delete (admin-only) ---------- */
  const deleteForum = async (forumId: string) => {
    Alert.alert(
      t("deleteForum", "מחק פורום"),
      t("areYouSure", "בטוח/ה? פעולה זו בלתי הפיכה"),
      [
        { text: t("cancel", "בטל"), style: "cancel" },
        {
          text: t("delete", "מחק"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "forums", forumId));
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ]
    );
  };

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.center,
          { backgroundColor: SURFACE_BG, paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color={PRIMARY} />
      </SafeAreaView>
    );
  }

  /* ---------- render ---------- */
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: SURFACE_BG }]}
      edges={["top", "bottom"]}
    >
      {/* header */}
      <LinearGradient
        colors={[PRIMARY, "#d32f2f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 6 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("forums", "פורומים")}</Text>
        <Pressable
          onPress={() => router.push("/forums/new")}
          style={styles.headerBtn}
        >
          <Ionicons name="add-circle-outline" size={28} color={WHITE} />
        </Pressable>
      </LinearGradient>

      {/* כאן נשארו אזורי החיפוש והפילטרים ללא שינוי – קיצרנו להצגה */}

      {/* list */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={filtered}
          keyExtractor={f => f.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchForums}
              tintColor={PRIMARY}
            />
          }
          renderItem={({ item }) => (
            <ForumRow
              forum={item}
              cardBg={CARD_BG}
              textPrimary={TEXT_PRIMARY}
              textSecondary={TEXT_SECONDARY}
              isRTL={isRTL}
              isAdmin={isAdmin}
              onDelete={deleteForum}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: TEXT_SECONDARY }]}>
                {t("noMatchingForums", "אין פורומים תואמים")}
              </Text>
            </View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------- ForumRow (בלי Pin) ---------- */
function ForumRow({
  forum,
  cardBg,
  textPrimary,
  textSecondary,
  isRTL,
  isAdmin,
  onDelete,
}: {
  forum: Forum;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  isRTL: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
  const updated = forum.lastActivity
    ? new Date(forum.lastActivity.toMillis()).toLocaleDateString("he-IL")
    : "-";

  const [commentsCount, setComments] = useState(0);
  useEffect(() => {
    const u = onSnapshot(
      collection(db, "forums", forum.id, "comments"),
      s => setComments(s.size)
    );
    return u;
  }, [forum.id]);

  return (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg }]}
      onPress={() =>
        router.push({ pathname: "/forums/[id]", params: { id: forum.id } })
      }
      android_ripple={{ color: LIGHT_GREY }}
    >
      {/* delete – admin only */}
      {isAdmin && (
        <Pressable
          onPress={() => onDelete(forum.id)}
          style={[
            styles.deleteBtn,
            { [isRTL ? "left" : "right"]: 10 },
          ]}
          hitSlop={8}
        >
          <Ionicons name="trash" size={18} color="#fff" />
        </Pressable>
      )}

      {/* title */}
      <Text
        style={[
          styles.cardTitle,
          {
            color: textPrimary,
            textAlign: isRTL ? "right" : "left",
          },
        ]}
        numberOfLines={2}
      >
        {t(forum.title, forum.title)}
      </Text>

      {/* meta */}
      <View
        style={[
          styles.metaRow,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <View style={styles.metaGroup}>
          <Ionicons
            name="person-circle-outline"
            size={16}
            color={textSecondary}
          />
          <Text style={[styles.metaText, { color: textSecondary }]}>
            {t(forum.createdBy.displayName, forum.createdBy.displayName)}
          </Text>
        </View>
        <View style={styles.metaGroup}>
          <Ionicons name="chatbubble-outline" size={16} color={PRIMARY} />
          <Text style={[styles.metaText, { color: textSecondary }]}>
            {commentsCount}
          </Text>
        </View>
        <View style={styles.metaGroup}>
          <Ionicons name="heart-outline" size={16} color={PRIMARY} />
          <Text style={[styles.metaText, { color: textSecondary }]}>
            {forum.likes || 0}
          </Text>
        </View>
      </View>

      {/* badge (active / inactive) */}
      <View
        style={[
          styles.badge,
          forum.isActive ? styles.activeBadge : styles.inactiveBadge,
          { position: "absolute", top: 12, [isRTL ? "left" : "right"]: 12 },
        ]}
      >
        <Text style={styles.badgeText}>
          {t(forum.isActive ? "Active" : "Inactive")}
        </Text>
      </View>

      {/* bottom */}
      <View
        style={[
          styles.bottomRow,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <Text style={[styles.bottomText, { color: textSecondary }]}>
          {t(forum.category, forum.category)}
        </Text>
        <Text style={[styles.bottomText, { color: textSecondary }]}>
          {updated}
        </Text>
      </View>
    </Pressable>
  );
}

/* ---------- styles (unchanged + deleteBtn) ---------- */
const styles = StyleSheet.create({
  /* … הקיים … */
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  headerTitle: { color: WHITE, fontSize: 20, fontWeight: "700" },
  headerBtn: { padding: 4 },
  list: { paddingHorizontal: 12, paddingBottom: 24 },

  /* כפתור מחיקה */
  deleteBtn: {
    position: "absolute",
    top: 10,
    backgroundColor: "#e53935",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    zIndex: 10,
  },

  /* … שאר הסגנונות כפי שהיו … */
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  metaRow: { alignItems: "center", flexWrap: "wrap", marginBottom: 8 },
  metaGroup: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  metaText: { marginLeft: 4, fontSize: 14 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  activeBadge: { backgroundColor: "#c8e6c9" },
  inactiveBadge: { backgroundColor: "#ffcdd2" },
  badgeText: { fontSize: 12, fontWeight: "500", color: "#121212" },
  bottomRow: { justifyContent: "space-between" },
  bottomText: { fontSize: 13 },
  filterList: { paddingVertical: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    minWidth: 80,
    alignItems: "center",
  },
  filterText: { fontSize: 14, fontWeight: "500" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 40 },
  emptyText: { fontSize: 16 },
  controls: { paddingHorizontal: 12, paddingTop: 12 },
  searchBox: {
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "android" ? 0 : 8,
    alignItems: "center",
  },
  searchInput: { flex: 1, marginLeft: 8, height: 40, fontSize: 16 },
});

/* ------------------------------------------------------------------ */
