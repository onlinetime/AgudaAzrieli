// app/_layout.tsx
import "../firebase";
import React, { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme as deviceColorScheme } from "react-native";
import { View as ThemedView, Text } from "../components/Themed";
import { View, Switch, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

export default function RootLayout() {
  const system = deviceColorScheme() ?? "light";
  const [scheme, setScheme] = useState<"light" | "dark">(system);
  const opacity = useSharedValue(1);

  const toggle = () => {
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setScheme)(prev => (prev === "light" ? "dark" : "light"));
      opacity.value = withTiming(1, { duration: 200 });
    });
  };

  const currentTheme = scheme === "dark" ? DarkTheme : DefaultTheme;
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: currentTheme.colors.background,
  }));

  return (
    <ThemeProvider value={currentTheme}>
      <AnimatedThemedView style={[styles.root, animatedStyle]}>
        <View style={styles.header}>
          <Text>{scheme === "dark" ? "Dark Mode" : "Light Mode"}</Text>
          <Switch value={scheme === "dark"} onValueChange={toggle} />
        </View>

        {/* this is where nested layouts or pages render */}
        <Slot />
      </AnimatedThemedView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 10,
  },
});
