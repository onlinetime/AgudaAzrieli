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
  Alert,
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
import { useTranslation } from "react-i18next";

const db = getFirestore();

export default function GiftVerify() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [inputCode, setInputCode]   = useState("");
  const [userDoc, setUserDoc]       = useState<any>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [verified, setVerified]     = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [scannerVisible, setScannerVisible]   = useState(false);
  const [hasPermission, setHasPermission]     = useState<boolean | null>(null);
  const [scanned, setScanned]       = useState(false);

  const admin = getAuth().currentUser;

  /* ── Camera permission ── */
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  /* ── Handle QR ── */
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setScannerVisible(false);
    setInputCode(data);
    searchUser(data);
  };

  /* ── Search Firestore by claimCode ── */
  const searchUser = async (codeParam?: string) => {
    const code = codeParam || inputCode.trim();
    if (!code) return;

    setLoading(true);
    setError(""); setUserDoc(null);
    setVerified(false); setAlreadyVerified(false);

    try {
      const q = query(collection(db, "users"), where("claimCode", "==", code));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError(t("giftCodeNotFound"));
        return;
      }
      const user = { ...(snap.docs[0].data() as any), id: snap.docs[0].id };
      setUserDoc(user);

      /* בדיקה אם כבר סומן */
      const vQ = query(
        collection(db, "giftVerifications"),
        where("claimCode", "==", user.claimCode)
      );
      const vSnap = await getDocs(vQ);
      if (!vSnap.empty) {
        setAlreadyVerified(true);
        setVerified(true);
      }
    } catch (e) {
      console.error(e);
      Alert.alert(t("error"), t("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  /* ── Mark as delivered ── */
  const verifyGift = async () => {
    if (!userDoc || !admin) return;
    setLoading(true);
    try {
      await setDoc(doc(collection(db, "giftVerifications")), {
        userId:     userDoc.id,
        claimCode:  userDoc.claimCode,
        verifiedAt: serverTimestamp(),
        verifiedBy: admin.uid,
      });
      setVerified(true);
    } catch (e) {
      console.error(e);
      Alert.alert(t("error"), t("somethingWentWrong"));
    }
    setLoading(false);
  };

  /* ── UI ── */
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("giftVerifyTitle")}
        </Text>

        {/* קלט קוד */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("giftEnterCodeLabel")}
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
          ]}
          placeholder={t("giftEnterCodePH")}
          placeholderTextColor={colors.border}
          value={inputCode}
          onChangeText={setInputCode}
          onSubmitEditing={() => searchUser()}
        />

        {/* כפתורים */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => searchUser()}
          >
            <Text style={styles.buttonText}>{t("search")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.qrButton]}
            onPress={() => { setScannerVisible(true); setScanned(false); }}
          >
            <Text style={styles.buttonText}>{t("scanQR")}</Text>
          </TouchableOpacity>
        </View>

        {/* סריקה */}
        <Modal visible={scannerVisible} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {hasPermission ? (
              <CameraView
                style={{ flex: 1 }}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />
            ) : (
              <Text style={{ textAlign: "center", marginTop: 40, color: colors.text }}>
                {t("noCameraPerm")}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.button, { margin: 24, backgroundColor: colors.card }]}
              onPress={() => setScannerVisible(false)}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                {t("close")}
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

        {loading && (
          <ActivityIndicator size="large" color={colors.primary} style={{ margin: 16 }} />
        )}

        {error ? (
          <Text style={[styles.error, { color: colors.notification }]}>{error}</Text>
        ) : null}

        {/* פרטי משתמש */}
        {userDoc && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t("userDetails")}
            </Text>
            <Text style={[styles.cardText, { color: colors.text }]}>
              {t("idLabel")}: {userDoc.id}
            </Text>
            <Text style={[styles.cardText, { color: colors.text }]}>
              {t("codeLabel")}: {userDoc.claimCode}
            </Text>

            {verified ? (
              <Text style={[styles.verified, { color: colors.success }]}>
                {alreadyVerified ? t("giftAlreadyMarked") : t("giftMarked")}
              </Text>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.success }]}
                onPress={verifyGift}
              >
                <Text style={styles.buttonText}>{t("markDelivered")}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ───────── Styles ───────── */
const styles = StyleSheet.create({
  safe:      { flex: 1 },
  container: { flex: 1, padding: 24 },
  title:     { fontSize: 26, fontWeight: "bold", marginBottom: 18, textAlign: "center" },
  label:     { fontSize: 16, marginVertical: 8, textAlign: "right" },
  input:     { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 18, marginBottom: 16, textAlign: "right" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  button:    { flex: 1, paddingVertical: 12, borderRadius: 10, marginHorizontal: 6, alignItems: "center" },
  qrButton:  { backgroundColor: "#34c759" },
  buttonText:{ color: "#fff", fontSize: 18, fontWeight: "bold" },
  error:     { fontSize: 16, textAlign: "center", marginVertical: 12 },
  card:      { borderRadius: 14, padding: 18, marginTop: 24, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  cardText:  { fontSize: 16, marginBottom: 6, textAlign: "right" },
  verified:  { fontSize: 18, fontWeight: "bold", marginTop: 12, textAlign: "center" },
});
