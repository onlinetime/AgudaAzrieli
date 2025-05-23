import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchAndCleanFeedbacks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "feedback"));
        const now = new Date();
        const freshFeedbacks: any[] = [];

        // Delete feedbacks older than 30 days
        await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const createdAt = data.creatAt?.toDate?.();
            if (createdAt) {
              const diffDays =
                (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
              if (diffDays > 30) {
                // Delete old feedback
                await deleteDoc(doc(db, "feedback", docSnap.id));
              } else {
                freshFeedbacks.push({ id: docSnap.id, ...data });
              }
            } else {
              // If no date, keep it (or you can choose to delete)
              freshFeedbacks.push({ id: docSnap.id, ...data });
            }
          })
        );

        setFeedbacks(freshFeedbacks);
      } catch (error) {
        Alert.alert("Error", "Failed to load feedbacks.");
      }
    };

    fetchAndCleanFeedbacks();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.feedbackItem}>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.meta}>User: {item.userId}</Text>
      <Text style={styles.meta}>
        Date: {item.creatAt?.toDate?.().toLocaleDateString?.() || "N/A"}
      </Text>
      <Text style={styles.response}>
        Admin Response: {item.adminResponse || "No response"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Feedbacks</Text>
      {feedbacks.length === 0 ? (
        <Text style={styles.empty}>No feedbacks available.</Text>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  feedbackItem: {
    backgroundColor: "#f4f6fa",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  content: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  meta: {
    fontSize: 13,
    color: "#555",
  },
  response: {
    fontSize: 14,
    color: "#3949AB",
    marginTop: 8,
  },
  empty: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 40,
  },
});
