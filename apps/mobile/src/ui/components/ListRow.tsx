import { Pressable, StyleSheet, Text, View } from "react-native";

import { useUiDensity } from "../theme/UiDensity";
import { theme } from "../theme/theme";

export function ListRow({
  title,
  detail,
  onPress,
}: {
  title: string;
  detail?: string;
  onPress?: () => void;
}) {
  const density = useUiDensity();
  const content = (
    <View
      style={[
        styles.row,
        {
          minHeight: density.inputMinHeight,
          paddingHorizontal: density.inputPaddingHorizontal,
          paddingVertical: density.isUngloved ? theme.spacing.xs : theme.spacing.sm,
        },
      ]}
    >
      <Text style={[styles.title, density.isUngloved ? styles.compactTitle : null]}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    justifyContent: "center",
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  compactTitle: {
    fontSize: theme.typography.small,
    lineHeight: 18,
  },
  detail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
