import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
  TextInput,
  Modal,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

import { db } from "../../../firebase";

/* ─────── קבועי קטגוריה ─────── */
const CATEGORIES = [
  "תוכנה",
  "תעשייה וניהול",
  "חומרים",
  "בניין",
  "פארמה",
  "מדעי המחשב",
  "חשמל ואלקטרוניקה",
  "מכונות",
  "אחר",
] as const;

/* ─────── טיפוס פורום ─────── */
type Forum = {
  id: string;
  title: string;
  category: (typeof CATEGORIES)[number];
  createdAt?: Timestamp;
  createdBy: { displayName: string };
  isActive: boolean;
  lastActivity?: Timestamp;
  replies?: number;
  likes?: number;
};

export default function ForumsHome() {
  /* ----- state ----- */
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  /* פילטרים */
  const [catFilter, setCatFilter] = useState<string | "">("");
  const [onlyActive, setOnlyActive] = useState<"all" | "yes" | "no">("all");
  const [dateFrom, setDateFrom]     = useState<Date | null>(null);
  const [titleQuery, setTitleQuery] = useState("");

  /* Drawer */
  const [drawerOpen, setDrawer] = useState(false);
  const toggleDrawer = () => setDrawer((p) => !p);

  /* ----- live feed ----- */
  useEffect(() => {
    const q = query(collection(db, "forums"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setForums(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Forum) })));
      setLoading(false);
    });
    return unsub;
  }, []);

  /* ----- filtering ----- */
  const filtered = useMemo(() => {
    return forums.filter((f) => {
      if (catFilter && f.category !== catFilter) return false;
      if (onlyActive === "yes" && !f.isActive) return false;
      if (onlyActive === "no"  &&  f.isActive) return false;
      if (dateFrom && (!f.createdAt || f.createdAt.toMillis() < dateFrom.getTime()))
        return false;
      if (titleQuery && !f.title.includes(titleQuery)) return false;
      return true;
    });
  }, [forums, catFilter, onlyActive, dateFrom, titleQuery]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  /* ───────── UI ───────── */
  return (
    <View style={styles.container}>
      {/* ▌באנר – כפתור≡ + לוגו + כותרת ▌*/}
      <View style={styles.banner}>
        <Pressable onPress={toggleDrawer} style={styles.menuBtn}>
          <Ionicons name="menu" size={28} color="#fff" />
        </Pressable>

        <Image
          source={require("../../../assets/images/collegeLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.bannerTitle}>רשימת הפורומים</Text>
      </View>

      {/* ▌כפתור “צור פורום” ▌*/}
      <Pressable
        style={styles.newBtn}
        onPress={() => router.push("/forums/new")}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.newTxt}>צור פורום</Text>
      </Pressable>

      {/* ▌טבלת כותרות ▌*/}
      <View style={styles.header}>
        <Text style={styles.col}>קטגוריה</Text>
        <Text style={styles.col}>מפרסם</Text>
        <Text style={styles.col}>עדכון</Text>
        <Text style={styles.col}>פעיל?</Text>
        <Text style={styles.col}>תאריך</Text>
        <Text style={[styles.col, { flex: 2 }]}>פורום</Text>
      </View>

      {/* ▌רשימה ▌*/}
      <FlatList
        data={filtered}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => <Row forum={item} />}
      />

      {/* ▌Drawer / Side-filter ▌*/}
      <Modal
        visible={drawerOpen}
        animationType="slide"
        transparent
        onRequestClose={toggleDrawer}
      >
        <Pressable style={styles.overlay} onPress={toggleDrawer} />
        <View style={styles.drawer}>
          <Text style={styles.drawerTitle}>סינון פורומים</Text>

          {/* חיפוש בכותרת */}
          <TextInput
            placeholder="חפש בכותרת"
            style={[styles.input, { direction: "ltr" }]}
            value={titleQuery}
            onChange={(e) => setTitleQuery(e.nativeEvent.text)}
          />

          {/* קטגוריה */}
          <Picker
            selectedValue={catFilter}
            onValueChange={setCatFilter}
            style={styles.input}
          >
            <Picker.Item label="כל הקטגוריות" value="" />
            {CATEGORIES.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>

          {/* פעיל? */}
          <Picker
            selectedValue={onlyActive}
            onValueChange={setOnlyActive}
            style={styles.input}
          >
            <Picker.Item label="הכל" value="all" />
            <Picker.Item label="פעיל" value="yes" />
            <Picker.Item label="לא פעיל" value="no" />
          </Picker>

          {/* מתאריך */}
          <Pressable
            style={styles.dateBtn}
            onPress={() => setDateFrom(new Date())}
          >
            <Text>
              {dateFrom ? dateFrom.toLocaleDateString("he-IL") : "מתאריך"}
            </Text>
          </Pressable>
          {Platform.OS !== "web" && dateFrom && (
            <DateTimePicker
              mode="date"
              value={dateFrom}
              onChange={(_, d) => d && setDateFrom(d)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

/* ─────── Row ─────── */
function Row({ forum }: { forum: Forum }) {
  const created = forum.createdAt
    ? new Date(forum.createdAt.toMillis()).toLocaleString("he-IL")
    : "-";
  const updated = forum.lastActivity
    ? new Date(forum.lastActivity.toMillis()).toLocaleString("he-IL")
    : "-";

  return (
    <Pressable
      style={styles.row}
      onPress={() =>
        router.push({ pathname: "/forums/[id]", params: { id: forum.id } })
      }
    >
      <Text style={styles.cell}>{forum.category}</Text>
      <Text style={styles.cell}>{forum.createdBy?.displayName ?? "-"}</Text>
      <Text style={styles.cell}>{updated}</Text>

      <Ionicons
        name={forum.isActive ? "checkmark-circle" : "close-circle"}
        size={20}
        color={forum.isActive ? "green" : "red"}
        style={styles.cellIcon}
      />

      <Text style={styles.cell}>{created}</Text>
      <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>
        {forum.title}
      </Text>
    </Pressable>
  );
}

/* ─────── styles ─────── */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },

  /* באנר */
  banner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
    justifyContent: "flex-start",
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4f6cf7",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 110, height: 36 },
  bannerTitle: { fontSize: 22, fontWeight: "700", color: "#333" },

  /* כפתור חדש */
  newBtn: {
    flexDirection: "row",
    alignSelf: "flex-end",
    backgroundColor: "#4f6cf7",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  newTxt: { color: "#fff", marginLeft: 4 },

  /* טבלת כותרות */
  header: {
    flexDirection: "row",
    backgroundColor: "#2e6dd8",
    paddingVertical: 6,
    borderRadius: 4,
  },
  col: { flex: 1, color: "#fff", textAlign: "center", fontWeight: "600" },

  /* שורה בטבלה */
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ececec",
    alignItems: "center",
  },
  cell: { flex: 1, textAlign: "center" },
  cellIcon: { flex: 1, textAlign: "center" },

  /* Drawer */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 290,
    backgroundColor: "#fff",
    padding: 18,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    elevation: 6,
  },
  drawerTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  dateBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginTop: 8,
  },
});