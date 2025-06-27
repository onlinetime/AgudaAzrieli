import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const ACCENT = "#ff1744";
const HEADER_GRAD: [string, string] = [ACCENT, "#d32f2f"];

export default function UploadUsersFile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [addedCount, setAddedCount] = useState<number | null>(null);

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
      if (result.canceled) {
        setLoading(false);
        return;
      }

      // result.assets is an array; get the first file
      const file = result.assets?.[0];
      if (!file) {
        setLoading(false);
        Alert.alert(t("error"), t("noFileSelected"));
        return;
      }

      const { uri, name } = file;
      let users: any[] = [];

      // CSV
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
      // Excel
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

  const uploadUsers = async (users: any[]) => {
    let added = 0;
    for (const u of users) {
      if (!u["שם פרטי"] || !u["שם משפחה"] || !u["תעודת זהות"]) continue;

      const userId = String(u["תעודת זהות"]);

      // Check in new_users
      const qNew = query(
        collection(db, "new_users"),
        where("id", "==", userId)
      );
      const snapNew = await getDocs(qNew);

      // Check in users
      const qUsers = query(
        collection(db, "users"),
        where("id", "==", userId)
      );
      const snapUsers = await getDocs(qUsers);

      // If user exists in either, skip
      if (!snapNew.empty || !snapUsers.empty) continue;

      await addDoc(collection(db, "new_users"), {
        firstName: u["שם פרטי"],
        lastName:  u["שם משפחה"],
        id:        userId,
      });
      added++;
    }
    setAddedCount(added);
    setLoading(false);
    Alert.alert(
      t("completed"),
      `${t("uploadUsers")}: ${added}`
    );
  };

  return (
    <SafeAreaView
      edges={["top","bottom","left","right"]}
      style={[styles.safe, { backgroundColor: colors.background }]}
    >      
      <LinearGradient
        colors={HEADER_GRAD}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          onPress={() => { if (router.canGoBack()) router.back(); else router.push('..'); }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="people-outline" size={28} color="#fff" />
          <Text style={styles.headerTitle}>{t("uploadUsersExcel")}</Text>
        </View>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: ACCENT }]}
          onPress={handlePickFile}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>{t("pickFile")}</Text>
          }
        </TouchableOpacity>
        {addedCount !== null && (
          <View style={styles.resultContainer}>
            <Text style={[styles.resultText, { color: colors.text }]}>               
              {t("addedCount")} {addedCount}
            </Text>
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
  headerContent: { flexDirection: "row", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginLeft: 8 },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  resultContainer: { marginTop: 20 },
  resultText: { fontSize: 16 },
});