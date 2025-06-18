// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false }} />;
}
