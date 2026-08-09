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

  const loadReferences = useCallback(async () => {
    const [nextLocations, nextCrops] = await Promise.all([
      listLocations(farm.id, database.farmReferenceRepository),
      listTrackedItems(farm.id, "crop", database.farmReferenceRepository),
    ]);

    setLocations(nextLocations);
    setCrops(nextCrops);
  }, [database.farmReferenceRepository, farm.id]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  return (
    <FarmDashboardScreen
      crops={crops}
      farm={farm}
      initialExpandedSection={parseSetupSection(params.section)}
      locations={locations}
      farmMapRepository={database.farmMapRepository}
      organicCertificationRepository={database.organicCertificationRepository}
      onReferenceSaved={loadReferences}
      planningRepository={database.planningRepository}
      repository={database.farmReferenceRepository}
    />
  );
}

function parseSetupSection(section?: string | string[]): SetupSectionId | undefined {
  const value = Array.isArray(section) ? section[0] : section;

  if (
    value === "farmProfile" ||
    value === "farmPlaces" ||
    value === "farmMapLocation" ||
    value === "organicCertification" ||
    value === "farmWorkPacks" ||
    value === "scheduleWeek" ||
    value === "crops"
  ) {
    return value;
  }

  return undefined;
}
