// app/_layout.tsx
import "../firebase";
import React from "react";
import { Slot } from "expo-router";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { useColorScheme } from "../components/useColorScheme";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect } from "react";
import "react-native-reanimated";

export default function RootLayout() {
  // נתיב מותאם לשורש הפרויקט (app/_layout.tsx נמצא בתיקיית app)
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  // העבירו את ה־preventAutoHide לתוך אפקט
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  // זריקת שגיאה אם לא נטען
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // הסתרת הספלש לאחר טעינת הגופנים
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const scheme = useColorScheme();

  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* תמיד נטען את ה־Slot, גם אם הגופנים עדיין בטעינה */}
      <Slot />

      {/* במידה ורוצים להראות overlay טעינה:
        {!loaded && (
          <View style={StyleSheet.absoluteFill}>
            <ActivityIndicator size="large" />
          </View>
        )}
      */}
    </ThemeProvider>
  );
}
