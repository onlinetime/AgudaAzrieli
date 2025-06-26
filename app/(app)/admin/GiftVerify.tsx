import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView } from "expo-camera";
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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const db = getFirestore();
const ACCENT = "#ff1744";
const HEADER_GRAD: [string, string] = [ACCENT, "#d32f2f"];

export default function GiftVerify() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, dark } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("he");

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
      const { status } = await CameraView.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setScannerVisible(false);
    setInputCode(data);
    searchUser(data);
  };

  const searchUser = async (codeParam?: string) => {
    const code = (codeParam ?? inputCode).trim();
    if (!code) return;
    setLoading(true);
    setError(""); setUserDoc(null);
    setVerified(false); setAlreadyVerified(false);

    try {
      // מוצא את המשתמש
      const q = query(collection(db, "users"), where("claimCode", "==", code));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError(t("giftCodeNotFound"));
        return;
      }
      const docSnap = snap.docs[0];
      const user = { ...(docSnap.data() as any), id: docSnap.id };
      setUserDoc(user);

      // בודק אם כבר סומן
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top","bottom","left","right"]}
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      {/* HEADER */}
      <LinearGradient
        colors={HEADER_GRAD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.header,
          { paddingTop: insets.top + 8, flexDirection: "row" /* תמיד row */ }
        ]}
      >
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.push("..")}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { textAlign: isRTL ? "right" : "left", flex: 1 }
          ]}
        >
          {t("giftVerifyTitle")}
        </Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* קוד ידני */}
        <Text
          style={[
            styles.label,
            { color: colors.text, textAlign: isRTL ? "right" : "left" }
          ]}
        >
          {t("giftEnterCodeLabel")}
        </Text>
        <View
          style={[
            styles.inputWrapper,
            { flexDirection: isRTL ? "row-reverse" : "row" }
          ]}
        >
          <Ionicons
            name="code-outline"
            size={20}
            color={ACCENT}
            style={[styles.inputIcon, isRTL && { marginLeft: 8, marginRight: 0 }]}
          />
          <TextInput
            style={[
              styles.input,
              {
                borderColor: ACCENT,
                color: colors.text,
                textAlign: isRTL ? "right" : "left"
              }
            ]}
            placeholder={t("giftEnterCodePH")}
            placeholderTextColor="#aaa"
            value={inputCode}
            onChangeText={setInputCode}
            onSubmitEditing={() => searchUser()}
          />
        </View>

        {/* כפתורי חיפוש וסריקה */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: ACCENT }]}
            onPress={() => searchUser()}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>{t("search")}</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.qrButton]}
            onPress={() => { setScannerVisible(true); setScanned(false); }}
          >
            <Ionicons name="qr-code-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>{t("scanQR")}</Text>
          </TouchableOpacity>
        </View>

        {/* מודל סורק */}
        <Modal visible={scannerVisible} animationType="slide">
          <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            {hasPermission
              ? (
                <CameraView
                  style={styles.camera}
                  onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                />
              ) : (
                <Text
                  style={[
                    styles.noPerm,
                    { color: colors.text, textAlign: isRTL ? "right" : "center" }
                  ]}
                >
                  {t("noCameraPerm")}
                </Text>
              )
            }
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.card }]}
              onPress={() => setScannerVisible(false)}
            >
              <Ionicons name="close-circle" size={24} color={colors.text} />
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

        {/* שגיאה */}
        {error ? (
          <Text
            style={[
              styles.error,
              { color: colors.notification, textAlign: isRTL ? "right" : "center" }
            ]}
          >
            {error}
          </Text>
        ) : null}

        {/* פרטי משתמש וסימון */}
        {userDoc && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text
              style={[
                styles.cardTitle,
                { color: colors.text, textAlign: "center" }
              ]}
            >
              {t("userDetails")}
            </Text>
            <Text
              style={[
                styles.cardText,
                { color: colors.text, textAlign: isRTL ? "right" : "left" }
              ]}
            >
              ID: {userDoc.id}
            </Text>
            <Text
              style={[
                styles.cardText,
                { color: colors.text, textAlign: isRTL ? "right" : "left" }
              ]}
            >
              {t("giftCode")}: {userDoc.claimCode}
            </Text>

            {verified
              ? (
                <Text
                  style={[
                    styles.verified,
                    { color: ACCENT, textAlign: "center" }
                  ]}
                >
                  {alreadyVerified
                    ? t("giftAlreadyMarked")
                    : t("giftMarked")}
                </Text>
              ) : (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: ACCENT, alignSelf: "center" }]}
                  onPress={verifyGift}
                >
                  <Text style={styles.buttonText}>{t("markDelivered")}</Text>
                </TouchableOpacity>
              )
            }
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },

  container: { flex: 1, padding: 16 },

  label: { fontSize: 16, marginBottom: 8, fontWeight: "600" },

  inputWrapper: {
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 44, fontSize: 16, paddingHorizontal: 8 },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  qrButton: { backgroundColor: ACCENT },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 6 },

  camera: { flex: 1 },
  noPerm: { textAlign: "center", marginTop: 40, fontSize: 16 },

  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 8,
  },

  error: { fontSize: 16, marginVertical: 12 },

  card: {
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  cardText: { fontSize: 16, marginBottom: 6 },

  verified: { fontSize: 18, fontWeight: "700", marginTop: 12 },

});
