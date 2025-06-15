/* ---------- app/(app)/forums/[id].tsx ---------- */
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  doc,
  onSnapshot,
  Timestamp,
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  setDoc,
  getDoc as getDocOnce,
  updateDoc,
  increment,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../../firebase";

/* ---------- טיפוס למסמך ---------- */
interface ForumDoc {
  title: string;
  category: string;
  description?: string;
  createdAt?: Timestamp;
  createdBy: { displayName: string };
  likes: number;
  commentsCount: number;
}

/* helper */
const fmt = (t?: Timestamp) =>
  t ? new Date(t.toMillis()).toLocaleString("he-IL") : "—";

export default function ForumDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [forum, setForum] = useState<ForumDoc | null>(null);
  interface CommentDoc {
    id: string;
    text: string;
    createdAt?: Timestamp;
    createdBy: { displayName: string };
    likes: number;
  }
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTxt, setNewTxt] = useState("");
  const user = getAuth().currentUser;

  /* forum live */
  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "forums", id), (snap) => {
      setForum(snap.exists() ? (snap.data() as ForumDoc) : null);
      setLoading(false);
    });
  }, [id]);

  /* comments live */
  useEffect(() => {
    if (!id) return;
    return onSnapshot(collection(db, "forums", id, "comments"), (snap) => {
      setComments(
        snap
          .docs.map((d) => ({ id: d.id, ...(d.data() as CommentDoc) }))
          .sort(
            (a, b) =>
              (a.createdAt?.toMillis?.() ?? 0) -
              (b.createdAt?.toMillis?.() ?? 0)
          )
      );
    });
  }, [id]);

  /* like forum */
  const toggleForumLike = useCallback(async () => {
    if (!id || !user) return;
    const likeRef = doc(db, "forums", id, "likes", user.uid);
    const exists = (await getDocOnce(likeRef)).exists();
    if (exists) {
      await deleteDoc(likeRef);
      await updateDoc(doc(db, "forums", id), { likes: increment(-1) });
    } else {
      await setDoc(likeRef, { at: serverTimestamp() });
      await updateDoc(doc(db, "forums", id), { likes: increment(1) });
    }
  }, [id, user]);

  /* like comment */
  const toggleCommentLike = useCallback(
    async (cId: string) => {
      if (!id || !user) return;
      const likeRef = doc(
        db,
        "forums",
        id,
        "comments",
        cId,
        "likes",
        user.uid
      );
      const commentRef = doc(db, "forums", id, "comments", cId);
      const exists = (await getDocOnce(likeRef)).exists();
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

  /* add comment */
  const addComment = async () => {
    if (!id || !newTxt.trim()) return;
    await addDoc(collection(db, "forums", id, "comments"), {
      text: newTxt.trim(),
      createdAt: serverTimestamp(),
      createdBy: {
        displayName: user?.displayName || user?.email || "משתמש",
      },
      likes: 0,
    });
    await updateDoc(doc(db, "forums", id), {
      commentsCount: increment(1),
      lastActivity: serverTimestamp(),
    });
    setNewTxt("");
  };

  /* UI */
  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (forum === null)
    return (
      <View style={st.center}>
        <Text>⚠️ פורום לא נמצא</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={st.wrap}>
      <Pressable style={st.bread} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={18} color="#333" />
        <Text style={st.breadTxt}>
          פורומים › {forum?.category} › {forum?.title}
        </Text>
      </Pressable>

      <Text style={st.title}>{forum?.title}</Text>
      <Text style={st.meta}>
        קטגוריה: {forum?.category} · מפרסם:{" "}
        {forum?.createdBy.displayName} · {fmt(forum?.createdAt)}
      </Text>

      <View style={st.counters}>
        <Pressable onPress={toggleForumLike} style={st.likeBtn}>
          <Ionicons name="heart" size={20} color="#d94645" />
          <Text style={st.countTxt}>{forum?.likes ?? 0}</Text>
        </Pressable>
        <Ionicons
          name="chatbox-ellipses"
          size={20}
          color="#4f6cf7"
          style={{ marginLeft: 4 }}
        />
        <Text style={st.countTxt}>{forum?.commentsCount ?? 0}</Text>
      </View>

      <View style={st.card}>
        <Text style={st.desc}>
          {forum?.description ? forum.description : "— ללא תיאור —"}
        </Text>
      </View>

      <Text style={st.commentsHdr}>תגובות</Text>
      {comments.map((c) => (
        <View key={c.id} style={st.comment}>
          <View style={st.commentHead}>
            <Text style={st.commentAuth}>{c.createdBy?.displayName}</Text>
            <Text style={st.commentDate}>{fmt(c.createdAt)}</Text>
          </View>
          <Text style={st.commentText}>{c.text}</Text>
          <Pressable
            style={st.commentLike}
            onPress={() => toggleCommentLike(c.id)}
          >
            <Ionicons name="heart-outline" size={16} color="#d94645" />
            <Text style={st.commentLikeTxt}>{c.likes ?? 0}</Text>
          </Pressable>
        </View>
      ))}

      <View style={st.addRow}>
        <TextInput
          placeholder="כתוב תגובה..."
          style={st.input}
          value={newTxt}
          onChangeText={setNewTxt}
        />
        <Pressable style={st.send} onPress={addComment}>
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

/* ---------- styles ---------- */
const st = StyleSheet.create({
  wrap: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  bread: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  breadTxt: { color: "#555", fontSize: 13 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 2 },
  meta: { color: "#666", marginBottom: 12 },
  counters: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  likeBtn: { flexDirection: "row-reverse", alignItems: "center", gap: 2 },
  countTxt: { fontSize: 14, color: "#333" },
  card: {
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e5ff",
    marginBottom: 16,
  },
  desc: { lineHeight: 22, color: "#222" },
  commentsHdr: { fontSize: 20, fontWeight: "600", marginBottom: 10 },
  comment: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  commentHead: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  commentAuth: { fontWeight: "600" },
  commentDate: { color: "#888", fontSize: 12 },
  commentText: { lineHeight: 20, marginBottom: 6 },
  commentLike: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 2,
    alignSelf: "flex-start",
  },
  commentLikeTxt: { fontSize: 12, color: "#333" },
  addRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  send: { backgroundColor: "#4f6cf7", padding: 10, borderRadius: 20 },
});
