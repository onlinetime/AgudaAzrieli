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

export default function ListStores() {
  const [stores, setStores] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const snap = await getDocs(collection(db, "stores"));
        setStores(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Error fetching stores:", e);
        Alert.alert("Error", "לא ניתן לטעון את החנויות");
      }
    };
    fetchStores();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      "מחק חנות",
      "האם אתה בטוח שברצונך למחוק את החנות?",
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "מחק",
          style: "destructive",
          onPress: async () => {
            await deleteDoc(doc(db, "stores", id));
            setStores((prev) => prev?.filter((s) => s.id !== id) || null);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeDetails}>📍 {item.address}</Text>
        <Text style={styles.storeDetails}>📞 {item.phoneNumber}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push(`/admin/edit-store/${item.id}` as any)}
          style={({ pressed }) => [
            styles.buttonContainer,
            pressed && styles.pressed,
          ]}
        >
          <LinearGradient
            colors={["#5A9DFE", "#3C7DE5"]}
            style={styles.gradient}
          >
            <Ionicons name="pencil-outline" size={16} color="#fff" />
            <Text style={styles.buttonText}>Edit</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => handleDelete(item.id)}
          style={({ pressed }) => [
            styles.buttonContainer,
            pressed && styles.pressed,
            { marginLeft: 8 },
          ]}
        >
          <LinearGradient
            colors={["#FF6B6B", "#E64545"]}
            style={styles.gradient}
          >
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.buttonText}>Delete</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );

  if (stores === null) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3C7DE5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>List of Stores</Text>
      {stores.length ? (
        <FlatList
          data={stores}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.noStoresText}>לא נמצאו חנויות</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1F2937",
    textAlign: "center",
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  info: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  storeDetails: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    borderRadius: 24,
    overflow: "hidden",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  pressed: {
    opacity: 0.8,
  },
  noStoresText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
