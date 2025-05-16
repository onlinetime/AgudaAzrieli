// components/Themed.tsx

import { Text as DefaultText, View as DefaultView } from "react-native";
import { useTheme } from "@react-navigation/native";

export type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

/**
 * בוחר צבע מתוך ה-ThemeProvider של React Navigation
 * או מתוך override מקומי (lightColor/darkColor)
 */
function useThemeColor(
  props: { lightColor?: string; darkColor?: string },
  colorName: "text" | "background"
) {
  const { colors, dark } = useTheme();
  // קודם תעדיף override אם הוגדר
  const override = dark ? props.darkColor : props.lightColor;
  if (override) {
    return override;
  }
  // אם אין override – קח מתוך colors של ה-ThemeContext
  return colors[colorName];
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ lightColor, darkColor }, "text");
  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ lightColor, darkColor }, "background");
  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
