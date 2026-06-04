import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const theme = {
  colors,
  spacing,
  typography,
  radius: {
    sm: 6,
    md: 8,
    lg: 14,
    xl: 22,
  },
} as const;
