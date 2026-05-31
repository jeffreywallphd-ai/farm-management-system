import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { completeCorePlacesSetup } from "../../application/use-cases/complete-core-places-setup/completeCorePlacesSetup";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import { systemClock } from "../../infrastructure/system/clock";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FarmPlacesEditor } from "../components/ReferenceEditors";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { replaceRoute } from "../navigation";
import { theme } from "../theme/theme";

export function FarmPlacesSetupScreen({
  farm,
  locations,
  repository,
  onReferenceSaved,
  onSetupCompleted,
}: {
  farm: Farm;
  locations: FarmLocation[];
  repository: FarmReferenceRepository;
  onReferenceSaved: () => Promise<void>;
  onSetupCompleted: (farm: Farm) => void;
}) {
  const router = useRouter();
  const [isContinuing, setIsContinuing] = useState(false);

  async function handleContinue() {
    setIsContinuing(true);

    try {
      const updatedFarm = await completeCorePlacesSetup(farm.id, {
        clock: systemClock,
        repository,
      });

      if (updatedFarm) {
        onSetupCompleted(updatedFarm);
      }

      replaceRoute(router, "/setup");
    } finally {
      setIsContinuing(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Step 2 of 2"
        supportingText="Add the places you use every day so later voice and photo notes are easier to find."
        title="Set up farm places"
      />
      <Card>
        <Text style={styles.helperText}>
          Start with the core places: main fields, greenhouses, tunnels, wash/pack, storage, coolers, or barns. You can keep this light and add more later.
        </Text>
        <FarmPlacesEditor
          farmId={farm.id}
          locations={locations}
          onReferenceSaved={onReferenceSaved}
          repository={repository}
        />
        <Button
          disabled={isContinuing}
          label={isContinuing ? "Continuing..." : "Continue"}
          onPress={handleContinue}
          size="large"
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
