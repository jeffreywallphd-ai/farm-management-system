import { Platform } from "react-native";

const headingFontWeight = Platform.select<"normal" | "700">({ android: "normal", default: "700" }) ?? "700";

export const typography = {
  bodyFontFamily: Platform.select({ android: "sans-serif", default: undefined }),
  title: 30,
  heading: 22,
  headingFontFamily: Platform.select({ android: "serif", ios: "Georgia", default: "serif" }),
  headingFontWeight,
  section: 18,
  body: 16,
  small: 14,
  caption: 12,
} as const;
