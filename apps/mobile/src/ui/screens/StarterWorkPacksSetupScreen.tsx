import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { completeStarterWorkPacksSetup } from "../../application/use-cases/complete-starter-work-packs-setup/completeStarterWorkPacksSetup";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import type { Farm } from "../../domain/farm/Farm";
import { systemClock } from "../../infrastructure/system/clock";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { replaceRoute } from "../navigation";
import { theme } from "../theme/theme";
import { FarmWorkPackSetup } from "./FarmDashboardScreen";

export function StarterWorkPacksSetupScreen({
  farm,
  farmReferenceRepository,
  planningRepository,
  onSetupCompleted,
}: {
  farm: Farm;
  farmReferenceRepository: FarmReferenceRepository;
  planningRepository: PlanningRepository;
  onSetupCompleted: (farm: Farm) => void;
}) {
  const router = useRouter();
  const [isSkipping, setIsSkipping] = useState(false);

  async function handleSkip() {
    setIsSkipping(true);

    try {
      const updatedFarm = await completeStarterWorkPacksSetup(farm.id, {
        clock: systemClock,
        repository: farmReferenceRepository,
      });

      if (updatedFarm) {
        onSetupCompleted(updatedFarm);
      }

      replaceRoute(router, "/home");
    } finally {
      setIsSkipping(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Step 3 of 3"
        supportingText="Choose starter goals and tasks now, or save this setup for later."
        title="Choose starter work"
      />
      <Card>
        <Text style={styles.helperText}>
          Starter packs add practical goals and tasks for the farm work you do. You can activate, deactivate, or add more later from Farm setup.
        </Text>
        <FarmWorkPackSetup farmId={farm.id} planningRepository={planningRepository} />
        <Button
          disabled={isSkipping}
          label={isSkipping ? "Saving..." : "Skip and save for later"}
          onPress={handleSkip}
          size="large"
          variant="secondary"
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
});
