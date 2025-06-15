import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
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

const db = getFirestore();

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function GiftClaimScreen() {
  const [loading, setLoading] = useState(true);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [gift, setGift] = useState<any>(null);

  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch user doc
      const userRef = doc(db, "users", user.email);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const user = { ...(userSnap.data() as any), id: userSnap.id };
        setUserDoc(user);
        setClaimCode(userSnap.data().claimCode);
      }
      // Fetch the first gift in the collection
      const giftsSnap = await getDocs(collection(db, "gifts"));
      if (!giftsSnap.empty) {
        setGift(giftsSnap.docs[0].data());
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const claimGift = async () => {
    if (!user) return;
    setLoading(true);
    const code = generateCode();
    const userRef = doc(db, "users", user.email);
    await setDoc(
      userRef,
      {
        hasClaimedGift2025: true,
        claimedGiftAt: serverTimestamp(),
        claimCode: code,
      },
      { merge: true }
    );
    // Fetch the updated user document to get all fields (not just the three)
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUserDoc(userSnap.data());
      setClaimCode(userSnap.data().claimCode);
    }
    setLoading(false);
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f8cff" />
      </View>
    );
  if (!user)
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>אנא התחבר</Text>
      </View>
    );
  if (!gift)
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>לא נמצאה מתנה זמינה</Text>
      </View>
    );

  if (userDoc?.hasClaimedGift2025) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Show user profile picture if exists */}
          {userDoc?.picture ? (
            <Image
              source={{ uri: userDoc.picture }}
              style={styles.userImage}
              resizeMode="cover"
            />
          ) : null}
          <Text style={styles.title}>כבר דרשת מתנה לשנת 2025!</Text>
          <View style={styles.card}>
            <Text style={styles.giftTitle}>שם המתנה: {gift.name}</Text>
            <Text style={styles.giftDesc}>תיאור: {gift.description}</Text>
            {gift.picture ? (
              <Image
                source={{ uri: gift.picture }}
                style={styles.giftImage}
                resizeMode="contain"
              />
            ) : null}
            <Text style={styles.codeLabel}>קוד איסוף:</Text>
            <Text style={styles.code}>{claimCode}</Text>
            <View style={styles.qrContainer}>
              <QRCode value={claimCode || ""} size={120} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  // After fetching the gift
  console.log("Gift data:", gift);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Show user profile picture if exists */}
        {userDoc?.picture ? (
          <Image
            source={{ uri: userDoc.picture }}
            style={styles.userImage}
            resizeMode="cover"
          />
        ) : null}
        <Text style={styles.title}>מתנה זמינה לשנת 2025</Text>
        <View style={styles.card}>
          <Text style={styles.giftTitle}>שם: {gift.name}</Text>
          <Text style={styles.giftDesc}>תיאור: {gift.description}</Text>
          {gift.picture ? (
            <Image
              source={{ uri: gift.picture }}
              style={styles.giftImage}
              resizeMode="contain"
            />
          ) : null}

          <TouchableOpacity style={styles.button} onPress={claimGift}>
            <Text style={styles.buttonText}>דרוש מתנה</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: "center",
    backgroundColor: "#f7f7fa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7fa",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2a2a2a",
    marginBottom: 18,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  giftTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  giftDesc: {
    fontSize: 16,
    color: "#444",
    marginBottom: 10,
    textAlign: "center",
  },
  giftImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
  },
  button: {
    backgroundColor: "#4f8cff",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 18,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  codeLabel: {
    fontSize: 16,
    color: "#444",
    marginTop: 12,
    textAlign: "center",
  },
  code: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4f8cff",
    marginBottom: 12,
    textAlign: "center",
  },
  qrContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  error: {
    color: "#d32f2f",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 12,
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 18,
    backgroundColor: "#e0e0e0",
  },
});
