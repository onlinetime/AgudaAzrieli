// app/(app)/admin/list-stores.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";              // ← NEW

export default function ListStores() {
  const { colors } = useTheme();
  const { t }  = useTranslation();                          // ← NEW
  const [stores, setStores] = useState<any[] | null>(null);

  /* fetch once */
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const snap = await getDocs(collection(db, "stores"));
        setStores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        Alert.alert(t("error"), t("cannotLoadStores"));
      }
    };
    fetchStores();
  }, []);

  /* delete */
  const handleDelete = (id: string) =>
    Alert.alert(t("deleteStoreTitle"), t("areYouSureDeleteStore"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "stores", id));
          setStores(prev => prev?.filter(s => s.id !== id) || null);
        },
      },
    ]);

  /* render card */
  const renderItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.border },
      ]}
    >
      <View style={styles.info}>
        <Text style={[styles.storeName, { color: colors.text }]}>
          {t(item.name, item.name)}                        {/* ← translate name */}
        </Text>
        <Text style={[styles.storeDetails, { color: colors.text }]}>
          {`📍 ${t(item.address, item.address)}`}          {/* ← translate address */}
        </Text>
        <Text style={[styles.storeDetails, { color: colors.text }]}>
          {`📞 ${item.phoneNumber}`}
        </Text>
      </View>

      {/* actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push(`/admin/edit-store/${item.id}` as any)}
          style={({ pressed }) => [styles.btnWrapper, pressed && styles.pressed]}
          android_ripple={{ color: colors.primary + "33" }}
        >
          <LinearGradient colors={[colors.primary, colors.primary + "CC"]} style={styles.gradient}>
            <Ionicons name="pencil-outline" size={16} color="#fff" />
            <Text style={styles.buttonText}>{t("edit")}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => handleDelete(item.id)}
          style={({ pressed }) => [styles.btnWrapper, { marginLeft: 8 }, pressed && styles.pressed]}
          android_ripple={{ color: "#ff444433" }}
        >
          <LinearGradient colors={["#ff6b6b", "#e64545"]} style={styles.gradient}>
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.buttonText}>{t("delete")}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );

  /* loading */
  if (stores === null)
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("listStoresTitle")}</Text>

      {stores.length ? (
        <FlatList
          data={stores}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.center}>
          <Text style={[styles.noStoresText, { color: colors.text }]}>{t("noOpenEvents")}</Text>
        </View>
      )}
    </View>
  );
}

/* styles unchanged … */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  list: { paddingBottom: 16 },
  card: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  info: { flex: 1 },
  storeName: { fontSize: 18, fontWeight: "600" },
  storeDetails: { fontSize: 14, marginTop: 2 },
  actions: { flexDirection: "row", alignItems: "center" },
  btnWrapper: { borderRadius: 24, overflow: "hidden" },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600", marginLeft: 6 },
  pressed: { opacity: 0.85 },
  noStoresText: { fontSize: 16 },
});
