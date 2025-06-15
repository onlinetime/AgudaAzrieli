import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Platform,
  StatusBar,
  View,
  ActivityIndicator,
  TextInput,
  Animated,
  Dimensions,
  Text,
  ScrollView,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { router } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  const { colors } = useTheme();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "stores"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Store, "id">),
        }));
        setStores(data);
        // extract unique categories + All
        const uniqueCats = Array.from(new Set(data.map((s) => s.category)));
        setCategories(["All", ...uniqueCats]);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      },
      (error) => {
        console.error("Error fetching stores:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // filter by search + category
  const filtered = stores.filter((store) => {
    const matchesSearch = store.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || store.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderStore = ({ item }: { item: Store }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <Pressable
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
      >
        {item.picture ? (
          <Image source={{ uri: item.picture }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#BBB" />
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{item.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.category}</Text>
            </View>
          </View>
          <Text
            style={styles.description}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.description}
          </Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-sharp" size={14} color={colors.text} />
            <Text style={styles.infoText}>{item.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={14} color={colors.text} />
            <Text style={styles.infoText}>{item.phoneNumber}</Text>
          </View>
        </View>
      </Pressable>
      <View style={styles.footerRow}>
        <LinearGradient
          colors={["#FDE047", "#FACC15"]}
          style={styles.discountBadge}
        >
          <Text style={styles.discountText}>-{item.discount}%</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );

  console.log(categories);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons
            name="cart-outline"
            size={28}
            color="#fff"
            style={styles.headerIcon}
          />
          <Text style={styles.headerText}>רשימת חנויות</Text>
        </View>
      </LinearGradient>

      {/* search input */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card }]}
          placeholder="חפש חנות..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {/* dynamic category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {categories.map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.filterChip,
              selectedCategory === cat && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === cat
                  ? { color: "#fff" }
                  : { color: "#111827" },
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderStore}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={60} color="#BBB" />
              <Text style={styles.emptyText}>לא נמצאו חנויות</Text>
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
  header: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: { flexDirection: "row", alignItems: "center" },
  headerIcon: { marginRight: 8 },
  headerText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
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
  filterContainer: {
    maxHeight: 80,
    marginBottom: 40, // was 24, increase space below filter chips
    marginTop: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 24, // was 16
    alignItems: "center",
    paddingRight: 32, // add extra space at the end
  },
  filterChip: {
    paddingHorizontal: 24, // more space for all chips
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40, // ensures height is consistent
    borderWidth: 1,
    borderColor: "#E5E7EB", // light border for unselected
    backgroundColor: "#fff", // white background for unselected
  },
  filterText: {
    fontSize: 16, // increased from 14
    fontWeight: "500",
  },
  list: { alignItems: "center", paddingBottom: 24 },
  loader: { marginTop: 40 },
  card: {
    width: CARD_WIDTH,
    marginVertical: 4, // was 8, reduce vertical margin between cards
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardPressable: { borderRadius: 16, overflow: "hidden" },
  cardPressed: { opacity: 0.8 },
  image: { width: "100%", height: 160 },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  content: { padding: 22 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "600", color: "#111827", flex: 1 },
  badge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "500", color: "#374151" },
  description: { fontSize: 14, color: "#6B7280", marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoText: { fontSize: 13, color: "#4B5563", marginLeft: 6, flex: 1 },
  footerRow: {
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#F3F4F6",
    alignItems: "flex-start",
  },
  discountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: { color: "#1F2937", fontWeight: "600" },
  emptyContainer: { marginTop: 60, alignItems: "center" },
  emptyText: { marginTop: 12, fontSize: 16, color: "#9CA3AF" },
});
