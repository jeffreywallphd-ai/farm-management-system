import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";

import { listLocations } from "../application/use-cases/list-locations/listLocations";
import type { Farm } from "../domain/farm/Farm";
import type { FarmLocation } from "../domain/farm/FarmLocation";
import { Card } from "../ui/components/Card";
import { PageHeader } from "../ui/components/PageHeader";
import { Screen } from "../ui/components/Screen";
import { FarmPlacesSetupScreen } from "../ui/screens/FarmPlacesSetupScreen";
import { FarmSetupScreen } from "../ui/screens/FarmSetupScreen";
import { HomeScreen } from "../ui/screens/HomeScreen";
import { getStartupStep } from "../ui/setupFlow";
import { useDatabase } from "./providers/DatabaseProvider";

export function AppBootstrap() {
  const database = useDatabase();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [isLoadingReferences, setIsLoadingReferences] = useState(false);

  const loadReferences = useCallback(async () => {
    if (database.status !== "ready") {
      return;
    }

    setIsLoadingReferences(true);

    try {
      const nextFarm = await database.farmReferenceRepository.getFarm();
      setFarm(nextFarm);

      if (nextFarm) {
        const nextLocations = await listLocations(nextFarm.id, database.farmReferenceRepository);
        setLocations(nextLocations);
      }
    } finally {
      setIsLoadingReferences(false);
    }
  }, [database]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  if (database.status === "loading" || isLoadingReferences) {
    return (
      <Screen>
        <PageHeader supportingText="Opening local storage on this device." title="Getting things ready" />
      </Screen>
    );
  }

  if (database.status === "error") {
    return (
      <Screen>
        <PageHeader supportingText="Try closing and reopening the app." title="Local setup is unavailable" />
        <Card>
          <Text>{database.message}</Text>
        </Card>
      </Screen>
    );
  }

  const startupStep = getStartupStep(farm);

  if (startupStep === "farmName") {
    return (
      <FarmSetupScreen
        onFarmCreated={(createdFarm) => {
          setFarm(createdFarm);
          loadReferences();
        }}
        repository={database.farmReferenceRepository}
      />
    );
  }

  if (startupStep === "coreFarmPlaces" && farm) {
    return (
      <FarmPlacesSetupScreen
        farm={farm}
        locations={locations}
        onReferenceSaved={loadReferences}
        onSetupCompleted={(updatedFarm) => setFarm(updatedFarm)}
        repository={database.farmReferenceRepository}
      />
    );
  }

  return farm ? <HomeScreen farmName={farm.name} /> : null;
}
