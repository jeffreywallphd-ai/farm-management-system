import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme/theme";
import { useUiDensity } from "../theme/UiDensity";
import { Card } from "./Card";

export function CollapsibleCard({
  title,
  detail,
  children,
  isExpanded,
  rootLevelHeader = false,
  onToggle,
}: {
  title: string;
  detail?: string;
  children: ReactNode;
  isExpanded: boolean;
  rootLevelHeader?: boolean;
  onToggle: () => void;
}) {
  const density = useUiDensity();

  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        onPress={onToggle}
        style={[
          styles.header,
          { gap: density.isUngloved ? theme.spacing.sm : theme.spacing.md, minHeight: density.inputMinHeight },
          rootLevelHeader
            ? [
                styles.rootCardHeader,
                {
                  marginHorizontal: -density.cardPadding,
                  marginTop: -density.cardPadding,
                  paddingHorizontal: density.cardPadding,
                  paddingVertical: density.isUngloved ? theme.spacing.md : theme.spacing.lg,
                },
              ]
            : null,
        ]}
      >
        <View style={styles.headingText}>
          <Text style={[styles.title, density.isUngloved ? styles.compactTitle : null, rootLevelHeader ? styles.rootCardTitle : null]}>{title}</Text>
          {detail && !rootLevelHeader ? <Text style={[styles.detail, density.isUngloved ? styles.compactDetail : null]}>{detail}</Text> : null}
        </View>
        <Text style={[styles.indicator, density.isUngloved ? styles.compactIndicator : null, rootLevelHeader ? styles.rootCardIndicator : null]}>{isExpanded ? "Hide" : "Open"}</Text>
      </Pressable>
      {detail && rootLevelHeader ? <Text style={[styles.rootCardBodyDetail, density.isUngloved ? styles.compactDetail : null]}>{detail}</Text> : null}
      {isExpanded ? children : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rootCardHeader: {
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  headingText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.section,
    fontWeight: theme.typography.headingFontWeight,
  },
  rootCardTitle: {
    color: theme.colors.onPrimary,
  },
  detail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  rootCardBodyDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  indicator: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: "800",
  },
  rootCardIndicator: {
    color: theme.colors.primarySoft,
  },
  compactTitle: {
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  compactDetail: {
    fontSize: theme.typography.caption,
    lineHeight: 17,
  },
  compactIndicator: {
    fontSize: theme.typography.small,
    lineHeight: 18,
  },
});
