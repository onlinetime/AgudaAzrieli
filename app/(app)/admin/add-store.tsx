import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
  TouchableOpacity,
  Animated,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import type { KeyboardTypeOptions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.95, 380);
const ACCENT = "#ff1744";
const HEADER_COLORS: [string, string] = ["#ff1744", "#b71c1c"];

export default function AdminAddStoreModern() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("he");

  // form state
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("");
  const [discount, setDiscount] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  // fade in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

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

  const handleSubmit = async () => {
    if (!storeName.trim() || !discount.trim()) {
      Alert.alert(t("storeNameRequired"));
      return;
    }
    try {
      await addDoc(collection(db, "stores"), {
        name: storeName,
        picture: imageUri || "",
        address,
        description,
        phoneNumber,
        category,
        discount,
      });
      Alert.alert(t("storeAddedSuccess"));
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert(t("failedAddStore"));
    }
  };

  type Field = {
    label: string;
    value: string;
    setter: React.Dispatch<React.SetStateAction<string>>;
    placeholder: string;
    multiline?: boolean;
    height?: number;
    keyboardType?: KeyboardTypeOptions;
  };

  const fields: Field[] = [
    { label: t("storeNameLabel"), value: storeName, setter: setStoreName, placeholder: t("storeNamePlaceholder") },
    { label: t("addressLabel"), value: address, setter: setAddress, placeholder: t("addressPlaceholder") },
    { label: t("descriptionLabel"), value: description, setter: setDescription, placeholder: t("descriptionPlaceholder"), multiline: true, height: 100 },
    { label: t("phoneLabel"), value: phoneNumber, setter: setPhoneNumber, placeholder: t("phonePlaceholder"), keyboardType: "phone-pad" },
    { label: t("categoryLabel"), value: category, setter: setCategory, placeholder: t("categoryPlaceholder") },
    { label: t("discountLabel"), value: discount, setter: setDiscount, placeholder: t("discountPlaceholder"), keyboardType: "numeric" },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <RNStatusBar backgroundColor={ACCENT} barStyle="light-content" />
      <LinearGradient
        colors={HEADER_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.headerBar, { paddingTop: insets.top + 12 }]}
      >
        {/* Always on the top-left */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: isRTL ? "right" : "left", flex: 1 }]}>
          {t("addStoreTitle")}
        </Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image picker card */}
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
            {t("pictureLabel")}
          </Text>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.imagePlaceholder, { borderColor: colors.border }]}>
              <Text style={{ color: colors.border }}>{t("noImageSelected")}</Text>
            </View>
          )}
          <TouchableOpacity onPress={pickImage} style={[styles.actionBtn, { backgroundColor: ACCENT }]}>
            <Ionicons name="image-outline" size={20} color="#fff" />
            <Text style={styles.actionLabel}>{t("pickImage")}</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic fields */}
        {fields.map((f, i) => (
          <View key={i} style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
              {f.label}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  textAlign: isRTL ? "right" : "left",
                  height: f.height || 48,
                },
              ]}
              placeholder={f.placeholder}
              placeholderTextColor={colors.border}
              value={f.value}
              onChangeText={f.setter}
              multiline={!!f.multiline}
              keyboardType={f.keyboardType}
            />
          </View>
        ))}

        {/* Submit button */}
        <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
          <LinearGradient colors={HEADER_COLORS} style={styles.submitBg}>
            <Text style={styles.submitText}>{t("addStoreSubmit")}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row", // always row, so arrow-back stays on left
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  backBtn: { padding: 8 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  scroll: { alignItems: "center", paddingVertical: 16, paddingBottom: 40 },

  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  cardLabel: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  image: { width: "100%", height: 180, borderRadius: 12, marginBottom: 12 },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionLabel: { color: "#fff", fontSize: 14, fontWeight: "600", marginLeft: 6 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  submitBtn: { width: CARD_WIDTH, borderRadius: 24, overflow: "hidden", marginTop: 8, marginBottom: 24 },
  submitBg: { paddingVertical: 14, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
