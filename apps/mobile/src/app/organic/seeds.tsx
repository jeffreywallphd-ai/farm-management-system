import { useCallback, useEffect, useState } from "react";

import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import type { useDatabase } from "../../bootstrap/providers/DatabaseProvider";
import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import { listTrackedItems } from "../../application/use-cases/list-tracked-items/listTrackedItems";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import { OrganicSeedsScreen } from "../../ui/screens/OrganicSeedsScreen";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;

export default function OrganicSeedsRoute() {
  return <FarmRouteGate>{({ farm, database }) => <OrganicSeedsRouteContent database={database} farm={farm} />}</FarmRouteGate>;
}

function OrganicSeedsRouteContent({ farm, database }: { farm: Farm; database: ReadyDatabase }) {
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
    <OrganicSeedsScreen
      crops={crops}
      farm={farm}
      farmReferenceRepository={database.farmReferenceRepository}
      farmEventRepository={database.farmEventRepository}
      locations={locations}
      repository={database.organicCertificationRepository}
    />
  );
}
