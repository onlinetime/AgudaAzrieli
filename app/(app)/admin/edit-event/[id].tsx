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
import { Calendar, DateData } from "react-native-calendars";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.95, 380);
const ACCENT = "#ff1744";
const HEADER_COLORS: [string, string] = ["#ff1744", "#b71c1c"];

export default function EditEvent() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("he");

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [registrationRequired, setReg] = useState(false);
  const [picture, setPicture] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [currentAttendees, setCurrentAttendees] = useState("");
  const [priority, setPriority] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, "events", id!);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          Alert.alert(t("error"), t("eventNotFound"));
          router.back();
          return;
        }
        const data = snap.data() as any;
        setTitle(data.title);
        setDescription(data.description);
        setStartDate(data.startDate);
        setEndDate(data.endDate);
        setReg(data.registrationRequired);
        setPicture(data.picture || null);
        setAddress(data.address);
        setMaxAttendees(String(data.maxAttendees || ""));
        setCurrentAttendees(String(data.currentAttendees || ""));
        setPriority(String(data.priority || ""));
        setPhoneNumber(data.phoneNumber);
        setCategory(data.category);
      } catch {
        Alert.alert(t("error"), t("cannotLoadEvent"));
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
      return Alert.alert(t("noPermission"), t("needGalleryAccess"));
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) {
      setPicture(res.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !startDate) {
      return Alert.alert(t("error"), t("fillRequiredFields"));
    }
    try {
      setLoading(true);
      const ref = doc(db, "events", id!);
      await updateDoc(ref, {
        title,
        description,
        startDate,
        endDate,
        registrationRequired,
        picture: picture || "",
        address,
        maxAttendees: parseInt(maxAttendees) || 0,
        currentAttendees: parseInt(currentAttendees) || 0,
        priority: parseInt(priority) || 0,
        phoneNumber,
        category,
      });
      Alert.alert(t("success"), t("eventUpdated"));
      router.back();
    } catch {
      Alert.alert(t("error"), t("updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const getMarkedDates = () => {
    const marks: Record<string, any> = {};
    if (startDate) {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : start;
      let cur = new Date(start);
      while (cur <= end) {
        const ds = cur.toISOString().slice(0, 10);
        marks[ds] = {
          color: ACCENT,
          textColor: "#fff",
          startingDay: ds === startDate,
          endingDay: ds === endDate,
        };
        cur.setDate(cur.getDate() + 1);
      }
    }
    return marks;
  };

  const onDayPress = (day: DateData) => {
    const ds = day.dateString;
    if (!startDate || (startDate && endDate)) {
      setStartDate(ds);
      setEndDate("");
    } else {
      if (new Date(ds) < new Date(startDate)) {
        setStartDate(ds);
        setEndDate("");
      } else {
        setEndDate(ds);
      }
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
      <RNStatusBar translucent={false} backgroundColor={ACCENT} barStyle="light-content" />

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
          {t("editEventTitle")}
        </Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          <Calendar
            current={startDate || undefined}
            minDate={new Date().toISOString().slice(0, 10)}
            markingType="period"
            markedDates={getMarkedDates()}
            onDayPress={onDayPress}
            theme={{
              arrowColor: ACCENT,
              todayTextColor: ACCENT,
              monthTextColor: colors.text,
              textSectionTitleColor: colors.text,
            }}
            style={styles.calendar}
          />
        </View>

        {[
          { key: "title", label: t("eventTitleLabel"), value: title, setter: setTitle, placeholder: t("eventTitlePlaceholder") },
          { key: "desc", label: t("eventDescLabel"), value: description, setter: setDescription, placeholder: t("eventDescPlaceholder"), multiline: true, height: 100 },
          { key: "address", label: t("addressLabel"), value: address, setter: setAddress, placeholder: t("addressPlaceholder") },
          { key: "max", label: t("maxAttendeesLabel"), value: maxAttendees, setter: setMaxAttendees, placeholder: t("maxAttendeesPlaceholder"), keyboardType: "numeric" },
          { key: "current", label: t("currentAttendeesLabel"), value: currentAttendees, setter: setCurrentAttendees, placeholder: t("currentAttendeesPlaceholder"), keyboardType: "numeric" },
          { key: "priority", label: t("priorityLabel"), value: priority, setter: setPriority, placeholder: t("priorityPlaceholder"), keyboardType: "numeric" },
          { key: "phone", label: t("phoneLabel"), value: phoneNumber, setter: setPhoneNumber, placeholder: t("phonePlaceholder"), keyboardType: "phone-pad" },
          { key: "category", label: t("categoryLabel"), value: category, setter: setCategory, placeholder: t("categoryPlaceholder") },
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
              placeholder={f.placeholder}
              placeholderTextColor={colors.border}
              keyboardType={f.keyboardType as any}
              multiline={!!f.multiline}
            />
          </View>
        ))}

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
            {t("registrationRequiredLabel")}
          </Text>
          <TouchableOpacity onPress={() => setReg(p => !p)} style={styles.checkboxContainer}>
            <Ionicons name={registrationRequired ? "checkbox" : "square-outline"} size={24} color={colors.primary} />
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              {registrationRequired ? t("yes") : t("no")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
            {t("pictureLabel")}
          </Text>
          {picture ? (
            <Image source={{ uri: picture }} style={styles.image} />
          ) : (
            <View style={[styles.imagePlaceholder, { borderColor: colors.border }]}>
              <Text style={{ color: colors.border }}>{t("noImageSelected")}</Text>
            </View>
          )}
          <TouchableOpacity onPress={pickImage} style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="image-outline" size={20} color="#fff" />
            <Text style={styles.actionLabel}>{t("pickImage")}</Text>
          </TouchableOpacity>
        </View>

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
  calendar: { borderRadius: 8, overflow: "hidden", marginBottom: 8 },
  cardLabel: { fontSize: 16, fontWeight: "600", marginBottom: 8 },

  input: { width: "100%", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },

  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  checkboxLabel: { marginLeft: 8, fontSize: 16 },

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

  submitBtn: { width: CARD_WIDTH, borderRadius: 24, overflow: "hidden", marginTop: 8, marginBottom: 24 },
  submitBg: { paddingVertical: 14, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
