import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
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

type Store = { id: string; name: string; address: string; phoneNumber: string };

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.95, 380);
const ACCENT = "#ff1744";
const HEADER_COLORS: [string, string] = ["#ff1744", "#b71c1c"];

export default function ListStoresModern() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("he");

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "stores"),
      (snapshot) => {
        const fresh = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setStores(fresh);
        setLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "stores", id));
    setStores(prev => prev.filter(s => s.id !== id));
  };

  const renderItem = ({ item }: { item: Store }) => (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          opacity: fadeAnim,
          flexDirection: isRTL ? "row-reverse" : "row",
        },
      ]}
    >
      <View
        style={[
          styles.accentBar,
          {
            backgroundColor: ACCENT,
            left: isRTL ? undefined : 0,
            right: isRTL ? 0 : undefined,
          },
        ]}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
          {t(item.name, item.name)}
        </Text>
        <Text style={[styles.subtitle, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
          {t(item.address, item.address)}
        </Text>
        <Text style={[styles.subtitle, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
          📞 {item.phoneNumber}
        </Text>
        <View style={[styles.actions, { justifyContent: isRTL ? "flex-start" : "flex-end" }]}>
          <TouchableOpacity
            onPress={() => router.push(`/admin/edit-store/${item.id}`)}
            style={styles.actionBtn}
          >
            <Ionicons name="pencil-outline" size={16} color="#fff" />
            <Text style={styles.actionLabel}>{t("edit")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={[styles.actionBtn, { backgroundColor: "#e64545", marginHorizontal: 8 }]}
          >
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.actionLabel}>{t("delete")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <RNStatusBar translucent backgroundColor={ACCENT} barStyle="light-content" />
      <LinearGradient
        colors={HEADER_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.headerBar, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.push(".."))} style={styles.backBtn}>
          {/* Arrow always points left */}
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: isRTL ? "right" : "left", flex: 1 }]}>
          {t("listStoresTitle")}
        </Text>
        <View style={{ width: 32 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={80} color={ACCENT} />
              <Text style={[styles.emptyText, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
                {t("noStores")}
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
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  backBtn: { padding: 6 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },

  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingVertical: 16, alignItems: "center" },

  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
    }),
  },
  accentBar: {
    width: 6,
    height: "100%",
    position: "absolute",
    top: 0,
  },
  cardContent: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 4 },

  actions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ACCENT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  actionLabel: { color: "#fff", fontSize: 12, fontWeight: "600", marginLeft: 4 },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: { fontSize: 18, marginTop: 16 },
});
