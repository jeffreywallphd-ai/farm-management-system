import type { ReactNode } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

import { theme } from "../theme/theme";

const cardTexture = require("../../../assets/images/farm-card-texture.png");

export function Card({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "primary" | "tinted" | "warm";
}) {
  if (variant === "primary") {
    return (
      <ImageBackground imageStyle={styles.primaryTexture} source={cardTexture} style={[styles.card, styles.primaryCard]}>
        {children}
      </ImageBackground>
    );
  }

  return <View style={[styles.card, variant === "tinted" ? styles.tintedCard : null, variant === "warm" ? styles.warmCard : null]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    elevation: 2,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    shadowColor: "#3A2F1E",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  primaryCard: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryPressed,
    overflow: "hidden",
  },
  primaryTexture: {
    borderRadius: theme.radius.lg,
    opacity: 0.95,
  },
  tintedCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  warmCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
});
