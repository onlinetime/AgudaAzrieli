import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Text, Alert } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { db } from "../../../firebase";

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

export default function NewForum() {
  /* state */
  const [title, setTitle] = useState("");
  const [category, setCat] = useState<typeof CATEGORIES[number] | "">("");
  const [desc, setDesc]   = useState("");

  const handleSave = async () => {
    if (!title || !category) {
      Alert.alert("חובה למלא כותרת וקטגוריה");
      return;
    }

    await addDoc(collection(db, "forums"), {
      title,
      category,
      description: desc,
      createdAt: serverTimestamp(),
      createdBy: { displayName: "Anon" },        // כאן תכניס user אמיתי
      isActive: true,
      lastActivity: serverTimestamp(),
    });

    router.back();           // חזרה לרשימה
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="כותרת הפורום"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <Picker
        selectedValue={category}
        onValueChange={(v) => setCat(v)}
        style={styles.input}
      >
        <Picker.Item label="בחר קטגוריה" value="" />
        {CATEGORIES.map((c) => (
          <Picker.Item key={c} label={c} value={c} />
        ))}
      </Picker>

      <TextInput
        placeholder="תיאור (לא חובה)"
        style={[styles.input, { height: 100 }]}
        value={desc}
        onChangeText={setDesc}
        multiline
      />

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={{ color: "#fff" }}>שמור</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#4f6cf7",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
  },
});
