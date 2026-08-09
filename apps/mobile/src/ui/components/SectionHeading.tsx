import { StyleSheet, Text, View } from "react-native";

import { useUiDensity } from "../theme/UiDensity";
import { theme } from "../theme/theme";
import { useRootCardHeaderStyle } from "./Card";

export function SectionHeading({
  title,
  detail,
  rootCardHeader,
}: {
  title: string;
  detail?: string;
  rootCardHeader?: boolean;
}) {
  const useRootCardHeader = useRootCardHeaderStyle();
  const showRootCardHeader = rootCardHeader ?? useRootCardHeader;
  const density = useUiDensity();

  if (showRootCardHeader) {
    return (
      <View style={[styles.rootCardHeadingBlock, { gap: density.isUngloved ? theme.spacing.sm : theme.spacing.md }]}>
        <View
          style={[
            styles.container,
            styles.rootCardHeader,
            {
              marginHorizontal: -density.cardPadding,
              marginTop: -density.cardPadding,
              paddingHorizontal: density.cardPadding,
              paddingVertical: density.isUngloved ? theme.spacing.md : theme.spacing.lg,
            },
          ]}
        >
          <Text style={[styles.title, density.isUngloved ? styles.compactTitle : null, styles.rootCardTitle]}>{title}</Text>
        </View>
        {detail ? <Text style={[styles.rootCardBodyDetail, density.isUngloved ? styles.compactDetail : null]}>{detail}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, density.isUngloved ? styles.compactTitle : null]}>{title}</Text>
      {detail ? <Text style={[styles.detail, density.isUngloved ? styles.compactDetail : null]}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  rootCardHeadingBlock: {
  },
  rootCardHeader: {
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  title: {
    color: theme.colors.primary,
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
  compactTitle: {
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  compactDetail: {
    fontSize: theme.typography.caption,
    lineHeight: 17,
  },
});
