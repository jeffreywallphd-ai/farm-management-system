import { useCallback, useEffect, useState } from "react";

import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import type { useDatabase } from "../../bootstrap/providers/DatabaseProvider";
import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import { listTrackedItems } from "../../application/use-cases/list-tracked-items/listTrackedItems";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import { OrganicInputsScreen } from "../../ui/screens/OrganicInputsScreen";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;

export default function OrganicInputsRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => <OrganicInputsRouteContent database={database} farm={farm} />}
    </FarmRouteGate>
  );
}

function OrganicInputsRouteContent({ farm, database }: { farm: Farm; database: ReadyDatabase }) {
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [materials, setMaterials] = useState<TrackedItem[]>([]);
  const [crops, setCrops] = useState<TrackedItem[]>([]);

  const loadReferences = useCallback(async () => {
    const [nextLocations, nextMaterials, nextCrops] = await Promise.all([
      listLocations(farm.id, database.farmReferenceRepository),
      listTrackedItems(farm.id, "material", database.farmReferenceRepository),
      listTrackedItems(farm.id, "crop", database.farmReferenceRepository),
    ]);
    setLocations(nextLocations);
    setMaterials(nextMaterials);
    setCrops(nextCrops);
  }, [database.farmReferenceRepository, farm.id]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  return (
    <OrganicInputsScreen
      crops={crops}
      farm={farm}
      farmReferenceRepository={database.farmReferenceRepository}
      farmEventRepository={database.farmEventRepository}
      locations={locations}
      materials={materials}
      repository={database.organicCertificationRepository}
    />
  );
}
