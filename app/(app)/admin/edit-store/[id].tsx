import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.95, 380);
const ACCENT = "#ff1744";
const HEADER_COLORS: [string, string] = ["#ff1744", "#b71c1c"];

export default function AdminEditStoreModern() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, dark } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("he");

  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("");
  const [discount, setDiscount] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, "stores", id!);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          Alert.alert(t("error"), t("storeNotFound"));
          router.back();
          return;
        }
        const data = snap.data() as any;
        setStoreName(data.name);
        setAddress(data.address);
        setDescription(data.description);
        setPhoneNumber(data.phoneNumber);
        setCategory(data.category);
        setDiscount(data.discount);
        setImageUri(data.picture);
      } catch {
        Alert.alert(t("error"), t("cannotLoadStore"));
        router.back();
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }
    })();
  }, [id]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert(t("permissionRequired"), t("needGalleryAccess"));
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!storeName.trim() || !discount.trim()) {
      return Alert.alert(t("error"), t("fillRequiredFields"));
    }
    try {
      setLoading(true);
      const ref = doc(db, "stores", id!);
      await updateDoc(ref, {
        name: storeName,
        address,
        description,
        phoneNumber,
        category,
        discount,
        picture: imageUri || "",
      });
      Alert.alert(t("success"), t("storeUpdated"));
      router.back();
    } catch {
      Alert.alert(t("error"), t("updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* make status bar opaque and choose content color based on background */}
      <RNStatusBar
        translucent={false}
        backgroundColor={ACCENT}
        barStyle={dark ? "light-content" : "dark-content"}
      />

      {/* header */}
      <LinearGradient
        colors={HEADER_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.headerBar, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: isRTL ? "right" : "left" }]}>
          {t("editStoreTitle")}
        </Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* form */}
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image picker */}
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
            {t("pictureLabel")}
          </Text>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.imagePlaceholder, { borderColor: colors.border }]}>
              <Ionicons name="image-outline" size={48} color="#BBB" />
            </View>
          )}
          <TouchableOpacity onPress={pickImage} style={[styles.actionBtn, { backgroundColor: ACCENT }]}>
            <Ionicons name="image-outline" size={20} color="#fff" />
            <Text style={styles.actionLabel}>{t("pickImage")}</Text>
          </TouchableOpacity>
        </View>

        {/* input fields */}
        {[
          { key: "name", label: t("storeNameLabel"), value: storeName, setter: setStoreName },
          { key: "address", label: t("addressLabel"), value: address, setter: setAddress },
          {
            key: "desc",
            label: t("descriptionLabel"),
            value: description,
            setter: setDescription,
            multiline: true,
            height: 80,
          },
          { key: "phone", label: t("phoneLabel"), value: phoneNumber, setter: setPhoneNumber, keyboardType: "phone-pad" },
          { key: "category", label: t("categoryLabel"), value: category, setter: setCategory },
          { key: "discount", label: t("discountLabel"), value: discount, setter: setDiscount, keyboardType: "numeric" },
        ].map((f) => (
          <View key={f.key} style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
              {f.label}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  textAlign: isRTL ? "right" : "left",
                  height: f.height || 48,
                },
              ]}
              value={f.value}
              onChangeText={f.setter}
              placeholder={f.label}
              placeholderTextColor={colors.border}
              keyboardType={f.keyboardType as any}
              multiline={!!f.multiline}
            />
          </View>
        ))}

        {/* save button */}
        <TouchableOpacity onPress={handleSave} style={styles.submitBtn}>
          <LinearGradient colors={HEADER_COLORS} style={styles.submitBg}>
            <Text style={styles.submitText}>{t("saveChanges")}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  backBtn: { padding: 6 },
  headerTitle: { flex: 1, color: "#fff", fontSize: 20, fontWeight: "700" },

  scrollContent: { alignItems: "center", paddingVertical: 16, paddingBottom: 40 },

  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  cardLabel: { fontSize: 16, fontWeight: "600", marginBottom: 8 },

  image: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8 },
  actionLabel: { color: "#fff", fontWeight: "600", marginLeft: 8 },

  input: { width: "100%", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },

  submitBtn: { width: CARD_WIDTH, borderRadius: 24, overflow: "hidden", marginTop: 8, marginBottom: 24 },
  submitBg: { paddingVertical: 14, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
