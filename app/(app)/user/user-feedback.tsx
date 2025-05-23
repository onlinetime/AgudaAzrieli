import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase"; // adjust path if needed
import { query, where, orderBy, limit, getDocs } from "firebase/firestore";

const userId = "USER_ID_HERE"; // Replace with actual user id from auth context

export default function UserFeedback() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Please enter your feedback.");
      return;
    }
    setLoading(true);

    try {
      // Check for last feedback
      const feedbackQuery = query(
        collection(db, "feedback"),
        where("userId", "==", userId),
        orderBy("creatAt", "desc"),
        limit(1)
      );
      const feedbackSnapshot = await getDocs(feedbackQuery);
      if (!feedbackSnapshot.empty) {
        const lastFeedback = feedbackSnapshot.docs[0].data();
        const lastCreatedAt = lastFeedback.creatAt?.toDate?.();
        if (lastCreatedAt) {
          const now = new Date();
          const diffDays =
            (now.getTime() - lastCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays < 7) {
            setLoading(false);
            Alert.alert("You can only send feedback once a week.");
            return;
          }
        }
      }

      await addDoc(collection(db, "feedback"), {
        content,
        userId,
        adminResponse: "",
        creatAt: serverTimestamp(),
      });
      setContent("");
      Alert.alert("Thank you!", "Your feedback has been submitted.");
    } catch (error) {
      Alert.alert("Error", "Could not send more then one feedback per week.");
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>We Value Your Feedback</Text>
        <Text style={styles.subtitle}>
          Let us know your thoughts or suggestions.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Type your feedback here..."
          value={content}
          onChangeText={setContent}
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: "#aaa" }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Send Feedback"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#3949AB",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#B0BEC5",
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#3949AB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
