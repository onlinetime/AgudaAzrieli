// // app/(app)/user/user-home.tsx
// import React from "react";
// import {
//   View,
//   Text,
//   Pressable,
//   StyleSheet,
//   Platform,
//   StatusBar,
//   ScrollView,
//   Dimensions,
// } from "react-native";
// import { router } from "expo-router";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";
// import { useTranslation } from "react-i18next";

// const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// export default function UserHomeScreen() {
//   const { t } = useTranslation();

//   /**  
//    * ! אל תשנו שמות קבצים / נתיבים כאן בלי לעדכן גם את מבנה-התיקיות  
//    *   כל ‎to‎ הוא נתיב יחסי לתיקייה ‎user‎ (לכן “./”)
//    */
//   const MENU_ITEMS = [
//     { label: t("studentCard"),      to: "../student-card",  icon: "card-outline" },
//     { label: t("upcomingEvents"),   to: "./events",         icon: "calendar-outline" },
//     { label: t("inbox"),            to: "/(drawer)/inbox",  icon: "mail-outline" },
//     { label: "פורומים",        to: "/forums",         icon: "chatbubble-ellipses-outline" },

//     // Israel-branch additions
//     { label: t("collectGift", "איסוף מתנה"),   to: "./ClaimGift",     icon: "gift-outline" },

//     { label: t("storesList"),       to: "./user-store",     icon: "storefront-outline" },
//     { label: t("sendFeedback"),     to: "./user-feedback",  icon: "pencil-outline" },
//     { label: t("settings"),         to: "./user-settings",  icon: "settings-outline" },
   
//   ];

//   return (
//     <LinearGradient colors={["#fafbff", "#f5f7fa"]} style={styles.container}>
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.titleContainer}>
//           <Text style={styles.title}>{t("welcomeTitle", "ברוכים הבאים לאגודת הסטודנטים")}</Text>
//           <Ionicons name="rocket-outline" size={32} color="#4f6cf7" style={styles.titleIcon} />
//         </View>

//         <View style={styles.menu}>
//           {MENU_ITEMS.map((item) => (
//             <CardButton key={item.to} {...item} />
//           ))}
//         </View>
//       </ScrollView>
//     </LinearGradient>
//   );
// }

// function CardButton({
//   label,
//   to,
//   icon,
// }: {
//   label: string;
//   to: string;
//   icon: string;
// }) {
//   return (
//     <Pressable
//       onPress={() => router.push(to as any)}
//       style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
//       android_ripple={{ color: "rgba(0,0,0,0.15)" }}
//     >
//       <LinearGradient
//         colors={["#4f6cf7", "#d94645"]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 0 }}
//         style={styles.cardBg}
//       >
//         <Ionicons name={icon as any} size={24} color="#fff" style={styles.cardIcon} />
//         <Text style={styles.cardLabel}>{label}</Text>
//       </LinearGradient>
//     </Pressable>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
//     backgroundColor: "#fafbff",
//   },
//   scrollContent: {
//     alignItems: "center",
//     paddingBottom: 40,
//     minHeight: SCREEN_HEIGHT + 20,
//   },
//   titleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 24,
//     marginBottom: 24,
//   },
//   title: { fontSize: 20, fontWeight: "700", color: "#333" },
//   titleIcon: { marginLeft: 8 },
//   menu: { width: "90%", gap: 16 },
//   card: {
//     borderRadius: 16,
//     overflow: "hidden",
//     marginBottom: 12,
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000",
//         shadowOpacity: 0.1,
//         shadowOffset: { width: 0, height: 3 },
//         shadowRadius: 6,
//       },
//       android: { elevation: 4 },
//     }),
//   },
//   cardBg: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 18,
//     paddingHorizontal: 16,
//   },
//   cardIcon: { marginRight: 12 },
//   cardLabel: { color: "#fff", fontSize: 20, fontWeight: "600" },
//   cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
// });

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
  Easing,
  StatusBar as RNStatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { WaveHeader } from "./WaveHeader";
import { router } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const WAVE_HEIGHT = 120;
const OVERLAP = 40;
const DRAWER_WIDTH = 260;

export default function UserHome() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  const MENU_ITEMS = [
    { label: t("studentCard"), to: "../student-card", icon: "card-outline" },
    { label: t("upcomingEvents"), to: "./events", icon: "calendar-outline" },
    { label: t("inbox"), to: "/(drawer)/inbox", icon: "mail-outline" },
    { label: "פורומים", to: "/forums", icon: "chatbubble-ellipses-outline" },
    { label: t("collectGift", "איסוף מתנה"), to: "./ClaimGift", icon: "gift-outline" },
    { label: t("storesList"), to: "./user-store", icon: "storefront-outline" },
    { label: t("sendFeedback"), to: "./user-feedback", icon: "pencil-outline" },
    { label: t("settings"), to: "./user-settings", icon: "settings-outline" },
  ];

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: drawerOpen ? 0 : DRAWER_WIDTH,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [drawerOpen]);

  return (
    <>
      <RNStatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.root}>
        <LinearGradient colors={["#ffebee", "#ffcdd2"]} style={styles.gradient}>
          <WaveHeader />

          {drawerOpen && (
            <Pressable
              style={[styles.overlay, { top: insets.top }]}
              onPress={() => setDrawerOpen(false)}
            />
          )}

          {!drawerOpen && (
            <Pressable
              onPress={() => setDrawerOpen(true)}
              style={[styles.menuButton, { top: insets.top + 8 }]}
            >
              <Ionicons name="menu-outline" size={28} color="#b71c1c" />
            </Pressable>
          )}

          <Animated.View
            style={[
              styles.drawer,
              { transform: [{ translateX }], top: insets.top },
            ]}
          >
            <Text style={styles.drawerTitle}>תפריט</Text>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.to}
                onPress={() => {
                  setDrawerOpen(false);
                  router.push(item.to as any);
                }}
                style={styles.drawerItem}
              >
                <View style={styles.drawerItemRow}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color="#2a3f5f"
                    style={styles.drawerIcon}
                  />
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                </View>
              </Pressable>
            ))}

            <Pressable
              onPress={() => setDrawerOpen(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close-outline" size={28} color="#b71c1c" />
            </Pressable>
          </Animated.View>

          <View
            style={[
              styles.content,
              { marginTop: WAVE_HEIGHT - OVERLAP + insets.top },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {t("homeOfStudents", "דף הבית של הסטודנטים")}
              </Text>
            </View>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t("relevantNotices", "הודעות רלוונטיות")}
                </Text>
                <View style={styles.card}>
                  <Text style={styles.cardText}>• {t("notice1", "כותרת הודעה 1")}</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardText}>• {t("notice2", "כותרת הודעה 2")}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row-reverse",
  },
  gradient: {
    flex: 1,
    writingDirection: "rtl",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 15,
  },
  menuButton: {
    position: "absolute",
    right: 16,
    zIndex: 30,
    padding: 4,
  },
  drawer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    zIndex: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: -4, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "right",
  },
  drawerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  drawerItemRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  drawerIcon: {
    marginLeft: 12,
  },
  drawerItemText: {
    fontSize: 16,
    color: "#2a3f5f",
    textAlign: "right",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    left: 16,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    height: 56,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#b71c1c",
    textAlign: "right",
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#b71c1c",
    marginBottom: 8,
    textAlign: "right",
  },
  card: {
    backgroundColor: "#ffebee",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#880e4f",
    textAlign: "right",
  },
});


