// app/(app)/admin/_layout.tsx
import "../../../internationalization/internationalization";
import React from "react";
import { Stack } from "expo-router";

import {
  ThemeProvider,
  DarkTheme as NavDark,
  DefaultTheme as NavLight,
} from "@react-navigation/native";

import { useSettings } from "../../../contexts/SettingsContext";
import { lightTheme, darkTheme } from "../../../libs/theme";

export default function AdminLayout() {
  const { darkMode, language } = useSettings();

  const theme = darkMode
    ? { ...NavDark, colors: { ...NavDark.colors, ...darkTheme.colors } }
    : { ...NavLight, colors: { ...NavLight.colors, ...lightTheme.colors } };

  return (
    <ThemeProvider value={theme}>
      {/* key על השפה — כדי שכל המסכים יתעדכנו כשמשתנה השפה */}
      <Stack
        key={language}
        screenOptions={{
          headerShown: false,
          //headerBackTitleVisible: false,
          headerTitleAlign: "center",
          contentStyle: { backgroundColor: undefined },
        }}
      />
    </ThemeProvider>
  );
}
