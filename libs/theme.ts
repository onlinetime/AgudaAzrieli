import { DefaultTheme, DarkTheme, Theme } from "@react-navigation/native";

export const lightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#4f6cf7",
    background: "#fafbff",
    card: "#ffffff",
    text: "#000000",
  },
};

export const darkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#4f6cf7",
    background: "#000000",
    card: "#121212",
    text: "#ffffff",
  },
};
