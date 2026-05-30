import { useEffect, useState } from "react";

import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { useDatabase } from "../../bootstrap/providers/DatabaseProvider";
import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import { RecordFarmEventScreen } from "../../ui/screens/RecordFarmEventScreen";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;

export default function NewFarmEventRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => <NewFarmEventRouteContent database={database} farm={farm} />}
    </FarmRouteGate>
  );
}

function NewFarmEventRouteContent({
  farm,
  database,
}: {
  farm: Farm;
  database: ReadyDatabase;
}) {
  const [locations, setLocations] = useState<FarmLocation[]>([]);

  useEffect(() => {
    async function loadLocations() {
      setLocations(await listLocations(farm.id, database.farmReferenceRepository));
    }

    loadLocations();
  }, [database.farmReferenceRepository, farm.id]);

  return (
    <RecordFarmEventScreen
      farm={farm}
      farmEventRepository={database.farmEventRepository}
      farmReferenceRepository={database.farmReferenceRepository}
      locations={locations}
    />
  );
}
