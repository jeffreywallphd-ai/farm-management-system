import { StyleSheet, Text, View } from "react-native";

import { theme } from "../theme/theme";

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
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {supportingText ? <Text style={styles.supportingText}>{supportingText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.secondary,
    fontSize: theme.typography.small,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.textPrimary,
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
