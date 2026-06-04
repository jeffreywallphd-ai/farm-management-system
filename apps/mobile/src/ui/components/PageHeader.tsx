import { Image, StyleSheet, Text, View } from "react-native";

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
  return (
    <View style={styles.container}>
      <Image accessible={false} source={headerIllustration} style={styles.illustration} />
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {supportingText ? <Text style={styles.supportingText}>{supportingText}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    gap: theme.spacing.sm,
    minHeight: 142,
    overflow: "hidden",
    paddingVertical: theme.spacing.sm,
  },
  illustration: {
    height: 112,
    opacity: 0.72,
    position: "absolute",
    right: -18,
    top: 0,
    width: 210,
  },
  copy: {
    gap: theme.spacing.sm,
    paddingRight: 102,
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
    fontWeight: "800",
    lineHeight: 36,
  },
  supportingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
});
