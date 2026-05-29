import { StyleSheet, Text, View } from "react-native";

import { theme } from "../theme/theme";

export function LocalDataNotice() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved on this device</Text>
      <Text style={styles.text}>Works without reception. Other devices will not see this setup yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.body,
    fontWeight: "800",
  },
  text: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
