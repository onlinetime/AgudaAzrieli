// app/(app)/user/user-store.tsx

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ImageBackground,
  Pressable,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { useTranslation } from "react-i18next";

// Manual translation dictionary
const HE_EN: Record<string, string> = {
  storesList: "Stores",
  searchStore: "Search store…",
  all: "All",
  noStores: "No stores found",
  Food: "Food",
  Leisure: "Leisure",
};

const tr = (txt: string, lang: string) =>
  lang === "en" ? HE_EN[txt] ?? txt : txt;

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
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { i18n, t } = useTranslation();
  const lang = i18n.language;

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const fetchStores = useCallback(() => {
    setRefreshing(true);
    const unsub = onSnapshot(
      collection(db, "stores"),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setStores(data);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
        setRefreshing(false);
        Alert.alert(t("Error"), t("Cannot load stores"));
      }
    );
    return unsub;
  }, [t]);

  useEffect(() => {
    const unsub = fetchStores();
    return () => unsub();
  }, [fetchStores]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(stores.map((s) => s.category)));
    return ["All", ...cats];
  }, [stores]);

  const filtered = useMemo(() => {
    return stores.filter((s) => {
      const nameMatch = tr(s.name, lang).toLowerCase().includes(search.toLowerCase());
      const catMatch = category === "All" || s.category === category;
      return nameMatch && catMatch;
    });
  }, [stores, search, category, lang]);

  const renderStore = ({ item }: { item: Store }) => (
    <View style={styles.card}>
      {item.picture && (
        <ImageBackground
          source={{ uri: item.picture }}
          style={styles.image}
          imageStyle={{ opacity: 0.8 }}
        >
          <LinearGradient
            colors={["transparent", "#000A"]}
            style={styles.imageOverlay}
          />
        </ImageBackground>
      )}
      <View style={[styles.info, { backgroundColor: colors.card }]}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {tr(item.name, lang)}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.primary + "22" }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              -{item.discount}%
            </Text>
          </View>
        </View>
        <Text style={[styles.category, { color: colors.text }]}>
          {tr(item.category, lang)}
        </Text>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
          {tr(item.description, lang)}
        </Text>
        <View style={styles.row}>
          <Ionicons name="location-sharp" size={14} color={colors.text} />
          <Text style={[styles.meta, { color: colors.text }]}>
            {item.address}
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={14} color={colors.text} />
          <Text style={[styles.meta, { color: colors.text }]}>
            {item.phoneNumber}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, "#b71c1c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Ionicons name="storefront-outline" size={28} color="#fff" />
        <Text style={styles.headerTitle}>{t("storesList")}</Text>
      </LinearGradient>

      {/* Search & Filter */}
      <View style={styles.controls}>
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t("searchStore")}
            placeholderTextColor="#888"
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
          renderItem={({ item: c }) => (
            <Pressable
              onPress={() => setCategory(c)}
              style={[
                styles.filterChip,
                category === c && {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  category === c && { color: "#fff" },
                ]}
              >
                {tr(c, lang)}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Store List */}
      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={colors.primary}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          renderItem={renderStore}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchStores}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="alert-circle-outline" size={48} color="#888" />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                {t("noStores")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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

  controls: {
    padding: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "android" ? 0 : 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    height: 36,
    fontSize: 16,
  },
  filterList: {
    paddingVertical: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#EEE",
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 16, marginTop: 8 },

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
    borderColor: 'black',
    borderWidth: 1,
  },
  image: { height: 140, justifyContent: "flex-end" },
  imageOverlay: { ...StyleSheet.absoluteFillObject },

  info: { padding: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { flex: 1, fontSize: 18, fontWeight: "700" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 14, fontWeight: "600" },

  category: { marginTop: 4, fontSize: 14, fontWeight: "500" },
  description: { marginTop: 6, fontSize: 13, lineHeight: 18 },
  meta: { fontSize: 13, marginLeft: 6, marginTop: 8 },
});
