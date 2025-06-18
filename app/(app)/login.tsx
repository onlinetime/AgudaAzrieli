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
    console.debug("🚀 handleLogin called");
    console.debug("Email:", email);
    console.debug("Password (length):", password.length);

    //let auth;
    // try {
    //   console.debug("Importing signInWithEmailAndPassword...");
    //   // const mod = await import("firebase/auth");
    //   //console.debug("Module keys:", Object.keys(mod));
    //   //auth = getFirebaseAuth();
    //   console.debug("Auth instance:", auth);
    //   console.debug("Auth.app:", auth.app);
    // } catch (e: any) {
    //   console.error("❌ Error during getFirebaseAuth():", e, e.code, e.message);
    //   setMessage(`Debug: auth init failed: ${e.message}`);
    //   return;
    // }

    // trim and validate
    const e = email.trim();
    const p = password;
    if (!e || !p) {
      console.warn("⚠️ Missing email or password");
      setMessage("Enter email and password");
      return;
    }

    try {
      console.debug("Calling signInWithEmailAndPassword...");
      const userCredential = await signInWithEmailAndPassword(auth, e, p);
      console.log("✅ signInWithEmailAndPassword returned:", userCredential);

      const user = userCredential.user;
      console.debug("User object:", user);

      console.debug("Looking up user in Firestore:", user.email);
      const userDocRef = doc(db, "users", user.email!);
      const userSnap = await getDoc(userDocRef);
      console.debug("Firestore snapshot exists?", userSnap.exists());

      if (!userSnap.exists()) {
        setMessage("User profile not found in Firestore.");
        return;
      }

      const userData = userSnap.data();
      console.debug("Fetched userData:", userData);
      setMessage("Login successful!");

      if (userData.isAdmin === true) {
        console.debug("User is admin, routing to /admin/admin-home");
        router.replace("/admin/admin-home");
      } else {
        console.debug("User is regular, routing to /user-home");
        router.replace("/user/user-home")
      }
    } catch (err: any) {
      console.error("❌ signIn error:", err, err.code, err.message);
      Alert.alert(
        "Login failed",
        `Error code: ${err.code}\nMessage: ${err.message}`
      );
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