import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { router } from "expo-router";

export default function ListStores() {
  const [stores, setStores] = useState<any[]>([]);

  // Fetch stores from Firestore
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "stores"));
        const storesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStores(storesList);
      } catch (error) {
        console.error("Error fetching stores: ", error);
      }
    };

    fetchStores();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Store",
      "Are you sure you want to delete this store?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "stores", id));
              alert("Store deleted successfully!");
              setStores((prevStores) =>
                prevStores.filter((store) => store.id !== id)
              );
            } catch (error) {
              console.error("Error deleting store: ", error);
              alert("Failed to delete store. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>List of Stores</Text>

      {stores.length > 0 ? (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.storeItem}>
              <View>
                <Text style={styles.storeName}>{item.name}</Text>
                <Text style={styles.storeDetails}>Address: {item.address}</Text>
                <Text style={styles.storeDetails}>
                  Phone: {item.phoneNumber}
                </Text>
              </View>
              <Button
                title="Delete"
                onPress={() => handleDelete(item.id)}
                color="red"
              />
            </View>
          )}
        />
      ) : (
        <Text style={styles.noStoresText}>No stores available.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  storeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "600",
  },
  storeDetails: {
    fontSize: 14,
    color: "#555",
  },
  noStoresText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
});
