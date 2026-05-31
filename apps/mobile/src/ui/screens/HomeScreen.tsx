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
          <Text style={styles.prompt}>What happened on the farm?</Text>
          <Button
            label="Record farm note"
            onPress={() => pushRoute(router, "/farm-events/new")}
            size="hero"
          />
        </View>
      </Card>
      <View style={styles.secondaryActions}>
        <Button label="Review farm notes" onPress={() => pushRoute(router, "/farm-events")} size="large" variant="secondary" />
        <Button label="Farm setup" onPress={() => pushRoute(router, "/setup")} size="large" variant="secondary" />
      </View>
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
  secondaryActions: {
    gap: theme.spacing.sm,
  },
});
