import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StyleSheet,
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
import { useTheme } from "@react-navigation/native";

const db = getFirestore();

export default function AdminVerificationScreen() {
  const { colors } = useTheme();

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
    setAlreadyVerified(false);
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          אימות קבלת מתנה
        </Text>
        <Text style={[styles.label, { color: colors.text }]}>
          הזן קוד איסוף:
        </Text>
        <TextInput
          value={inputCode}
          onChangeText={setInputCode}
          style={[
            styles.input,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="קוד איסוף"
          placeholderTextColor={colors.border}
          onSubmitEditing={() => searchUser()}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => searchUser()}>
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
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {hasPermission ? (
              <CameraView
                style={{ flex: 1 }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
              />
            ) : (
              <Text style={{ color: colors.text, textAlign: "center", marginTop: 40 }}>
                אין הרשאת מצלמה
              </Text>
            )}
            <TouchableOpacity
              style={[styles.button, { margin: 24, backgroundColor: colors.card }]}
              onPress={() => setScannerVisible(false)}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>סגור</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

        {loading && <ActivityIndicator size="large" color={colors.primary} style={{ margin: 16 }} />}
        {error ? <Text style={[styles.error, { color: colors.notification }]}>{error}</Text> : null}
        {userDoc && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>פרטי משתמש</Text>
            <Text style={[styles.cardText, { color: colors.text }]}>מזהה: {userDoc.id}</Text>
            <Text style={[styles.cardText, { color: colors.text }]}>קוד: {userDoc.claimCode}</Text>
            {alreadyVerified || verified ? (
              <Text style={[styles.verified, { color: colors.success }]}>
                המתנה {alreadyVerified ? "כבר " : ""}סומנה כמחולקת!
              </Text>
            ) : (
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.success }]} onPress={verifyGift}>
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
  },
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
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
    fontSize: 16,
    textAlign: "center",
    marginVertical: 12,
  },
  card: {
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
    textAlign: "center",
  },
  cardText: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: "right",
  },
  verified: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
});
