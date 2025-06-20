// app/(app)/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import {
  ThemeProvider,
  DarkTheme as NavDark,
  DefaultTheme as NavLight,
} from "@react-navigation/native";

import { useSettings } from "../../contexts/SettingsContext";
import { lightTheme, darkTheme } from "../../libs/theme";

export default function UserLayout() {
  const { darkMode, language } = useSettings();

  const theme = darkMode
    ? { ...NavDark, colors: { ...NavDark.colors, ...darkTheme.colors } }
    : { ...NavLight, colors: { ...NavLight.colors, ...lightTheme.colors } };

  return (
    <ThemeProvider value={theme}>
      {/* key על השפה בכדי לכפות רינדור מחדש */}
      <Stack
        key={language}
        screenOptions={{
          headerTitle: "",            // רק החץ
          headerTitleAlign: "center",
          contentStyle: { backgroundColor: undefined },
          //headerBackTitleVisible: false,
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}
