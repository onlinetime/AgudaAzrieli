// app/login.tsx
import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
} from "react-native";
import { View, Text } from "../../components/Themed"; 
import { useTheme } from "@react-navigation/native";  // ← ייבוא

import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { router } from "expo-router";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

import {Image} from "react-native"; // ← ייבוא


export default function Login() {
  const logo = require("../../assets/images/AgudaImg.png"); // לוגו האגודה
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { colors } = useTheme();                  // ← קבלת צבעים

  const handleResetPassword = async () => {
    if (!email) {
      setMessage("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent!");
    } catch (error: any) {
      setMessage(`Failed to send reset email: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    try {
      const uc = await signInWithEmailAndPassword(auth, email, password);


      const snap = await getDoc(doc(db, "users", uc.user.email!));
      if (snap.exists()) {
        const isAdmin = snap.data().isAdmin;
        router.replace(isAdmin ? "./admin-home" : "./user-home");
        setMessage("Login successful!");
      } else {
        setMessage("User profile not found.");
      }
    } catch (error: any) {
      setMessage(`Login failed: ${error.message}`);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background }, // ← רקע דינמי
      ]}
    >
      <Image source={logo} style={{width: 125, height: 125, marginBottom: 45, alignSelf: "center" }}resizeMode="contain"/> {/* לוגו האגודה */}
      <Text style={[styles.title, { color: colors.text }]}>Login</Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,      // card=לבן ב־light, כהה ב־dark
            color: colors.text,               // טקסט דינמי
            borderColor: colors.border,       // קו גבול אפור/בהיר
          },
        ]}
        placeholder="Email"
        placeholderTextColor={colors.text}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        placeholder="Password"
        placeholderTextColor={colors.text}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.border,    // כפתור אפור
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        onPress={handleLogin}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>
          Login
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        onPress={handleResetPassword}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>
          Reset Password
        </Text>
      </Pressable>

      {!!message && (
        <Text style={[styles.message, { color: colors.notification }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    // לא מגדירים כאן backgroundColor – הוא בא מ־useTheme
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "500",
  },
  message: {
    marginTop: 20,
    textAlign: "center",
  },
});
