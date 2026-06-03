import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { ORGANIC_EVIDENCE_CATEGORY_LABELS, type OrganicEvidenceCategory } from "../../domain/organic/OrganicEvidenceLink";
import { pushRoute } from "../navigation";
import { theme } from "../theme/theme";
import { Button } from "./Button";

export function OrganicFarmEventPrompt({
  category,
}: {
  category: OrganicEvidenceCategory;
}) {
  const router = useRouter();
  const label = ORGANIC_EVIDENCE_CATEGORY_LABELS[category];

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        For voice/photo evidence, record a farm event and choose {label} as the certification requirement.
      </Text>
      <Button
        label="Record evidence event"
        onPress={() => pushRoute(router, `/farm-events/new?organicCategory=${encodeURIComponent(category)}`)}
        size="large"
        variant="secondary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
});
