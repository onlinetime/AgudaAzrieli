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

export default function OpenEvents() {
  const [events, setEvents] = useState<any[]>([]);

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
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
              await deleteDoc(doc(db, "events", id));
              alert("Event deleted successfully!");
              setEvents((prevEvents) =>
                prevEvents.filter((event) => event.id !== id)
              );
            } catch (error) {
              console.error("Error deleting event: ", error);
              alert("Failed to delete event. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Open Events</Text>

      {events.length > 0 ? (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventItem}>
              <View>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDetails}>
                  Start Date: {item.startDate}
                </Text>
                <Text style={styles.eventDetails}>
                  End Date: {item.endDate}
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
        <Text style={styles.noEventsText}>No events available.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  eventItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  eventDetails: {
    fontSize: 14,
    color: "#555",
  },
  noEventsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
});
