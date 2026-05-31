import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme/theme";
import { Card } from "./Card";

export function CollapsibleCard({
  title,
  detail,
  children,
  isExpanded,
  onToggle,
}: {
  title: string;
  detail?: string;
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card>
      <Pressable accessibilityRole="button" onPress={onToggle} style={styles.header}>
        <View style={styles.headingText}>
          <Text style={styles.title}>{title}</Text>
          {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        </View>
        <Text style={styles.indicator}>{isExpanded ? "Hide" : "Open"}</Text>
      </Pressable>
      {isExpanded ? children : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    minHeight: theme.spacing.touchTarget,
  },
  headingText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.section,
    fontWeight: "800",
  },
  detail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  indicator: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: "800",
  },
});
