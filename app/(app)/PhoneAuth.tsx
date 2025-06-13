// PhoneAuth.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  getAuth,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { app } from "../../firebase"; // Make sure this exports your config object

export default function PhoneAuth({
  onVerified,
}: {
  onVerified: (phone: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code" | "success">("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );

  const recaptchaVerifier = useRef<any>(null);
  const auth = getAuth();

  // 1. Send verification code
  const sendCode = async () => {
    setLoading(true);
    setMessage("");
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        recaptchaVerifier.current
      );
      setConfirmation(confirmationResult);
      setStep("code");
      setMessage("Verification code sent!");
    } catch (err: any) {
      setMessage(err.message || "Failed to send code.");
    }
    setLoading(false);
  };

  // 2. Verify code
  const verifyCode = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (!confirmation) {
        setMessage("No confirmation available.");
        setLoading(false);
        return;
      }
      await confirmation.confirm(code);
      setStep("success");
      setMessage("Phone verified and signed in!");
      onVerified(phone); // <-- Call this when verified
    } catch (err: any) {
      setMessage(err.message || "Invalid or expired code.");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
      />

      {step === "phone" && (
        <>
          <Text style={styles.label}>Enter Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+1234567890"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Button
            title="Send Code"
            onPress={sendCode}
            disabled={loading || !phone}
          />
        </>
      )}

      {step === "code" && (
        <>
          <Text style={styles.label}>Enter Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          <Button
            title="Verify Code"
            onPress={verifyCode}
            disabled={loading || !code}
          />
        </>
      )}

      {step === "success" && (
        <Text style={styles.success}>Phone number verified!</Text>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {message.length > 0 && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  label: { fontSize: 16, fontWeight: "500", marginBottom: 6, color: "#555" },
  input: {
    height: 48,
    borderColor: "#bbb",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f7f7f7",
    fontSize: 16,
    marginBottom: 12,
  },
  message: { marginTop: 20, textAlign: "center", color: "red", fontSize: 16 },
  success: {
    marginTop: 20,
    textAlign: "center",
    color: "green",
    fontSize: 18,
    fontWeight: "bold",
  },
});
