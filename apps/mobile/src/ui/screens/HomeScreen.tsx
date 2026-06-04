import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import type { Farm } from "../../domain/farm/Farm";
import { useDatabase } from "../../bootstrap/providers/DatabaseProvider";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { ThemedIcon, type ThemedIconName } from "../components/ThemedIcon";
import { pushRoute } from "../navigation";
import { theme } from "../theme/theme";
import { summarizeHomeTaskCounts } from "./HomeScreenModel";

export function HomeScreen({ farm }: { farm: Farm }) {
  const database = useDatabase();
  const router = useRouter();
  const [taskCounts, setTaskCounts] = useState({ blockedTasks: 0, workableTasks: 0 });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadTaskCounts() {
        if (database.status !== "ready") {
          return;
        }

        const tasks = await database.planningRepository.listTasks(farm.id);
        if (isActive) {
          setTaskCounts(summarizeHomeTaskCounts(tasks));
        }
      }

      loadTaskCounts().catch(() => {
        if (isActive) {
          setTaskCounts({ blockedTasks: 0, workableTasks: 0 });
        }
      });

      return () => {
        isActive = false;
      };
    }, [database, farm.id]),
  );

  return (
    <Screen>
      <PageHeader
        eyebrow="Home"
        supportingText="Private records. Clear work. Farm-owned evidence."
        title={farm.name}
      />
      <Card variant="primary">
        <View style={styles.featuredAction}>
          <View style={styles.cardHeadingRow}>
            <HomeIcon kind="record" tone="light" />
            <Text style={styles.featuredPrompt}>Record a Farm Event</Text>
          </View>
          <Text style={styles.featuredDescription}>Capture what happened with a quick voice note and optional photos.</Text>
          <Button
            icon="microphone"
            label="Record Event"
            onPress={() => pushRoute(router, "/farm-events/new")}
            size="hero"
            variant="secondary"
          />
        </View>
      </Card>
      <Card variant="warm">
        <View style={styles.taskAction}>
          <View style={styles.cardHeadingRow}>
            <HomeIcon kind="tasks" />
            <Text style={styles.prompt}>Track Farm Tasks</Text>
          </View>
          <Text style={styles.description}>Move planned work through task boards and record farm events from task cards.</Text>
          <View style={styles.taskIndicatorGrid}>
            <TaskIndicator label="Workable" value={taskCounts.workableTasks} />
            <TaskIndicator label="Blocked" value={taskCounts.blockedTasks} />
          </View>
          <Button icon="board" label="Track Work" onPress={() => pushRoute(router, "/planning/boards")} size="hero" />
        </View>
      </Card>
      <Card>
        <View style={styles.supportingAction}>
          <View style={styles.cardHeadingRow}>
            <HomeIcon kind="plan" />
            <Text style={styles.prompt}>Plan Farm Work</Text>
          </View>
          <Text style={styles.description}>Create goals, subgoals, single tasks, and short-term work plans.</Text>
          <Button
            icon="task"
            label="Plan Work"
            onPress={() => pushRoute(router, "/planning")}
            size="large"
            trailingIcon="arrowRight"
            variant="secondary"
          />
        </View>
      </Card>
      <Card>
        <View style={styles.supportingAction}>
          <View style={styles.cardHeadingRow}>
            <HomeIcon kind="setup" />
            <Text style={styles.prompt}>Setup Farm Places, Crops, and Materials</Text>
          </View>
          <Text style={styles.description}>Keep the local farm context that makes notes, tasks, and records easier to organize.</Text>
          <Button
            icon="leaf"
            label="Open Farm Setup"
            onPress={() => pushRoute(router, "/setup")}
            size="large"
            trailingIcon="arrowRight"
            variant="secondary"
          />
        </View>
      </Card>
    </Screen>
  );
}

function TaskIndicator({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.taskIndicator}>
      <Text style={styles.taskIndicatorValue}>{value}</Text>
      <Text style={styles.taskIndicatorLabel}>{label}</Text>
    </View>
  );
}

function HomeIcon({ kind, tone = "default" }: { kind: "record" | "tasks" | "plan" | "setup"; tone?: "default" | "light" }) {
  const isLight = tone === "light";
  const iconNameByKind: Record<typeof kind, ThemedIconName> = {
    plan: "task",
    record: "microphone",
    setup: "leaf",
    tasks: "board",
  };
  const color = isLight ? theme.colors.onPrimary : theme.colors.primary;
  const accentColor = isLight ? theme.colors.primarySoft : theme.colors.secondary;

  return (
    <View style={[styles.iconBadge, isLight ? styles.iconBadgeLight : null]}>
      <ThemedIcon accentColor={accentColor} color={color} name={iconNameByKind[kind]} size={40} />
    </View>
  );
}

const styles = StyleSheet.create({
  featuredAction: {
    gap: theme.spacing.lg,
  },
  taskAction: {
    gap: theme.spacing.lg,
  },
  supportingAction: {
    gap: theme.spacing.md,
  },
  cardHeadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  featuredPrompt: {
    flex: 1,
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.heading,
    fontWeight: theme.typography.headingFontWeight,
    lineHeight: 30,
  },
  featuredDescription: {
    color: theme.colors.primarySoft,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  prompt: {
    flex: 1,
    color: theme.colors.primary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.heading,
    fontWeight: theme.typography.headingFontWeight,
    lineHeight: 30,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  taskIndicator: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.controlBorder,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 84,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  taskIndicatorGrid: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  taskIndicatorLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    fontWeight: "700",
    letterSpacing: 0,
    textAlign: "center",
    textTransform: "uppercase",
  },
  taskIndicatorValue: {
    color: theme.colors.primary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.title,
    fontWeight: theme.typography.headingFontWeight,
    lineHeight: 36,
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySubtle,
    borderColor: theme.colors.iconBorder,
    borderRadius: 36,
    borderWidth: 1,
    height: 72,
    justifyContent: "center",
    shadowColor: "#4E6545",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: 72,
  },
  iconBadgeLight: {
    backgroundColor: "rgba(220, 231, 198, 0.18)",
    borderColor: "rgba(220, 231, 198, 0.45)",
  },
});
