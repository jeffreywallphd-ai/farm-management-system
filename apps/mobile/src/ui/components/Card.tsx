import { createContext, useContext, type ReactNode } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

import { theme } from "../theme/theme";
import { useUiDensity } from "../theme/UiDensity";

const cardTexture = require("../../../assets/images/farm-card-texture.png");
const RootCardHeaderContext = createContext(false);

export function useRootCardHeaderStyle() {
  return useContext(RootCardHeaderContext);
}

export function Card({
  children,
  rootLevelHeader = false,
  variant = "default",
}: {
  children: ReactNode;
  rootLevelHeader?: boolean;
  variant?: "default" | "primary" | "tinted" | "warm";
}) {
  const density = useUiDensity();
  const densityStyle = { gap: density.cardGap, padding: density.cardPadding };

  if (variant === "primary") {
    return (
      <RootCardHeaderContext.Provider value={rootLevelHeader}>
        <ImageBackground imageStyle={styles.primaryTexture} source={cardTexture} style={[styles.card, densityStyle, styles.primaryCard]}>
          {children}
        </ImageBackground>
      </RootCardHeaderContext.Provider>
    );
  }

  return (
    <RootCardHeaderContext.Provider value={rootLevelHeader}>
      <View style={[styles.card, densityStyle, variant === "tinted" ? styles.tintedCard : null, variant === "warm" ? styles.warmCard : null]}>{children}</View>
    </RootCardHeaderContext.Provider>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    elevation: 2,
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
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
  },
});
