import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();

export default function AdminVerificationScreen() {
  const [inputCode, setInputCode] = useState("");
  const [userDoc, setUserDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  const admin = getAuth().currentUser;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setScannerVisible(false);
    setInputCode(data);
    searchUser(data);
  };

  const searchUser = async (code?: string) => {
    setLoading(true);
    setError("");
    setUserDoc(null);
    setVerified(false);
    setAlreadyVerified(false); // reset
    const q = query(
      collection(db, "users"),
      where("claimCode", "==", code || inputCode)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      setError("לא נמצא קוד כזה");
      setLoading(false);
      return;
    }
    const user = { ...(snap.docs[0].data() as any), id: snap.docs[0].id };
    setUserDoc(user);

    // Check if already verified
    const verifyQ = query(
      collection(db, "giftVerifications"),
      where("claimCode", "==", user.claimCode)
    );
    const verifySnap = await getDocs(verifyQ);
    if (!verifySnap.empty) {
      setAlreadyVerified(true);
      setVerified(true);
    }
    setLoading(false);
  };

  const verifyGift = async () => {
    if (!userDoc || !admin) return;
    setLoading(true);
    await setDoc(doc(collection(db, "giftVerifications")), {
      userId: userDoc.id,
      claimCode: userDoc.claimCode,
      verifiedAt: serverTimestamp(),
      verifiedBy: admin.uid,
    });
    setVerified(true);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>אימות קבלת מתנה</Text>
        <Text style={styles.label}>הזן קוד איסוף:</Text>
        <TextInput
          value={inputCode}
          onChangeText={setInputCode}
          style={styles.input}
          placeholder="קוד איסוף"
          placeholderTextColor="#aaa"
          onSubmitEditing={() => searchUser()}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={() => searchUser()}>
            <Text style={styles.buttonText}>חפש</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.qrButton]}
            onPress={() => {
              setScannerVisible(true);
              setScanned(false);
            }}
          >
            <Text style={styles.buttonText}>סרוק QR</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={scannerVisible} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
            {hasPermission ? (
              <CameraView
                style={{ flex: 1 }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
              />
            ) : (
              <Text
                style={{ color: "#fff", textAlign: "center", marginTop: 40 }}
              >
                אין הרשאת מצלמה
              </Text>
            )}
            <TouchableOpacity
              style={[styles.button, { margin: 24, backgroundColor: "#fff" }]}
              onPress={() => setScannerVisible(false)}
            >
              <Text style={[styles.buttonText, { color: "#333" }]}>סגור</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

        {loading && <ActivityIndicator style={{ margin: 16 }} />}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {userDoc && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>פרטי משתמש</Text>
            <Text style={styles.cardText}>מזהה: {userDoc.id}</Text>
            <Text style={styles.cardText}>
              שם: {userDoc.firstName} {userDoc.lastName}
            </Text>
            <Text style={styles.cardText}>קוד: {userDoc.claimCode}</Text>
            {alreadyVerified ? (
              <Text style={styles.verified}>המתנה כבר סומנה כמחולקת!</Text>
            ) : verified ? (
              <Text style={styles.verified}>המתנה סומנה כמחולקת!</Text>
            ) : (
              <TouchableOpacity style={styles.button} onPress={verifyGift}>
                <Text style={styles.buttonText}>סמן כמחולקת</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f7fa",
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: "stretch",
    backgroundColor: "#f7f7fa",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2a2a2a",
    marginBottom: 18,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
    marginTop: 8,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    backgroundColor: "#fff",
    marginBottom: 16,
    textAlign: "right",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#4f8cff",
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 6,
    alignItems: "center",
  },
  qrButton: {
    backgroundColor: "#34c759",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "#d32f2f",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginTop: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
    textAlign: "center",
  },
  cardText: {
    fontSize: 16,
    color: "#444",
    marginBottom: 6,
    textAlign: "right",
  },
  verified: {
    color: "#388e3c",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
});
