import { StyleSheet, Text, View } from "react-native";

import { theme } from "../theme/theme";

export function LocalSaveConfirmation({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  text: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.body,
    fontWeight: "800",
  },
});
