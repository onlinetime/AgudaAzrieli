import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import QRCode from "react-native-qrcode-svg";
import { useSettings } from "../../../contexts/SettingsContext";

import { useTranslation } from "react-i18next";
import { clean } from "../../utils/clean";   // ← utils/clean.ts

const db = getFirestore();
const ACCENT   = "#4f8cff";
const LIGHT_BG = "#f7f7fa";
const CARD_BG_LIGHT = "#fff";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function GiftClaimScreen() {
  /* ─ Hooks & theme ─ */
  const insets       = useSafeAreaInsets();
  const { darkMode } = useSettings();
  const { t, i18n }  = useTranslation();
  const lang         = i18n.language;

  const SURFACE_BG   = darkMode ? "#121212" : LIGHT_BG;
  const CARD_BG      = darkMode ? "#1f1f1f" : CARD_BG_LIGHT;
  const TEXT_PRIMARY = darkMode ? "#E0E0E0" : "#2a2a2a";
  const TEXT_SECOND  = darkMode ? "#C0C0C0" : "#444";
  const ERROR_COLOR  = darkMode ? "#ff6b6b" : "#d32f2f";

  /* ─ State ─ */
  const [loading, setLoading]     = useState(true);
  const [userDoc, setUserDoc]     = useState<any>(null);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [gift, setGift]           = useState<any>(null);

  const user = getAuth().currentUser;

  /* ─ Fetch user + gift ─ */
  useEffect(() => {
    if (!user) return;
    (async () => {
      const userRef = doc(db, "users", user.uid); // <-- use user.uid
      const uSnap   = await getDoc(userRef);
      if (uSnap.exists()) {
        const data = uSnap.data();
        setUserDoc({ ...data, id: uSnap.id });
        setClaimCode(data.claimCode);
      }
      const gSnap = await getDocs(collection(db, "gifts"));
      if (!gSnap.empty) setGift(gSnap.docs[0].data());
      setLoading(false);
    })();
  }, [user]);

  /* ─ Claim action ─ */
  const claimGift = async () => {
    if (!user) return;
    setLoading(true);
    const code = generateCode();
    const userRef = doc(db, "users", user.uid); // <-- use user.uid
    await setDoc(
      userRef,
      { hasClaimedGift2025: true, claimedGiftAt: serverTimestamp(), claimCode: code },
      { merge: true },
    );
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const d = snap.data();
      setUserDoc(d);
      setClaimCode(d.claimCode);
    }
    setLoading(false);
  };

  /* ─ Loading ─ */
  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: SURFACE_BG, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  /* ─ Guards ─ */
  if (!user) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: SURFACE_BG, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={[styles.error, { color: ERROR_COLOR }]}>{t("pleaseLogin", "אנא התחבר")}</Text>
      </SafeAreaView>
    );
  }

  if (!gift) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: SURFACE_BG, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={[styles.error, { color: ERROR_COLOR }]}>{t("noGiftAvailable", "לא נמצאה מתנה זמינה")}</Text>
      </SafeAreaView>
    );
  }

  /* ─ Gift Card component ─ */
  const GiftCard = () => (
    <View style={[styles.card, { backgroundColor: CARD_BG }]}>
      <Text style={[styles.giftTitle, { color: TEXT_PRIMARY }]}>
        {t("giftNameLabel", "Gift name")}: {t(clean(gift.name), { lng: lang })}
      </Text>
      <Text style={[styles.giftDesc, { color: TEXT_SECOND }]}>
        {t("giftDescLabel", "Description")}: {t(clean(gift.description), { lng: lang })}
      </Text>
      {!!gift.picture && (
        <Image source={{ uri: gift.picture }} style={styles.giftImage} resizeMode="contain" />
      )}
    </View>
  );

  /* ─ Already claimed ─ */
  if (userDoc?.hasClaimedGift2025) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: SURFACE_BG }]} edges={["top", "bottom"]}>
        <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
          {!!userDoc?.picture && <Image source={{ uri: userDoc.picture }} style={styles.userImage} resizeMode="cover" />}
          <Text style={[styles.title, { color: TEXT_PRIMARY }]}>
            {t("alreadyClaimedGift2025")}
          </Text>

          <GiftCard />

          <Text style={[styles.codeLabel, { color: TEXT_SECOND }]}>
            {t("claimCodeLabel")}
          </Text>
          <Text style={[styles.code, { color: ACCENT }]}>{claimCode}</Text>
          <View style={styles.qrContainer}>
            <QRCode value={claimCode || ""} size={120} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ─ Available ─ */
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: SURFACE_BG }]} edges={["top", "bottom"]}>
      <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
        {!!userDoc?.picture && <Image source={{ uri: userDoc.picture }} style={styles.userImage} resizeMode="cover" />}

        <Text style={[styles.title, { color: TEXT_PRIMARY }]}>
          {t("giftAvailable2025", "מתנה זמינה לשנת 2025")}
        </Text>

        <GiftCard />

        <TouchableOpacity style={[styles.button, { backgroundColor: ACCENT }]} onPress={claimGift}>
          <Text style={styles.buttonText}>{t("claimGiftButton", "דרוש מתנה")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ––––––– Styles ––––––– */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24, alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 18, textAlign: "center" },
  card: {
    borderRadius: 16,
    padding: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  giftTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  giftDesc: { fontSize: 16, marginBottom: 10, textAlign: "center" },
  giftImage: { width: 120, height: 120, borderRadius: 12, marginBottom: 16, backgroundColor: "#f0f0f0" },
  button: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10, marginTop: 18, alignItems: "center", width: "100%" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  codeLabel: { fontSize: 16, marginTop: 12, textAlign: "center" },
  code: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  qrContainer: { marginTop: 8, alignItems: "center" },
  error: { fontSize: 18, textAlign: "center", marginVertical: 12 },
  userImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 18, backgroundColor: "#e0e0e0" },
});