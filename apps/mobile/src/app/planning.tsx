import { useCallback, useEffect, useState } from "react";

import { listLocations } from "../application/use-cases/list-locations/listLocations";
import { FarmRouteGate } from "../bootstrap/FarmRouteGate";
import type { useDatabase } from "../bootstrap/providers/DatabaseProvider";
import type { Farm } from "../domain/farm/Farm";
import type { FarmLocation } from "../domain/farm/FarmLocation";
import { PlanningScreen } from "../ui/screens/PlanningScreen";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;

export default function PlanningRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => <PlanningRouteContent database={database} farm={farm} />}
    </FarmRouteGate>
  );
}

function PlanningRouteContent({ database, farm }: { database: ReadyDatabase; farm: Farm }) {
  const [locations, setLocations] = useState<FarmLocation[]>([]);

  const loadLocations = useCallback(async () => {
    setLocations(await listLocations(farm.id, database.farmReferenceRepository));
  }, [database.farmReferenceRepository, farm.id]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  return <PlanningScreen farm={farm} locations={locations} repository={database.planningRepository} />;
}
