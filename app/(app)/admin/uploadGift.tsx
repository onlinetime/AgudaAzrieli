import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function UploadGift() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [giftName, setGiftName]         = useState("");
  const [description, setDescription]   = useState("");
  const [imageUri, setImageUri]         = useState<string | null>(null);
  const [uploading, setUploading]       = useState(false);
  const [gifts, setGifts]               = useState<any[]>([]);

  /* ───────── Fetch existing gifts ───────── */
  const fetchGifts = async () => {
    const snap = await getDocs(collection(db, "gifts"));
    setGifts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };
  useEffect(() => { fetchGifts(); }, []);

  /* ───────── Pick image ───────── */
  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert(t("error"), t("needMediaPermission"));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  /* ───────── Submit new gift ───────── */
  const handleSubmit = async () => {
    if (!giftName.trim()) {
      Alert.alert(t("error"), t("giftNameRequired"));
      return;
    }
    setUploading(true);
    try {
      await addDoc(collection(db, "gifts"), {
        name: giftName,
        description,
        picture: imageUri || "",
      });
      Alert.alert(t("success"), t("giftAddSuccess"));
      setGiftName(""); setDescription(""); setImageUri(null);
      fetchGifts();
    } catch (e) {
      console.error(e);
      Alert.alert(t("error"), t("giftAddFailed"));
    }
    setUploading(false);
  };

  /* ───────── Delete gift ───────── */
  const handleDelete = (id: string) => {
    Alert.alert(
      t("deleteGift"),
      t("areYouSure"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            await deleteDoc(doc(db, "gifts", id));
            Alert.alert(t("deleted"), t("giftDeleted"));
            fetchGifts();
          },
        },
      ],
      { cancelable: true }
    );
  };

  /* ───────── Header (form) ───────── */
  const renderHeader = () => (
    <View>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("giftAddTitle")}
      </Text>

      <Text style={[styles.label, { color: colors.text }]}>
        {t("giftNameLabel")}
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
        ]}
        placeholder={t("giftNamePlaceholder")}
        placeholderTextColor={colors.border}
        value={giftName}
        onChangeText={setGiftName}
      />

      <Text style={[styles.label, { color: colors.text }]}>
        {t("giftDescLabel")}
      </Text>
      <TextInput
        style={[
          styles.input,
          { height: 100, backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
        ]}
        placeholder={t("giftDescPlaceholder")}
        placeholderTextColor={colors.border}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={[styles.label, { color: colors.text }]}>
        {t("giftImageLabel")}
      </Text>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      ) : (
        <View style={[styles.imagePlaceholder, { borderColor: colors.border }]}>
          <Text style={{ color: colors.text }}>{t("giftNoImage")}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={pickImage}
      >
        <Text style={styles.buttonText}>{t("giftPickImage")}</Text>
      </TouchableOpacity>

      <View style={styles.submitContainer}>
        <Button
          title={uploading ? t("uploading") : t("giftSubmit")}
          onPress={handleSubmit}
          disabled={uploading}
          color={colors.primary}
        />
      </View>

      <Text style={[styles.title, { marginTop: 30, color: colors.text }]}>
        {t("openGifts")}
      </Text>
    </View>
  );

  /* ───────── Render ───────── */
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={gifts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View
              style={[
                styles.giftItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.giftName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={{ color: colors.text }}>{item.description}</Text>

              <Button
                title={t("delete")}
                color={colors.notification}
                onPress={() => handleDelete(item.id)}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={[{ textAlign: "center", margin: 16, color: colors.text }]}>
              {t("noOpenGifts")}
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ───────── Styles ───────── */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  submitContainer: { marginTop: 20 },
  giftItem: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  giftName: { fontWeight: "bold", marginBottom: 4 },
});
