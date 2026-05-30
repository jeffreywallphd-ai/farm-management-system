import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";

import { listLocations } from "../application/use-cases/list-locations/listLocations";
import { listTrackedItems } from "../application/use-cases/list-tracked-items/listTrackedItems";
import type { Farm } from "../domain/farm/Farm";
import type { FarmLocation } from "../domain/farm/FarmLocation";
import type { TrackedItem } from "../domain/farm/TrackedItem";
import { Card } from "../ui/components/Card";
import { PageHeader } from "../ui/components/PageHeader";
import { Screen } from "../ui/components/Screen";
import { FarmDashboardScreen } from "../ui/screens/FarmDashboardScreen";
import { FarmSetupScreen } from "../ui/screens/FarmSetupScreen";
import { useDatabase } from "./providers/DatabaseProvider";

export function AppBootstrap() {
  const database = useDatabase();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [crops, setCrops] = useState<TrackedItem[]>([]);
  const [materials, setMaterials] = useState<TrackedItem[]>([]);
  const [countableItems, setCountableItems] = useState<TrackedItem[]>([]);
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
        const [nextLocations, nextCrops, nextMaterials, nextCountableItems] = await Promise.all([
          listLocations(nextFarm.id, database.farmReferenceRepository),
          listTrackedItems(nextFarm.id, "crop", database.farmReferenceRepository),
          listTrackedItems(nextFarm.id, "material", database.farmReferenceRepository),
          listTrackedItems(nextFarm.id, "countableItem", database.farmReferenceRepository),
        ]);

        setLocations(nextLocations);
        setCrops(nextCrops);
        setMaterials(nextMaterials);
        setCountableItems(nextCountableItems);
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

  if (!farm) {
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

  return (
    <FarmDashboardScreen
      countableItems={countableItems}
      crops={crops}
      farm={farm}
      locations={locations}
      materials={materials}
      onReferenceSaved={loadReferences}
      repository={database.farmReferenceRepository}
    />
  );
}
