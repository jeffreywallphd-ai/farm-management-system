import { useCallback, useEffect, useState } from "react";

import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import type { useDatabase } from "../../bootstrap/providers/DatabaseProvider";
import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import { listTrackedItems } from "../../application/use-cases/list-tracked-items/listTrackedItems";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import { OrganicPestScreen } from "../../ui/screens/OrganicPestScreen";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;

export default function OrganicPestRoute() {
  return <FarmRouteGate>{({ farm, database }) => <OrganicPestRouteContent database={database} farm={farm} />}</FarmRouteGate>;
}

function OrganicPestRouteContent({ farm, database }: { farm: Farm; database: ReadyDatabase }) {
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
  useEffect(() => { loadReferences(); }, [loadReferences]);
  return <OrganicPestScreen crops={crops} farm={farm} farmEventRepository={database.farmEventRepository} farmReferenceRepository={database.farmReferenceRepository} locations={locations} repository={database.organicCertificationRepository} />;
}
