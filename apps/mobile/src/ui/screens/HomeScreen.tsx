import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { Farm } from "../../domain/farm/Farm";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { pushRoute } from "../navigation";
import { theme } from "../theme/theme";

export function HomeScreen({ farmName }: { farmName: Farm["name"] }) {
  const router = useRouter();

  return (
    <Screen>
      <PageHeader
        eyebrow="Home"
        supportingText="Voice and photos first. Capture the note while the work is still fresh."
        title={farmName}
      />
      <Card>
        <View style={styles.primaryAction}>
          <Text style={styles.prompt}>Record a Farm Event</Text>
          <Text style={styles.description}>Capture what happened with a quick voice note and optional photos.</Text>
          <Button
            label="Record Event"
            onPress={() => pushRoute(router, "/farm-events/new")}
            size="hero"
          />
        </View>
      </Card>
      <Card>
        <View style={styles.primaryAction}>
          <Text style={styles.prompt}>Track/Manage Farm Tasks</Text>
          <Text style={styles.description}>Move planned work through task boards and record farm events from task cards.</Text>
          <Button label="Manage Tasks" onPress={() => pushRoute(router, "/planning/boards")} size="hero" />
        </View>
      </Card>
      <Card>
        <View style={styles.primaryAction}>
          <Text style={styles.prompt}>Plan Farm Work</Text>
          <Text style={styles.description}>Create goals, subgoals, single tasks, and short-term work plans.</Text>
          <Button label="Plan Work" onPress={() => pushRoute(router, "/planning")} size="large" variant="secondary" />
        </View>
      </Card>
      <Card>
        <View style={styles.primaryAction}>
          <Text style={styles.prompt}>Setup Farm Places, Crops, and Materials</Text>
          <Text style={styles.description}>Keep the local farm context that makes notes, tasks, and records easier to organize.</Text>
          <Button label="Open Farm Setup" onPress={() => pushRoute(router, "/setup")} size="large" variant="secondary" />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  primaryAction: {
    gap: theme.spacing.lg,
  },
  prompt: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading,
    fontWeight: "800",
    lineHeight: 30,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
});
