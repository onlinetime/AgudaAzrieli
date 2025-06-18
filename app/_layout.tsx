// app/_layout.tsx
import "../internationalization/internationalization";
import React from "react";

import { Stack } from "expo-router";
import {
  ThemeProvider,
  DarkTheme as NavDark,
  DefaultTheme as NavLight,
} from "@react-navigation/native";

import { SettingsProvider, useSettings } from "../contexts/SettingsContext";
import { lightTheme, darkTheme } from "../libs/theme";

function InnerLayout() {
  const { darkMode, language } = useSettings();

  const theme = darkMode
    ? { ...NavDark, colors: { ...NavDark.colors, ...darkTheme.colors } }
    : { ...NavLight, colors: { ...NavLight.colors, ...lightTheme.colors } };

  return (
    <ThemeProvider value={theme}>
      {/* key על השפה — כשמשתנה השפה ה-Stack כולו מתאפס ומתרנדר מחדש */}
      <Stack key={language} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <InnerLayout />
    </SettingsProvider>
  );
}
