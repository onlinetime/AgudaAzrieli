/* ─────────────────────────────────────────────────
   app/(app)/admin/add-store.tsx     – FULL VERSION
   ───────────────────────────────────────────────── */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function AdminAddStore() {
  const { colors } = useTheme();
  const { t }   = useTranslation();

  /* ------------ state ------------ */
  const [storeName, setStoreName]   = useState("");
  const [address,   setAddress]     = useState("");
  const [description,setDescription]= useState("");
  const [phoneNumber,setPhoneNumber]= useState("");
  const [category,  setCategory]    = useState("");
  const [discount,  setDiscount]    = useState("");
  const [imageUri,  setImageUri]    = useState<string | null>(null);

  /* ------------ pick image ------------ */
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t("permissionMedia"));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  /* ------------ submit ------------ */
  const handleSubmit = async () => {
    if (!storeName.trim()) {
      Alert.alert(t("storeNameRequired"));
      return;
    }
    if (!discount.trim()) {
      Alert.alert(t("discountRequired"));
      return;
    }
    try {
      await addDoc(collection(db, "stores"), {
        name:        storeName,
        picture:     imageUri || "",
        address,
        description,
        phoneNumber,
        category,
        discount,
      });
      Alert.alert(t("storeAddedSuccess"));
      setStoreName("");
      setAddress("");
      setDescription("");
      setPhoneNumber("");
      setCategory("");
      setDiscount("");
      setImageUri(null);
    } catch (e) {
      console.error("add store:", e);
      Alert.alert(t("failedAddStore"));
    }
  };

  /* helper לבניית שדות */
  const fields = [
    { key:"address",   label:t("addressLabel"),   ph:t("addressPlaceholder"),   val:address,   setter:setAddress },
    { key:"desc",      label:t("descriptionLabel"), ph:t("descriptionPlaceholder"), val:description, setter:setDescription, multiline:true, height:100 },
    { key:"phone",     label:t("phoneLabel"),     ph:t("phonePlaceholder"),     val:phoneNumber,setter:setPhoneNumber, keyboard:"phone-pad" },
    { key:"category",  label:t("categoryLabel"),  ph:t("categoryPlaceholder"),  val:category,  setter:setCategory },
    { key:"discount",  label:t("discountLabel"),  ph:t("discountPlaceholder"),  val:discount,  setter:setDiscount,  keyboard:"numeric" },
  ] as const;

  /* ------------ UI ------------ */
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("addStoreTitle")}
        </Text>

        {/* -------- Store name -------- */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("storeNameLabel")}
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
          ]}
          placeholder={t("storeNamePlaceholder")}
          placeholderTextColor={colors.border}
          value={storeName}
          onChangeText={setStoreName}
        />

        {/* -------- Image -------- */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("pictureLabel")}
        </Text>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <View style={[styles.imagePlaceholder, { borderColor: colors.border }]}>
            <Text style={{ color: colors.border }}>{t("noImageSelected")}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={pickImage}
        >
          <Text style={[styles.buttonText, { color: "#fff" }]}>
            {t("pickImage")}
          </Text>
        </TouchableOpacity>

        {/* -------- dynamic fields -------- */}
        {fields.map((f) => (
          <View key={f.key as string}>
            <Text style={[styles.label, { color: colors.text }]}>{f.label}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                  height: f.height || 48,
                },
              ]}
              placeholder={f.ph}
              placeholderTextColor={colors.border}
              value={f.val}
              onChangeText={f.setter}
              keyboardType={f.keyboard as any}
              multiline={f.multiline}
            />
          </View>
        ))}

        <View style={styles.submitContainer}>
          <Button
            title={t("addStoreSubmit")}
            onPress={handleSubmit}
            color={colors.primary}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ------------ styles (unchanged) ------------ */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 16, fontWeight: "600", marginVertical: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 8 },
  button: { padding: 12, borderRadius: 8, alignItems: "center", marginVertical: 10 },
  buttonText: { fontWeight: "600" },
  imagePreview: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  imagePlaceholder: {
    width: "100%", height: 200, borderWidth: 1, borderRadius: 8,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  submitContainer: { marginTop: 20 },
});
