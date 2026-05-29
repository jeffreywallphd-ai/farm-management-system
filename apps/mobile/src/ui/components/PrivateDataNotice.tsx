import { StyleSheet, Text, View } from "react-native";

import { theme } from "../theme/theme";

export function PrivateDataNotice({ text }: { text: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Private and local</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: "800",
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
