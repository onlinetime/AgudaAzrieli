// app/(drawer)/user-store.tsx
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Platform,
  StatusBar,
  View as RNView,
} from "react-native";
import { View, Text } from "../../../components/Themed";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";

// טיפוס של חנות
type Store = {
  id: string;
  name: string;
  address: string;
  category: string;
  description: string;
  discount: string;
  phoneNumber: string;
  picture?: string;
};

export default function UserStoreList() {
  const { colors } = useTheme();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "stores"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Store, "id">),
        }));
        setStores(data);
      },
      (error) => {
        console.error("Error fetching stores:", error);
      }
    );
    return () => unsub();
  }, []);

  const renderItem = ({ item }: { item: Store }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.border : colors.card,
        },
      ]}
      android_ripple={{ color: colors.border }}
    >
      {item.picture ? (
        <Image
          source={{ uri: item.picture }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: "black" }]}>{item.name}</Text>
        <Text style={[styles.cardSubtitle, { color: "black" }]}>
          {item.address}
        </Text>
        <Text style={[styles.cardSmall, { color: "black" }]}>
          קטגוריה: {item.category}
        </Text>
        <Text style={[styles.cardSmall, { color: "black" }]}>
          הנחה: {item.discount}
        </Text>
        <Text style={[styles.cardSmall, { color: "black" }]}>
          כתובת: {item.address}
        </Text>
        <Text style={[styles.cardSmall, { color: "black" }]}>
          טלפון: {item.phoneNumber}
        </Text>
        <Text style={[styles.cardSmall, { color: "black" }]}>
          תיאור: {item.description}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* כותרת ראשית */}
      <LinearGradient
        colors={[colors.primary, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerText}>רשימת חנויות</Text>
      </LinearGradient>

      {/* רשימת חנויות */}
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const CARD_WIDTH =
  Platform.OS === "web"
    ? 600
    : Math.round((Platform.OS === "android" ? 360 : 360) * 0.9);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },
  list: {
    alignItems: "center",
    paddingBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
    }),
  },
  cardImage: {
    width: "100%",
    height: 140,
  },
  cardContent: {
    padding: 12,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  cardSmall: {
    fontSize: 13,
    marginTop: 6,
  },
});
