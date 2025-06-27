import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { db } from "../../firebase";
import { doc, updateDoc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { PhoneAuthProvider, signInWithCredential, createUserWithEmailAndPassword, linkWithCredential, EmailAuthProvider, updateEmail, updatePassword } from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { auth } from "../../firebase"; // your firebase auth instance

// Mock: Simulate sending a verification code
const sendFirebaseVerification = async (phone: string) => {
  // In real app, use Firebase to send SMS and return verificationId
  return "mock-verification-id";
};

// Mock: Simulate confirming the code
const confirmFirebaseCode = async (
  verificationId: string | null,
  code: string
) => {
  // In real app, use Firebase to verify the code
  if (verificationId === "mock-verification-id" && code === "123456") {
    return true;
  } else {
    throw new Error("Invalid code");
  }
};

export default function CompleteProfile() {
  const { newUserDocId } = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(""); // Add password state
  const [message, setMessage] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("+972");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const recaptchaVerifier = useRef(null);

  const handleSave = async () => {
    if (!email || !phone || !password) {
      setMessage("Please fill all fields.");
      return;
    }
    try {
      if (!auth.currentUser) {
        setMessage("You must verify your phone number first.");
        return;
      }

      const providers = auth.currentUser.providerData.map((p) => p.providerId);
      if (!providers.includes("password")) {
        // Not linked yet, so link
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(auth.currentUser, credential);
      } else {
        // Already linked, so only update password
        await updatePassword(auth.currentUser, password);
      }

      // Get user data from new_users
      const newUserRef = doc(db, "new_users", newUserDocId as string);
      const newUserSnap = await getDoc(newUserRef);
      if (!newUserSnap.exists()) {
        setMessage("User data not found.");
        return;
      }
      const newUserData = newUserSnap.data();

      // Create new user doc in users collection with Auth UID as doc ID
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        id: newUserData.id,
        email,
        phone,
        password,
        isAdmin: false,
      });

      // Optionally delete from new_users
      await deleteDoc(newUserRef);

      setMessage("Profile updated!");
    } catch (err: any) {
      console.error("Failed to update profile:", err, err.code, err.message);
      if (err.code === "auth/email-already-in-use") {
        setMessage("This email is already in use.");
      } else if (err.code === "auth/requires-recent-login") {
        setMessage("Please verify your phone again.");
      } else if (err.code === "auth/operation-not-allowed") {
        setMessage("Email/password sign-in is not enabled in Firebase Authentication.");
      } else {
        setMessage("Failed to update profile: " + (err.message || ""));
      }
    }
  };

  const sendVerification = async () => {
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const id = await phoneProvider.verifyPhoneNumber(
        phoneInput,
        recaptchaVerifier.current
      );
      setVerificationId(id);
      setMessage("Verification code sent!");
    } catch (e) {
      setMessage("Failed to send verification code.");
    }
  };

  const confirmCode = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      setPhoneVerified(true);
      setVerifiedPhone(phoneInput);
      setPhone(phoneInput);
      setMessage("Phone verified!");
    } catch (e) {
      setMessage("Invalid code.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Complete Your Profile</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fill Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneInput}
            onChangeText={(text) => {
              // Always keep +972 at the start
              if (!text.startsWith("+972")) {
                setPhoneInput("+972");
              } else {
                setPhoneInput(text);
              }
            }}
            keyboardType="phone-pad"
            maxLength={13} // +972XXXXXXXXX
          />
          <View style={{ marginTop: 8 }}>
            <Button
              title="Send Verification Code"
              onPress={sendVerification}
              disabled={phoneInput.length < 12} // basic length check
            />
          </View>
        </View>

        {verificationId && !phoneVerified && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter Code</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <Button title="Verify Code" onPress={confirmCode} />
          </View>
        )}

        {phoneVerified && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number Verified</Text>
            <Text style={{ color: "green", fontWeight: "bold" }}>
              {verifiedPhone}
            </Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Create Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Save" onPress={handleSave} disabled={!phoneVerified} />
        </View>
        {message.length > 0 && <Text style={styles.message}>{message}</Text>}

        {message === "Profile updated!" && (
          <View style={styles.buttonContainer}>
            <Button
              title="Go to Login"
              onPress={() => router.replace("/login")}
              color="#4CAF50"
            />
          </View>
        )}

        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={auth.app.options}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "center",
    color: "#333",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    color: "#555",
  },
  input: {
    height: 48,
    borderColor: "#bbb",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f7f7f7",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  message: {
    marginTop: 20,
    textAlign: "center",
    color: "red",
    fontSize: 16,
  },
});