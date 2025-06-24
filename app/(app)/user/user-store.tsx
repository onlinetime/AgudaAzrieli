import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ImageBackground,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useSettings } from "../../../contexts/SettingsContext";

// *––  PALETTE (unchanged for light mode) ––*
const ACCENT   = "#ff1744";   //  red accent stays identical in both modes
const BG_LIGHT = "#fff";       //  main surface light
const BG_GREY  = "#EEE";       //  chips / search box light

interface Store {
  id: string;
  name: string;
  address: string;
  category: string;
  description: string;
  discount: string;
  phoneNumber: string;
  picture?: string;
}

export default function UserStoreList() {
  /* -------------------------------------------------- hooks */
  const insets               = useSafeAreaInsets();
  const { t, i18n }          = useTranslation();
  const { darkMode }         = useSettings();
  const fadeAnim             = useRef(new Animated.Value(0)).current;

  /* -------------------------------------------------- colours */
  const SURFACE_BG           = darkMode ? "#121212" : BG_LIGHT;
  const GREY_BG              = darkMode ? "#2A2A2A" : BG_GREY;
  const TEXT_PRIMARY         = darkMode ? "#E0E0E0" : "#121212";
  const TEXT_SECONDARY       = darkMode ? "#C0C0C0" : "#555";
  const CHIP_TEXT_DEFAULT    = darkMode ? "#E0E0E0" : "#333";
  const PLACEHOLDER          = "#888";

  /* -------------------------------------------------- state */
  const lang                 = i18n.language;
  const [stores, setStores]  = useState<Store[]>([]);
  const [loading, setLoading]            = useState(true);
  const [refreshing, setRefreshing]      = useState(false);
  const [search, setSearch]              = useState("");
  const [category, setCategory]          = useState<string>(t("All"));

  /* -------------------------------------------------- data fetch */
  const fetchStores = useCallback(() => {
    setRefreshing(true);
    const unsub = onSnapshot(
      collection(db, "stores"),
      (snap) => {
        setStores(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
        setRefreshing(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      },
      () => {
        setLoading(false);
        setRefreshing(false);
      }
    );
    return unsub;
  }, [fadeAnim]);

  useEffect(() => {
    const unsub = fetchStores();
    return () => unsub();
  }, [fetchStores]);

  /* -------------------------------------------------- derived */
  const categories = useMemo(() => {
    const cats = Array.from(new Set(stores.map((s) => s.category)));
    return [t("All"), ...cats];
  }, [stores, t]);

  const filtered = useMemo(() => {
    return stores.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(search.toLowerCase());
      const catMatch  = category === t("All") || s.category === category;
      return nameMatch && catMatch;
    });
  }, [stores, search, category]);

  /* -------------------------------------------------- loading */
  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.loadingContainer, { backgroundColor: SURFACE_BG }]}>        
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  /* -------------------------------------------------- render */
  return (
    <SafeAreaView edges={["top"]} style={[styles.flex, { backgroundColor: SURFACE_BG }]}>      
      {/* HEADER */}
      <LinearGradient
        colors={[ACCENT, "#d32f2f"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{t("storesList")}</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* SEARCH & FILTER */}
      <View style={styles.controls}>
        <View style={[styles.searchBox, { backgroundColor: GREY_BG }]}>          
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={[styles.searchInput, { color: TEXT_PRIMARY }]}
            placeholder={t("searchStore")}
            placeholderTextColor={PLACEHOLDER}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(c) => c}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = category === item;
            return (
              <Pressable
                onPress={() => setCategory(item)}
                style={[styles.chip, { backgroundColor: isActive ? ACCENT : GREY_BG }]}
              >
                <Text
                  style={[styles.chipText, { color: isActive ? BG_LIGHT : CHIP_TEXT_DEFAULT }]}
                  numberOfLines={1}
                >
                  {t(item, item)}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* LIST */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStores} tintColor={ACCENT} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#888" />
              <Text style={[styles.emptyText, { color: TEXT_SECONDARY }]}>{t("noStores")}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: SURFACE_BG, borderColor: ACCENT }]}>              
              {item.picture && (
                <ImageBackground source={{ uri: item.picture }} style={styles.image} imageStyle={{ opacity: 0.7 }}>
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.4)"]} style={styles.imageOverlay} />
                </ImageBackground>
              )}

              <View style={styles.cardContent}>
                <View style={styles.row}>
                  <Text style={[styles.storeName, { color: TEXT_PRIMARY }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={[styles.discountBadge, { backgroundColor: ACCENT + "22" }]}>
                    <Text style={[styles.discountText, { color: ACCENT }]}>-{item.discount}%</Text>
                  </View>
                </View>

                <Text style={[styles.categoryLabel, { color: TEXT_SECONDARY }]}>
                  {t(item.category, item.category)}
                </Text>
                {!!item.description && (
                  <Text style={[styles.description, { color: TEXT_SECONDARY }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                <View style={styles.row}>
                  <Ionicons name="location-sharp" size={14} color={TEXT_SECONDARY} />
                  <Text style={[styles.meta, { color: TEXT_SECONDARY }]}>{item.address}</Text>
                </View>
                <View style={styles.row}>
                  <Ionicons name="call-outline" size={14} color={TEXT_SECONDARY} />
                  <Text style={[styles.meta, { color: TEXT_SECONDARY }]}>{item.phoneNumber}</Text>
                </View>
              </View>
            </View>
          )}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

/* ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingBottom: 12,
  },
  headerBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },

  controls: { paddingHorizontal: 16, paddingTop: 12 },
  searchBox: {
    flexDirection: "row", alignItems: "center", borderRadius: 24,
    paddingHorizontal: 12, paddingVertical: Platform.OS === "android" ? 0 : 8,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, height: 36 },

  filterList: { paddingVertical: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8,
    minWidth: 60, alignItems: "center",
  },
  chipText: { fontSize: 14, fontWeight: "500" },

  list: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 16, marginTop: 8 },

  card: {
    marginBottom: 20, borderRadius: 16, borderWidth: 2, overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  image: { width: "100%", height: 150 },
  imageOverlay: { ...StyleSheet.absoluteFillObject },

  cardContent: { padding: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  storeName: { flex: 1, fontSize: 18, fontWeight: "700" },

  discountBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  discountText: { fontSize: 14, fontWeight: "600" },

  categoryLabel: { marginTop: 6, fontSize: 14, fontWeight: "500" },
  description: { marginTop: 6, fontSize: 13 },
  meta: { fontSize: 13, marginLeft: 6 },
});
