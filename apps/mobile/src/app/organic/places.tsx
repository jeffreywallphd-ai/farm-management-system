import { useCallback, useEffect, useState } from "react";

import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import type { useDatabase } from "../../bootstrap/providers/DatabaseProvider";
import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import { OrganicPlacesScreen } from "../../ui/screens/OrganicPlacesScreen";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;

export default function OrganicPlacesRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => <OrganicPlacesRouteContent database={database} farm={farm} />}
    </FarmRouteGate>
  );
}

function OrganicPlacesRouteContent({
  farm,
  database,
}: {
  farm: Farm;
  database: ReadyDatabase;
}) {
  const [locations, setLocations] = useState<FarmLocation[]>([]);

  const loadLocations = useCallback(async () => {
    setLocations(await listLocations(farm.id, database.farmReferenceRepository));
  }, [database.farmReferenceRepository, farm.id]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  return (
    <OrganicPlacesScreen
      farm={farm}
      farmReferenceRepository={database.farmReferenceRepository}
      farmEventRepository={database.farmEventRepository}
      locations={locations}
      repository={database.organicCertificationRepository}
    />
  );
}
