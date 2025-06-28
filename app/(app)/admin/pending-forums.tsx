import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { query, collection, where, orderBy, onSnapshot, deleteDoc, doc, Timestamp, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useSettings } from "../../../contexts/SettingsContext";

const PRIMARY = "#ff1744";
const LIGHT_GREY = "#EEE";

type Forum = {
  id: string;
  title: string;
  category: string;
  createdBy: { displayName: string };
  createdAt?: Timestamp;
  lastActivity?: Timestamp;
  approvalRequestedAt?: Timestamp;
};

export default function PendingForumsScreen() {
  const insets = useSafeAreaInsets();
  const { darkMode } = useSettings();

  const SURFACE = darkMode ? "#121212" : "#fff";
  const CARD = darkMode ? "#1f1f1f" : "#fff";
  const TXT1 = darkMode ? "#E0E0E0" : "#121212";
  const TXT2 = darkMode ? "#C0C0C0" : "#555";

  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "forums"),
      where("isApproved", "==", false),
      orderBy("approvalRequestedAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      async snap => {
        const now = Date.now();
        const fresh: Forum[] = [];
        for (const docSnap of snap.docs) {
          const data = docSnap.data() as any;
          const reqTs = data.approvalRequestedAt?.toMillis?.();
          // מחיקה אוטומטית אחרי שבוע
          if (reqTs && now - reqTs > 1 * 60 * 1000) {
            try {
              await deleteDoc(doc(db, "forums", docSnap.id));
            } catch (e: any) {
              console.error("Error deleting expired forum:", e);
            }
          } else {
            fresh.push({ id: docSnap.id, ...data });
          }
        }
        setForums(fresh);
        setLoading(false);
      },
      err => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const approve = async (id: string) => {
    try {
      await updateDoc(doc(db, "forums", id), {
        isApproved: true,
        approvedAt: serverTimestamp(),
      });
    } catch (e: any) {
      Alert.alert("שגיאה", e.message || "לא ניתן לאשר");
    }
  };

  if (loading)
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: SURFACE, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: SURFACE }]}>
      <LinearGradient
        colors={[PRIMARY, "#d32f2f"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 6 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.hBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.hTitle}>פורומים לאישור</Text>
        <View style={styles.hBtn} />
      </LinearGradient>

      <FlatList
        data={forums}
        keyExtractor={f => f.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ForumRow
            forum={item}
            cardBg={CARD}
            textPrimary={TXT1}
            textSecondary={TXT2}
            onApprove={approve}
          />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: TXT2 }}>אין פורומים להצגה</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// --- ForumRow כמו ב-index, בלי תגובות ולייקים, עם כפתור אישור בלבד ---

function ForumRow({
  forum,
  cardBg,
  textPrimary,
  textSecondary,
  onApprove,
}: {
  forum: Forum;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  onApprove: (id: string) => void;
}) {
  const updated = forum.lastActivity
    ? new Date(forum.lastActivity.toMillis()).toLocaleDateString("he-IL")
    : "-";

  return (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg }]}
      onPress={() =>
        router.push({ pathname: "/forums/[id]", params: { id: forum.id } })
      }
      android_ripple={{ color: LIGHT_GREY }}
    >
      <Text style={[styles.cardTitle, { color: textPrimary }]} numberOfLines={2}>
        {forum.title}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
        <Text style={{ color: textSecondary }}>
          נוצר על ידי: {forum.createdBy?.displayName || "לא ידוע"}
        </Text>
        <Text style={{ color: textSecondary }}>{updated}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
        <Pressable style={[styles.btn, styles.approve]} onPress={() => onApprove(forum.id)}>
          <Ionicons name="checkmark" size={20} color="#fff" />
        </Pressable>
      </View>
    </Pressable>
  );
}

// --- סגנונות (אפשר להעתיק מה-index) ---
const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  hBtn: { width: 32 },
  hTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  list: { padding: 12 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  approve: { backgroundColor: "#4caf50" },
});