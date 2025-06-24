// app/(app)/admin/add-event.tsx
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
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function AdminAddEvent() {
  /* theme + i18n */
  const { colors } = useTheme();
  const { t } = useTranslation();

  /* form state */
  const [title, setTitle]                 = useState("");
  const [description, setDescription]     = useState("");
  const [startDate, setStartDate]         = useState("");
  const [endDate, setEndDate]             = useState("");
  const [registrationRequired, setReg]    = useState(false);
  const [picture, setPicture]             = useState<string | null>(null);
  const [address, setAddress]             = useState("");
  const [maxAttendees, setMaxAttendees]   = useState("");
  const [currentAttendees, setCurrentAtt] = useState("");
  const [priority, setPriority]           = useState("");
  const [phoneNumber, setPhone]           = useState("");
  const [category, setCategory]           = useState("");

  /* pick image */
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t("noPermission"), t("needGalleryAccess"));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) setPicture(res.assets[0].uri);
  };

  /* submit */
  const handleSubmit = async () => {
    if (!title.trim())          return Alert.alert(t("error"), t("eventTitleRequired"));
    if (!startDate.trim())      return Alert.alert(t("error"), t("eventStartRequired"));

    try {
      await addDoc(collection(db, "events"), {
        title,
        description,
        startDate,
        endDate,
        registrationRequired,
        picture: picture || "",
        address,
        maxAttendees:   parseInt(maxAttendees)   || 0,
        currentAttendees:parseInt(currentAttendees)||0,
        priority:       parseInt(priority)       || 0,
        phoneNumber,
        category,
      });
      Alert.alert(t("completed"), t("addEventSubmit"));
      /* reset */
      setTitle(""); setDescription(""); setStartDate(""); setEndDate("");
      setReg(false); setPicture(null); setAddress(""); setMaxAttendees("");
      setCurrentAtt(""); setPriority(""); setPhone(""); setCategory("");
    } catch (e) {
      console.error(e);
      Alert.alert(t("error"), t("failedAddEvent"));
    }
  };

  /* field list helper */
  const FIELDS = [
    { label: t("eventTitleLabel"),          ph: t("eventTitlePlaceholder"),          val: title, setter: setTitle },
    { label: t("eventDescLabel"),           ph: t("eventDescPlaceholder"),           val: description, setter: setDescription, multiline: true, height: 100 },
    { label: t("startDateLabel"),           ph: t("startDatePlaceholder"),           val: startDate, setter: setStartDate },
    { label: t("endDateLabel"),             ph: t("endDatePlaceholder"),             val: endDate, setter: setEndDate },
    { label: t("addressLabel"),             ph: t("addressPlaceholder"),             val: address, setter: setAddress },
    { label: t("maxAttendeesLabel"),        ph: t("maxAttendeesPlaceholder"),        val: maxAttendees, setter: setMaxAttendees, keyboardType: "numeric" },
    { label: t("currentAttendeesLabel"),    ph: t("currentAttendeesPlaceholder"),    val: currentAttendees, setter: setCurrentAtt, keyboardType: "numeric" },
    { label: t("priorityLabel"),            ph: t("priorityPlaceholder"),            val: priority, setter: setPriority, keyboardType: "numeric" },
    { label: t("phoneLabel"),               ph: t("phonePlaceholder"),               val: phoneNumber, setter: setPhone, keyboardType: "phone-pad" },
    { label: t("categoryLabel"),            ph: t("categoryPlaceholder"),            val: category, setter: setCategory },
  ];

  /* UI */
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>{t("addEventTitle")}</Text>

        {FIELDS.map(({ label, ph, val, setter, ...rest }, idx) => (
          <View key={idx}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                rest.height ? { height: rest.height } : null,
              ]}
              placeholder={ph}
              placeholderTextColor={colors.border}
              value={val}
              onChangeText={setter}
              {...rest}
            />
          </View>
        ))}

        {/* registration checkbox */}
        <Text style={[styles.label, { color: colors.text }]}>{t("registrationRequiredLabel")}</Text>
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setReg(p => !p)}>
          <Ionicons
            name={registrationRequired ? "checkbox" : "square-outline"}
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            {registrationRequired ? t("yes") : t("no")}
          </Text>
        </TouchableOpacity>

        {/* picture picker */}
        <Text style={[styles.label, { color: colors.text }]}>{t("pictureLabel")}</Text>
        {picture ? (
          <Image source={{ uri: picture }} style={styles.imagePreview} />
        ) : (
          <View style={[styles.imagePlaceholder, { borderColor: colors.border }]}>
            <Text style={{ color: colors.border }}>{t("noImageSelected")}</Text>
          </View>
        )}
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={pickImage}>
          <Text style={[styles.buttonText, { color: "#fff" }]}>{t("pickImage")}</Text>
        </TouchableOpacity>

        <View style={styles.submitContainer}>
          <Button title={t("addEventSubmit")} onPress={handleSubmit} color={colors.primary} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ––––– styles (unchanged) ––––– */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 16, fontWeight: "600", marginVertical: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 8 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  checkboxLabel: { marginLeft: 10, fontSize: 16 },
  button: { padding: 12, borderRadius: 8, alignItems: "center", marginVertical: 10 },
  buttonText: { fontWeight: "600" },
  imagePreview: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  imagePlaceholder:{ width: "100%", height: 200, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  submitContainer: { marginTop: 20 },
});
