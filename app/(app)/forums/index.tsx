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
} from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { router } from "expo-router";
import { db } from "../../../firebase";
import { useSettings } from "../../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";

/* צבעים קבועים */
const PRIMARY    = "#ff1744";
const WHITE      = "#ffffff";
const LIGHT_GREY = "#EEE";

/* קטגוריות */
const CATEGORIES = [
  "תוכנה",
  "תעשייה וניהול",
  "חומרים",
  "בניין",
  "פארמה",
  "מדעי המחשב",
  "חשמל ואלקטרוניקה",
  "מכונות",
  "אחר",
] as const;

/* מצבי סטטוס */
const STATUS_OPTIONS = [
  { key: "all" as const,    label: "הכל"      },
  { key: "active" as const, label: "פעיל"     },
  { key: "closed" as const, label: "לא פעיל" },
];

/* טיפוס פורום */
type Forum = {
  id: string;
  title: string;
  category: (typeof CATEGORIES)[number];
  createdAt?: Timestamp;
  createdBy: { displayName: string };
  isActive: boolean;
  lastActivity?: Timestamp;
  likes?: number;
};

export default function ForumsHome() {
  const insets = useSafeAreaInsets();
  const { darkMode } = useSettings();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  /* צבעים דינמיים */
  const SURFACE_BG     = darkMode ? "#121212" : WHITE;
  const CARD_BG        = darkMode ? "#1f1f1f" : WHITE;
  const GREY_BG        = darkMode ? "#2A2A2A" : LIGHT_GREY;
  const TEXT_PRIMARY   = darkMode ? "#E0E0E0" : "#121212";
  const TEXT_SECONDARY = darkMode ? "#C0C0C0" : "#555";

  /* state */
  const [forums, setForums]         = useState<Forum[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState<"" | (typeof CATEGORIES)[number]>("");
  const [statusFilter, setStatusFilter] = useState<"all"|"active"|"closed">("all");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  /* fetch */
  const fetchForums = () => {
    setRefreshing(true);
    const q = query(collection(db, "forums"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      snap => {
        const data = snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Forum, "id">)
        })) as Forum[];
        setForums(data);
        setLoading(false);
        setRefreshing(false);
      },
      () => {
        setLoading(false);
        setRefreshing(false);
      }
    );
    return unsub;
  };

  useEffect(() => { const unsub = fetchForums(); return () => unsub(); }, []);
  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [loading]);

  /* סינון */
  const filtered = useMemo(() => forums.filter(f => {
    if (category && f.category !== category) return false;
    if (search && !f.title.includes(search)) return false;
    if (statusFilter === "active" && !f.isActive) return false;
    if (statusFilter === "closed" && f.isActive) return false;
    return true;
  }), [forums, category, search, statusFilter]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: SURFACE_BG, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: SURFACE_BG }]} edges={["top","bottom"]}>
      {/* Header */}
      <LinearGradient
        colors={[PRIMARY, "#d32f2f"]}
        start={{ x:0, y:0 }} end={{ x:1, y:0 }}
        style={[styles.header, { paddingTop: insets.top + 6 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("forums","פורומים")}</Text>
        <Pressable onPress={() => router.push("/forums/new")} style={styles.headerBtn}>
          <Ionicons name="add-circle-outline" size={28} color={WHITE} />
        </Pressable>
      </LinearGradient>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Search */}
        <View style={[
          styles.searchBox,
          { backgroundColor: GREY_BG, flexDirection: isRTL ? "row-reverse" : "row" }
        ]}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={[styles.searchInput, { color: TEXT_PRIMARY, textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("searchTitlePlaceholder","חפש כותרת...")}
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category */}
        <FlatList
          horizontal
          data={["", ...CATEGORIES]}
          keyExtractor={c => c || "_all"}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const active = item === category;
            return (
              <Pressable
                onPress={() => setCategory(item as "" | (typeof CATEGORIES)[number])}
                style={[styles.filterChip, { backgroundColor: active ? PRIMARY : GREY_BG }]}
              >
                <Text style={[styles.filterText, { color: active ? WHITE : TEXT_PRIMARY }]} numberOfLines={1}>
                  {item === "" ? t("הכל","הכל") : t(item, item)}
                </Text>
              </Pressable>
            );
          }}
        />

        {/* Status */}
        <FlatList
          horizontal
          data={STATUS_OPTIONS}
          keyExtractor={s => s.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const active = statusFilter === item.key;
            return (
              <Pressable
                onPress={() => setStatusFilter(item.key)}
                style={[styles.filterChip, { backgroundColor: active ? PRIMARY : GREY_BG }]}
              >
                <Text style={[styles.filterText, { color: active ? WHITE : TEXT_PRIMARY }]}>
                  {t(item.label, item.label)}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* List */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={filtered}
          keyExtractor={f => f.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchForums} tintColor={PRIMARY}/>
          }
          renderItem={({ item }) => (
            <ForumRow
              forum={item}
              cardBg={CARD_BG}
              textPrimary={TEXT_PRIMARY}
              textSecondary={TEXT_SECONDARY}
              isRTL={isRTL}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: TEXT_SECONDARY }]}>
                {t("noMatchingForums","אין פורומים תואמים")}
              </Text>
            </View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}

function ForumRow({
  forum,
  cardBg,
  textPrimary,
  textSecondary,
  isRTL
}: {
  forum: Forum;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  isRTL: boolean;
}) {
  const { t } = useTranslation();
  const updated = forum.lastActivity
    ? new Date(forum.lastActivity.toMillis()).toLocaleDateString("he-IL")
    : "-";

  const [commentsCount, setComments] = useState(0);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "forums", forum.id, "comments"),
      snap => setComments(snap.size)
    );
    return unsub;
  }, [forum.id]);

  return (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg, position: 'relative' }]}
      onPress={() => router.push({ pathname: "/forums/[id]", params: { id: forum.id } })}
      android_ripple={{ color: LIGHT_GREY }}
    >
      <Text style={[styles.cardTitle, { color: textPrimary, textAlign: isRTL ? "right" : "left" }]} numberOfLines={2}>
        {t(forum.title, forum.title)}
      </Text>

      <View style={[styles.metaRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={styles.metaGroup}>
          <Ionicons name="person-circle-outline" size={16} color={textSecondary}/>
          <Text style={[styles.metaText, { color: textSecondary }]}>
            {t(forum.createdBy.displayName, forum.createdBy.displayName)}
          </Text>
        </View>
        <View style={styles.metaGroup}>
          <Ionicons name="chatbubble-outline" size={16} color={PRIMARY}/>
          <Text style={[styles.metaText, { color: textSecondary }]}>{commentsCount}</Text>
        </View>
        <View style={styles.metaGroup}>
          <Ionicons name="heart-outline" size={16} color={PRIMARY}/>
          <Text style={[styles.metaText, { color: textSecondary }]}>{forum.likes || 0}</Text>
        </View>
      </View>

      {/* Badge בפינה הנגדית */}
      <View style={[
        styles.badge,
        forum.isActive ? styles.activeBadge : styles.inactiveBadge,
        { position: 'absolute', top: 12, [isRTL ? 'left' : 'right']: 12 }
      ]}>
        <Text style={styles.badgeText}>
          {t(forum.isActive ? "Active" : "Inactive", forum.isActive ? "Active" : "Inactive")}
        </Text>
      </View>

      <View style={[styles.bottomRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text style={[styles.bottomText, { color: textSecondary }]}>
          {t(forum.category, forum.category)}
        </Text>
        <Text style={[styles.bottomText, { color: textSecondary }]}>{updated}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  center:       { flex: 1, justifyContent: "center", alignItems: "center" },

  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 12 },
  headerTitle:  { color: WHITE, fontSize: 20, fontWeight: "700" },
  headerBtn:    { padding: 4 },

  controls:     { paddingHorizontal: 12, paddingTop: 12 },
  searchBox:    { borderRadius: 24, paddingHorizontal: 12, paddingVertical: Platform.OS==="android"?0:8, alignItems: "center" },
  searchInput:  { flex: 1, marginLeft: 8, height: 40, fontSize: 16 },

  filterList:   { paddingVertical: 8 },
  filterChip:   { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, minWidth: 80, alignItems: "center" },
  filterText:   { fontSize: 14, fontWeight: "500" },

  list:         { paddingHorizontal: 12, paddingBottom: 24 },
  empty:        { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 40 },
  emptyText:    { fontSize: 16 },

  card:         { borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardTitle:    { fontSize: 18, fontWeight: "600", marginBottom: 8 },

  metaRow:      { alignItems: "center", flexWrap: "wrap", marginBottom: 8 },
  metaGroup:    { flexDirection: "row", alignItems: "center", marginRight: 16 },
  metaText:     { marginLeft: 4, fontSize: 14 },

  badge:        { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  activeBadge:  { backgroundColor: "#c8e6c9" },
  inactiveBadge:{ backgroundColor: "#ffcdd2" },
  badgeText:    { fontSize: 12, fontWeight: "500", color: "#121212" },

  bottomRow:    { justifyContent: "space-between" },
  bottomText:   { fontSize: 13 },
});
