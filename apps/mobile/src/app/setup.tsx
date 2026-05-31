import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { FarmRouteGate } from "../bootstrap/FarmRouteGate";
import type { useDatabase } from "../bootstrap/providers/DatabaseProvider";
import type { Farm } from "../domain/farm/Farm";
import type { FarmLocation } from "../domain/farm/FarmLocation";
import type { TrackedItem } from "../domain/farm/TrackedItem";
import { listLocations } from "../application/use-cases/list-locations/listLocations";
import { listTrackedItems } from "../application/use-cases/list-tracked-items/listTrackedItems";
import { FarmDashboardScreen, type SetupSectionId } from "../ui/screens/FarmDashboardScreen";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;

export default function SetupRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => <SetupRouteContent database={database} farm={farm} />}
    </FarmRouteGate>
  );
}

function SetupRouteContent({ farm, database }: { farm: Farm; database: ReadyDatabase }) {
  const params = useLocalSearchParams<{ section?: string }>();
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [crops, setCrops] = useState<TrackedItem[]>([]);
  const [materials, setMaterials] = useState<TrackedItem[]>([]);
  const [countableItems, setCountableItems] = useState<TrackedItem[]>([]);

  const loadReferences = useCallback(async () => {
    const [nextLocations, nextCrops, nextMaterials, nextCountableItems] = await Promise.all([
      listLocations(farm.id, database.farmReferenceRepository),
      listTrackedItems(farm.id, "crop", database.farmReferenceRepository),
      listTrackedItems(farm.id, "material", database.farmReferenceRepository),
      listTrackedItems(farm.id, "countableItem", database.farmReferenceRepository),
    ]);

    setLocations(nextLocations);
    setCrops(nextCrops);
    setMaterials(nextMaterials);
    setCountableItems(nextCountableItems);
  }, [database.farmReferenceRepository, farm.id]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  return (
    <FarmDashboardScreen
      countableItems={countableItems}
      crops={crops}
      farm={farm}
      initialExpandedSection={parseSetupSection(params.section)}
      locations={locations}
      materials={materials}
      onReferenceSaved={loadReferences}
      repository={database.farmReferenceRepository}
    />
  );
}

function parseSetupSection(section?: string | string[]): SetupSectionId | undefined {
  const value = Array.isArray(section) ? section[0] : section;

  if (
    value === "farmPlaces" ||
    value === "farmWork" ||
    value === "crops" ||
    value === "materials" ||
    value === "countableItems"
  ) {
    return value;
  }

  return undefined;
}
