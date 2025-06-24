import React, { useState } from "react";
import {
  View,
  Button,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase";
import XLSX from "xlsx";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";         // ← חדש

export default function UploadUsersFile() {
  const { colors } = useTheme();
  const { t } = useTranslation();                      // ← חדש
  const [loading, setLoading] = useState(false);

  /* ───────────  Pick file  ─────────── */
  const handlePickFile = async () => {
    setLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
      });
      if (result.type === "cancel") {
        setLoading(false);
        return;
      }

      const { uri, name } = result;
      let users: any[] = [];

      /* ─── CSV ─── */
      if (name.endsWith(".csv")) {
        const csvText = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        Papa.parse(csvText, {
          header: true,
          complete: async ({ data }) => {
            users = data;
            await uploadUsers(users);
          },
          error: () => {
            setLoading(false);
            Alert.alert(t("error"), t("somethingWentWrong"));
          },
        });
      }
      /* ─── Excel ─── */
      else {
        const b64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const wb = XLSX.read(b64, { type: "base64" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        users = XLSX.utils.sheet_to_json(ws);
        await uploadUsers(users);
      }
    } catch (e) {
      setLoading(false);
      console.error(e);
      Alert.alert(t("error"), t("somethingWentWrong"));
    }
  };

  /* ───────────  Upload to Firestore  ─────────── */
  const uploadUsers = async (users: any[]) => {
    let added = 0;
    for (const u of users) {
      if (!u["שם פרטי"] || !u["שם משפחה"] || !u["תעודת זהות"]) continue;

      const q = query(
        collection(db, "users"),
        where("id", "==", String(u["תעודת זהות"]))
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "users"), {
          firstName: u["שם פרטי"],
          lastName:  u["שם משפחה"],
          id:        String(u["תעודת זהות"]),
        });
        added++;
      }
    }
    setLoading(false);
    Alert.alert(
      t("completed"),
      `${t("uploadUsers")}: ${added}`
    );
  };

  /* ───────────  UI  ─────────── */
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Button
        title={t("uploadUsersExcel")}              // ← תרגום
        onPress={handlePickFile}
        color={colors.primary}
      />
      {loading && (
        <ActivityIndicator style={{ marginTop: 12 }} color={colors.primary} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
