import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useUiDensity } from "../theme/UiDensity";
import { theme } from "../theme/theme";

const headerIllustration = require("../../../assets/images/farm-header-illustration.png");

export function PageHeader({
  eyebrow,
  title,
  supportingText,
}: {
  eyebrow?: string;
  title: string;
  supportingText?: string;
}) {
  const density = useUiDensity();

  return (
    <View style={[styles.container, { minHeight: density.isUngloved ? 144 : 156 }]}>
      <Image accessible={false} source={headerIllustration} style={styles.illustration} />
      <Pressable
        accessibilityLabel={`Switch to ${density.isUngloved ? "gloved" : "ungloved"} layout`}
        accessibilityRole="switch"
        accessibilityState={{ checked: density.isUngloved }}
        onPress={density.toggleMode}
        style={styles.densityToggle}
      >
        <Text style={[styles.densityToggleText, density.isUngloved ? null : styles.densityToggleTextActive]}>Gloved</Text>
        <Text style={[styles.densityToggleText, density.isUngloved ? styles.densityToggleTextActive : null]}>Sleek</Text>
      </Pressable>
      <View style={[styles.copy, { gap: density.isUngloved ? theme.spacing.xs : theme.spacing.sm }]}>
        {eyebrow ? <Text style={[styles.eyebrow, density.isUngloved ? styles.compactEyebrow : null]}>{eyebrow}</Text> : null}
        <Text style={[styles.title, density.isUngloved ? styles.compactTitle : null]}>{title}</Text>
        {supportingText ? <Text style={[styles.supportingText, density.isUngloved ? styles.compactSupportingText : null]}>{supportingText}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    gap: theme.spacing.sm,
    minHeight: 156,
    paddingVertical: theme.spacing.sm,
  },
  densityToggle: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.secondary,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 2,
    minHeight: 32,
    padding: 3,
    position: "absolute",
    right: 0,
    top: 116,
    zIndex: 2,
  },
  densityToggleText: {
    borderRadius: theme.radius.md,
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 4,
  },
  densityToggleTextActive: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.onPrimary,
  },
  illustration: {
    height: 112,
    opacity: 0.72,
    position: "absolute",
    right: -theme.spacing.lg,
    top: 0,
    width: 210,
  },
  copy: {
    paddingRight: 126,
  },
  eyebrow: {
    color: theme.colors.secondary,
    fontSize: theme.typography.small,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.primary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.title,
    fontWeight: theme.typography.headingFontWeight,
    lineHeight: 36,
  },
  supportingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  compactEyebrow: {
    fontSize: theme.typography.caption,
    lineHeight: 16,
  },
  compactTitle: {
    fontSize: theme.typography.heading,
    lineHeight: 28,
  },
  compactSupportingText: {
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
