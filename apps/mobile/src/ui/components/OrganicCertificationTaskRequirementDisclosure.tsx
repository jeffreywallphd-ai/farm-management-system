import { useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";

import type { PlanningTask } from "../../domain/planning/Planning";
import {
  getOrganicCertificationTaskRequirementExplanation,
  isOrganicCertificationTask,
  type OrganicRequirementReference,
} from "../screens/OrganicCertificationTaskRequirementModel";
import { theme } from "../theme/theme";

export function OrganicCertificationTaskRequirementDisclosure({ task }: { task: PlanningTask }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOrganicCertificationTask(task)) {
    return null;
  }

  const explanation = getOrganicCertificationTaskRequirementExplanation(task);

  return (
    <View style={styles.requirementBlock}>
      <View style={styles.requirementHeader}>
        <Text style={styles.requirementTitle}>Summary of USDA Requirements</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsExpanded((current) => !current)}
        style={styles.requirementToggle}
      >
        <Text style={styles.requirementIndicator}>{isExpanded ? "Hide" : "Open"}</Text>
      </Pressable>
      {isExpanded ? (
        <View style={styles.requirementContent}>
          <Text style={styles.body}>{explanation.reason}</Text>
          <Text style={styles.detail}>USDA/NOP references for this task:</Text>
          {explanation.references.map((reference) => (
            <Pressable
              accessibilityRole="link"
              key={reference.key}
              onPress={() => confirmOpenRequirement(reference)}
              style={styles.requirementLink}
            >
              <Text style={styles.requirementLinkText}>{reference.label}</Text>
            </Pressable>
          ))}
          <Text style={styles.detail}>
            Links open official USDA or eCFR pages in your browser after confirmation. No farm records are sent.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function confirmOpenRequirement(reference: OrganicRequirementReference) {
  Alert.alert("Open USDA requirement?", `Open ${reference.label} in your browser?`, [
    { text: "Cancel", style: "cancel" },
    {
      text: "Open browser",
      onPress: () => {
        Linking.openURL(reference.url).catch(() => {
          Alert.alert(
            "Link could not be opened",
            "Open the USDA requirement from your browser when you have a connection.",
          );
        });
      },
    },
  ]);
}

const styles = StyleSheet.create({
  body: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  detail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  requirementBlock: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
  },
  requirementHeader: {
    gap: theme.spacing.xs,
  },
  requirementTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "800",
    lineHeight: 24,
  },
  requirementToggle: {
    alignItems: "flex-start",
    justifyContent: "center",
    minHeight: theme.spacing.touchTarget,
  },
  requirementIndicator: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "800",
    lineHeight: 20,
  },
  requirementContent: {
    gap: theme.spacing.sm,
  },
  requirementLink: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.secondary,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: theme.spacing.touchTarget,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  requirementLinkText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "800",
    lineHeight: 20,
  },
});
