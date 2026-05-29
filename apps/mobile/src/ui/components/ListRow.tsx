import { StyleSheet, Text, View } from "react-native";

import { theme } from "../theme/theme";

export function ListRow({ title }: { title: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
  },
});
