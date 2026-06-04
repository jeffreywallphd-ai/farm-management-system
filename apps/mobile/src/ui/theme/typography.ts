import { Platform } from "react-native";

export const typography = {
  bodyFontFamily: Platform.select({ android: "sans-serif", default: undefined }),
  title: 30,
  heading: 22,
  headingFontFamily: Platform.select({ android: "serif", ios: "Georgia", default: "serif" }),
  section: 18,
  body: 16,
  small: 14,
  caption: 12,
} as const;
