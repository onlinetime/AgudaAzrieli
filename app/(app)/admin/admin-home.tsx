// app/(app)/admin/admin-home.tsx
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function AdminHomeScreen() {
  const { t } = useTranslation();

  /** מסכי הניווט החדשים + הישנים  */
  const MENU_ITEMS = [
    // ----- מתנות
    {
      label: t("createGift"),
      to: "./uploadGift", // UploadGift.tsx
      icon: "gift-outline",
    },
    {
      label: t("giftEligibility"),
      to: "./GiftVerify", // GiftVerify.tsx
      icon: "checkmark-done-outline",
    },
    {
      label: t("uploadUsers"),
      to: "./upload-users-file", // upload-users-file.tsx
      icon: "document-attach-outline",
    },

    // ----- תפריט אדמין “הישן”
    { label: t("feedback"), to: "./admin-feedback", icon: "chatbubble-outline" },
    { label: t("forumPost"), to: "./admin-forum", icon: "help-circle-outline" },
    { label: t("addCard"), to: "./admin-add-card", icon: "cube-outline" },
    {
      label: t("eventManagement"),
      to: "./admin-events",
      icon: "calendar-outline",
    },
    {
      label: t("storeManagement"),
      to: "./admin-store",
      icon: "storefront-outline",
    },

    // אחרון – הגדרות
    { label: t("settings"), to: "./admin-settings", icon: "settings-outline" },
  ];

  return (
    <LinearGradient colors={["#fafbff", "#f5f7fa"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t("welcomeAdmin")}</Text>
          <Ionicons
            name="construct-outline"
            size={32}
            color="#4f6cf7"
            style={styles.titleIcon}
          />
        </View>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <CardButton key={item.to} {...item} />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function CardButton({
  label,
  to,
  icon,
}: {
  label: string;
  to: string;
  icon: string;
}) {
  return (
    <Pressable
      onPress={() => router.push(to as any)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      android_ripple={{ color: "rgba(0,0,0,0.15)" }}
    >
      <LinearGradient
        colors={["#4f6cf7", "#d94645"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardBg}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color="#fff"
          style={styles.cardIcon}
        />
        <Text style={styles.cardLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#fafbff",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT + 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#333" },
  titleIcon: { marginLeft: 8 },
  menu: { width: "90%", gap: 16 },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  cardBg: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  cardIcon: { marginRight: 12 },
  cardLabel: { color: "#fff", fontSize: 20, fontWeight: "600" },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
});
