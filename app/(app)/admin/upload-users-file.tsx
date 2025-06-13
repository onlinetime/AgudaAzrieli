import React, { useState } from "react";
import {
  View,
  Button,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import XLSX from "xlsx";

export default function UploadUsersFile() {
  const [loading, setLoading] = useState(false);

  const handlePickFile = async () => {
    setLoading(true);
    try {
      // Allow CSV and Excel files
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "application/vnd.ms-excel", // .xls
        ],
      });
      if (result.canceled) {
        setLoading(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name || "";
      let users = [];

      if (fileName.endsWith(".csv")) {
        // Read and parse CSV
        let csvText = "";
        try {
          csvText = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
        } catch (e) {
          setLoading(false);
          Alert.alert(
            "שגיאה",
            "לא ניתן לקרוא את הקובץ. נסה לבחור קובץ ממיקום אחר או לשמור אותו מחדש."
          );
          return;
        }
        Papa.parse(csvText, {
          header: true,
          complete: async (results) => {
            users = results.data;
            await uploadUsers(users);
          },
          error: (err) => {
            setLoading(false);
            Alert.alert("שגיאה", "נכשל בקריאת הקובץ");
          },
        });
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        // Read and parse Excel
        let b64 = "";
        try {
          b64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (e) {
          setLoading(false);
          Alert.alert(
            "שגיאה",
            "לא ניתן לקרוא את הקובץ. נסה לבחור קובץ ממיקום אחר או לשמור אותו מחדש."
          );
          return;
        }
        const workbook = XLSX.read(b64, { type: "base64" });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        users = XLSX.utils.sheet_to_json(ws);
        await uploadUsers(users);
      } else {
        setLoading(false);
        Alert.alert("שגיאה", "סוג קובץ לא נתמך. יש לבחור קובץ CSV או Excel.");
        return;
      }
    } catch (e) {
      setLoading(false);
      console.error("Upload error:", e);
      Alert.alert("Error", "Failed to upload users.");
    }
  };

  // Helper function to upload users
  const uploadUsers = async (users: any[]) => {
    let added = 0;
    for (const user of users) {
      if (!user["שם פרטי"] || !user["שם משפחה"] || !user["תעודת זהות"])
        continue;
      const q = query(
        collection(db, "users"),
        where("id", "==", user["תעודת זהות"])
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        await addDoc(collection(db, "users"), {
          firstName: user["שם פרטי"],
          lastName: user["שם משפחה"],
          id: String(user["תעודת זהות"]), // Ensure ID is saved as string
        });
        added++;
      }
    }
    setLoading(false);
    Alert.alert("העלאה הושלמה", `הועלו ${added} משתמשים חדשים`);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Upload Users Excel" onPress={handlePickFile} />
      {loading && <ActivityIndicator size="large" />}
    </View>
  );
}
