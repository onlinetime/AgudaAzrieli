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

const db = getFirestore();
const ACCENT      = "#4f8cff"; // kept as original
const LIGHT_BG    = "#f7f7fa";
const CARD_LIGHT  = "#fff";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function GiftClaimScreen() {
  const insets                   = useSafeAreaInsets();
  const { darkMode }             = useSettings();
  const SURFACE_BG               = darkMode ? "#121212" : LIGHT_BG;
  const CARD_BG                  = darkMode ? "#1f1f1f" : CARD_LIGHT;
  const TEXT_PRIMARY             = darkMode ? "#E0E0E0" : "#2a2a2a";
  const TEXT_SECONDARY           = darkMode ? "#C0C0C0" : "#444";
  const ERROR_COLOR              = darkMode ? "#ff6b6b" : "#d32f2f";

  const [loading, setLoading]    = useState(true);
  const [userDoc, setUserDoc]    = useState<any>(null);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [gift, setGift]          = useState<any>(null);

  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const userRef = doc(db, "users", user.email!);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserDoc({ ...data, id: userSnap.id });
        setClaimCode(data.claimCode);
      }
      const giftsSnap = await getDocs(collection(db, "gifts"));
      if (!giftsSnap.empty) setGift(giftsSnap.docs[0].data());
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const claimGift = async () => {
    if (!user) return;
    setLoading(true);
    const code = generateCode();
    const userRef = doc(db, "users", user.email!);
    await setDoc(userRef, {
      hasClaimedGift2025: true,
      claimedGiftAt: serverTimestamp(),
      claimCode: code,
    }, { merge: true });

    const freshSnap = await getDoc(userRef);
    if (freshSnap.exists()) {
      const d = freshSnap.data();
      setUserDoc(d);
      setClaimCode(d.claimCode);
    }
    setLoading(false);
  };

  /* ––––––––––––––––––– states */
  if (loading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: SURFACE_BG, paddingTop: insets.top, paddingBottom: insets.bottom }]}>        
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: SURFACE_BG, paddingTop: insets.top, paddingBottom: insets.bottom }]}>        
        <Text style={[styles.error, { color: ERROR_COLOR }]}>אנא התחבר</Text>
      </SafeAreaView>
    );
  }

  if (!gift) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: SURFACE_BG, paddingTop: insets.top, paddingBottom: insets.bottom }]}>        
        <Text style={[styles.error, { color: ERROR_COLOR }]}>לא נמצאה מתנה זמינה</Text>
      </SafeAreaView>
    );
  }

  /* ––––––––––––––––––– UI helpers */
  const GiftCard = () => (
    <View style={[styles.card, { backgroundColor: CARD_BG }]}>      
      <Text style={[styles.giftTitle, { color: TEXT_PRIMARY }]}>שם המתנה: {gift.name}</Text>
      <Text style={[styles.giftDesc, { color: TEXT_SECONDARY }]}>תיאור: {gift.description}</Text>
      {!!gift.picture && <Image source={{ uri: gift.picture }} style={styles.giftImage} resizeMode="contain" />}
    </View>
  );

  /* ––––––––– claimed */
  if (userDoc?.hasClaimedGift2025) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: SURFACE_BG }]} edges={["top", "bottom"]}>        
        <View style={[styles.container, { backgroundColor: SURFACE_BG, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>          
          {!!userDoc?.picture && <Image source={{ uri: userDoc.picture }} style={styles.userImage} resizeMode="cover" />}
          <Text style={[styles.title, { color: TEXT_PRIMARY }]}>כבר דרשת מתנה לשנת 2025!</Text>
          <GiftCard />
          <Text style={[styles.codeLabel, { color: TEXT_SECONDARY }]}>קוד איסוף:</Text>
          <Text style={[styles.code, { color: ACCENT }]}>{claimCode}</Text>
          <View style={styles.qrContainer}><QRCode value={claimCode || ""} size={120} /></View>
        </View>
      </SafeAreaView>
    );
  }

  /* ––––––––– available */
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: SURFACE_BG }]} edges={["top", "bottom"]}>      
      <View style={[styles.container, { backgroundColor: SURFACE_BG, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>        
        {!!userDoc?.picture && <Image source={{ uri: userDoc.picture }} style={styles.userImage} resizeMode="cover" />}
        <Text style={[styles.title, { color: TEXT_PRIMARY }]}>מתנה זמינה לשנת 2025</Text>
        <GiftCard />
        <TouchableOpacity style={[styles.button, { backgroundColor: ACCENT }]} onPress={claimGift}>
          <Text style={styles.buttonText}>דרוש מתנה</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24, alignItems: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 18, textAlign: "center" },
  card: {
    borderRadius: 16, padding: 20, width: "100%", alignItems: "center", shadowColor: ACCENT,
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
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
