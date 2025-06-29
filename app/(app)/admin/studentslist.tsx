import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
  Image,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useSettings } from "../../../contexts/SettingsContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HEIGHT = 100;

type StudentData = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string; // Add this line
  ProfilePicture?: string;
};

export default function StudentsListScreen() {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const { darkMode } = useSettings();

  const [students, setStudents] = useState<StudentData[]>([]);
  const [filtered, setFiltered] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // load students
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "users"),
      snap => {
        const list = snap.docs.map(doc => {
          const d = doc.data() as any;
          return {
            id: doc.id,
            firstName: d.firstName,
            lastName: d.lastName,
            phone: d.phone, // Add this line
            ProfilePicture: d.ProfilePicture,
          };
        });
        setStudents(list);
        setFiltered(list);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [fadeAnim]);

  // filter
  const onSearch = useCallback(
    (text: string) => {
      setSearch(text);
      const tLower = text.toLowerCase();
      setFiltered(
        students.filter(
          s =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(tLower) ||
            s.id.includes(tLower)
        )
      );
    },
    [students]
  );

  if (loading) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={[styles.center, { backgroundColor: darkMode ? "#121212" : "#fff" }]}
      >
        <ActivityIndicator size="large" color="#ff1744" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.root, { backgroundColor: darkMode ? "#121212" : "#fff" }]}
    >
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerText, { color: darkMode ? "#E0E0E0" : "#121212" }]}>
          {t("allStudents", "כל הסטודנטים")}
        </Text>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: darkMode ? "#2A2A2A" : "#EEE" },
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: darkMode ? "#E0E0E0" : "#121212",
                textAlign: isRTL ? "right" : "left",
                marginLeft: isRTL ? 0 : 8,
                marginRight: isRTL ? 8 : 0,
              },
            ]}
            placeholder={t("searchPlaceholder", "חפש סטודנט...")}
            placeholderTextColor="#888"
            value={search}
            onChangeText={onSearch}
          />
        </View>
      </View>

      {/* LIST */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: darkMode ? "#1f1f1f" : "#fff",
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  shadowOpacity: pressed ? 0.1 : 0.3,
                  marginTop: index === 0 ? 16 : 8,
                  flexDirection: isRTL ? "row-reverse" : "row",
                },
              ]}
              onPress={() =>
                router.push(`./student-card/${item.id}`)
              }
            >
              {/* AVATAR */}
              {item.ProfilePicture ? (
                <Image source={{ uri: item.ProfilePicture }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={40} color="#888" />
                </View>
              )}

              {/* INFO */}
              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.name,
                    {
                      color: darkMode ? "#E0E0E0" : "#121212",
                      textAlign: isRTL ? "right" : "left",
                    },
                  ]}
                >
                  {item.firstName} {item.lastName}
                </Text>
                {item.phone ? (
                  <Text
                    style={{
                      color: "#888",
                      fontSize: 15,
                      marginTop: 2,
                      textAlign: isRTL ? "right" : "left",
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.phone}
                  </Text>
                ) : null}
              </View>

              {/* CHEVRON */}
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={24}
                color={darkMode ? "#E0E0E0" : "#121212"}
              />
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: "#888", fontSize: 16 }}>
                {t("noStudentsFound", "לא נמצאו סטודנטים")}
              </Text>
            </View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  searchBox: {
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    alignItems: "center",
    height: CARD_HEIGHT,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: CARD_HEIGHT - 24,
    height: CARD_HEIGHT - 24,
    borderRadius: (CARD_HEIGHT - 24) / 2,
    borderWidth: 2,
    borderColor: "#ff1744",
  },
  avatarPlaceholder: {
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  id: {
    fontSize: 14,
    marginTop: 4,
  },
});
