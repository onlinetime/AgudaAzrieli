import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { router } from "expo-router";

export default function FirstSignIn() {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");

  const handleCheckId = async () => {
    setMessage("");
    const trimmedId = userId.trim();
    if (!trimmedId) {
      setMessage("Please enter your ID.");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("id", "==", trimmedId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // Check if phone and email are already filled
        if (userData.phone && userData.email) {
          setMessage("User already exists.");
          return;
        }

        setMessage("User ID found! Proceeding...");
        // Navigate to complete-profile and pass userDoc.id
        router.replace({
          pathname: "./complete-profile",
          params: { userDocId: userDoc.id },
        });
      } else {
        setMessage("User ID not found. Please check your ID.");
      }
    } catch (err: any) {
      console.error("Error checking ID:", err);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>First Time Sign In</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your ID"
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
          keyboardType="default"
        />
        <View style={styles.buttonContainer}>
          <Button title="Check ID" onPress={handleCheckId} />
        </View>
        {message.length > 0 && <Text style={styles.message}>{message}</Text>}
        <View style={styles.buttonContainer}>
          <Button
            title="Back to Login"
            onPress={() => router.replace("/login")}
            color="#888"
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#888",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
  },
  buttonContainer: {
    marginBottom: 10,
  },
  message: {
    marginTop: 20,
    textAlign: "center",
    color: "red",
  },
});
