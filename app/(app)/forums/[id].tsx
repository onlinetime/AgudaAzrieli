import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Pressable,
  Animated,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
  increment,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebase";
import { useSettings } from "../../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";   // ← כבר היה

const ACCENT = "#ff1744";
const WHITE = "#ffffff";
const CARD_LIGHT = "#f8f9ff";

/* ───────── types ───────── */
interface ForumDoc {
  title: string;
  category: string;
  description?: string;
  createdAt?: any;
  createdBy: { displayName: string };
  likes: number;
  commentsCount: number;
}
interface CommentDoc {
  id: string;
  text: string;
  createdAt?: any;
  createdBy: { displayName: string };
  likes: number;
}

export default function ForumDetails() {
  const insets = useSafeAreaInsets();
  const { darkMode } = useSettings();
  const { t } = useTranslation();                         // ← שימוש בתרגום

  /* palette */
  const SURFACE_BG     = darkMode ? "#121212" : WHITE;
  const CARD_BG        = darkMode ? "#1f1f1f" : CARD_LIGHT;
  const INPUT_BG       = darkMode ? "#1f1f1f" : WHITE;
  const TEXT_PRIMARY   = darkMode ? "#E0E0E0" : "#111";
  const TEXT_SECONDARY = darkMode ? "#C0C0C0" : "#555";

  const { id } = useLocalSearchParams<{ id: string }>();

  /* state */
  const [forum, setForum]         = useState<ForumDoc | null>(null);
  const [comments, setComments]   = useState<CommentDoc[]>([]);
  const [loading, setLoading]     = useState(true);
  const [newTxt, setNewTxt]       = useState("");
  const user = getAuth().currentUser;

  /* animation */
  const slide = useRef(new Animated.Value(30)).current;
  const fade  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(fade,  { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  /* fetch forum + comments */
  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "forums", id), (snap) => {
      setForum(snap.exists() ? (snap.data() as ForumDoc) : null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(collection(db, "forums", id, "comments"), (snap) => {
      const arr = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as CommentDoc) }))
        .sort(
          (a, b) =>
            (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
        );
      setComments(arr);
    });
  }, [id]);

  const fmt = (t?: any) => (t ? new Date(t.toMillis()).toLocaleString("he-IL") : "—");

  /* like toggles – ללא שינוי */
  const toggleForumLike = useCallback(async () => {
    if (!id || !user) return;
    const likeRef = doc(db, "forums", id, "likes", user.uid);
    const exists = (await getDoc(likeRef)).exists();
    if (exists) {
      await deleteDoc(likeRef);
      await updateDoc(doc(db, "forums", id), { likes: increment(-1) });
    } else {
      await setDoc(likeRef, { at: serverTimestamp() });
      await updateDoc(doc(db, "forums", id), { likes: increment(1) });
    }
  }, [id, user]);

  const toggleCommentLike = useCallback(
    async (cId: string) => {
      if (!id || !user) return;
      const likeRef = doc(db, "forums", id, "comments", cId, "likes", user.uid);
      const commentRef = doc(db, "forums", id, "comments", cId);
      const exists = (await getDoc(likeRef)).exists();
      if (exists) {
        await deleteDoc(likeRef);
        await updateDoc(commentRef, { likes: increment(-1) });
      } else {
        await setDoc(likeRef, { at: serverTimestamp() });
        await updateDoc(commentRef, { likes: increment(1) });
      }
    },
    [id, user]
  );

  const addComment = async () => {
    if (!id || !newTxt.trim()) return;

    let fullName = user?.displayName ?? "משתמש";
    if (user?.email) {
      const uDoc = await getDoc(doc(db, "users", user.email));
      if (uDoc.exists()) {
        const u = uDoc.data() as any;
        const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
        if (name) fullName = name;
      }
    }
    await addDoc(collection(db, "forums", id, "comments"), {
      text: newTxt.trim(),
      createdAt: serverTimestamp(),
      createdBy: { displayName: fullName },
      likes: 0,
    });
    await updateDoc(doc(db, "forums", id), {
      commentsCount: increment(1),
      lastActivity: serverTimestamp(),
    });
    setNewTxt("");
    Keyboard.dismiss();
  };

  /* ---------- States ---------- */
  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: SURFACE_BG }]} edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }
  if (!forum) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: SURFACE_BG }]}>
        <Text style={{ color: ACCENT }}>{`🤷‍♂️ ${t("Forum not found", "פורום לא נמצא")}`}</Text>
      </SafeAreaView>
    );
  }

  /* ---------- UI ---------- */
  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: SURFACE_BG }]} edges={["top", "bottom"]}>
      {/* HEADER */}
      <LinearGradient
        colors={[ACCENT, "#d32f2f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>

        {/* כותרת הפורום – מתורגמת אם יש מפתח */}
        <Text style={styles.headTitle}>{t(forum.title, forum.title)}</Text>

        <Pressable onPress={toggleForumLike} style={styles.back}>
          <Ionicons name="heart" size={24} color="#fff" />
          <Text style={styles.headCount}>{forum.likes}</Text>
        </Pressable>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <Animated.ScrollView
          style={{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* forum card */}
          <View style={[styles.forumCard, { backgroundColor: CARD_BG, borderColor: ACCENT }]}>
            <Text style={[styles.meta, { color: TEXT_SECONDARY }]}>
              {t("Category") + ":"} {t(forum.category, forum.category)} ·{" "}
              {t("Publisher") + ":"} {t(forum.createdBy.displayName, forum.createdBy.displayName)}
            </Text>

            <Text style={[styles.desc, { color: TEXT_PRIMARY }]}>
              {forum.description || `— ${t("No description", "ללא תיאור")} —`}
            </Text>
          </View>

          {/* comments title */}
          <Text style={[styles.sec, { color: ACCENT }]}>
            {t("Comments", "תגובות")} ({forum.commentsCount})
          </Text>

          {/* comments list */}
          {comments.map((c) => (
            <View key={c.id} style={[styles.comm, { backgroundColor: CARD_BG }]}>
              <View style={styles.commHead}>
                <Text style={[styles.commAuth, { color: TEXT_PRIMARY }]}>
                  {t(c.createdBy.displayName, c.createdBy.displayName)}
                </Text>
                <Text style={[styles.commDate, { color: TEXT_SECONDARY }]}>{fmt(c.createdAt)}</Text>
              </View>

              <Text style={[styles.commTxt, { color: TEXT_PRIMARY }]}>{t(c.text, c.text)}</Text>

              <Pressable onPress={() => toggleCommentLike(c.id)} style={styles.commLike}>
                <Ionicons name="heart-outline" size={16} color={ACCENT} />
                <Text style={[styles.commLikeNum, { color: ACCENT }]}>{c.likes}</Text>
              </Pressable>
            </View>
          ))}
        </Animated.ScrollView>

        {/* input */}
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: SURFACE_BG,
              borderColor: darkMode ? "#444" : "#4444",
              paddingBottom: insets.bottom || 12,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { backgroundColor: INPUT_BG, borderColor: darkMode ? "#444" : "#4444", color: TEXT_PRIMARY },
            ]}
            placeholder={t("Write a comment…", "כתוב תגובה...")}
            placeholderTextColor="#888"
            value={newTxt}
            onChangeText={setNewTxt}
          />
          <Pressable style={[styles.send, { backgroundColor: ACCENT }]} onPress={addComment}>
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  back: { padding: 4 },
  headTitle: { color: "#fff", fontSize: 20, fontWeight: "800", flex: 1, textAlign: "center" },
  headCount: { color: "#fff", marginLeft: 6, fontSize: 16 },

  forumCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 20,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  meta: { marginBottom: 8, fontSize: 14 },
  desc: { fontSize: 16, lineHeight: 22 },

  sec: { fontSize: 18, fontWeight: "600", marginBottom: 12 },

  comm: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 1,
  },
  commHead: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 4 },
  commAuth: { fontWeight: "600" },
  commDate: { fontSize: 12 },
  commTxt: { fontSize: 14, lineHeight: 20, marginBottom: 6 },

  commLike: { flexDirection: "row-reverse", alignItems: "center" },
  commLikeNum: { fontSize: 12, marginLeft: 4 },

  inputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    marginVertical: 8,
  },
  send: { padding: 10, borderRadius: 20 },
});
