// Login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { getFirebaseAuth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { router } from "expo-router";
import { db, auth } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setMessage("");
    const e = email.trim();
    const p = password;
    if (!e || !p) {
      setMessage("Enter email and password");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, e, p);
      const user = userCredential.user;

      // Fetch Firestore user doc by Auth UID (doc ID)
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        setMessage("User profile not found in Firestore.");
        return;
      }
      const userData = userSnap.data();
      setMessage("Login successful!");

      if (userData.isAdmin === true) {
        router.replace("/admin/admin-home");
      } else {
        router.replace("/user/user-home");
      }
    } catch (err: any) {
      setMessage(`Login failed: ${err.code || ""} ${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Sign In (First Time)"
          onPress={() => router.replace("./first-signin")}
          color="#4CAF50"
        />
      </View>

      {message.length > 0 && <Text style={styles.message}>{message}</Text>}
    </View>
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