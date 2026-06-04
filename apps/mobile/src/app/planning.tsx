import { useCallback, useEffect, useState } from "react";

import { listLocations } from "../application/use-cases/list-locations/listLocations";
import { FarmRouteGate } from "../bootstrap/FarmRouteGate";
import type { useDatabase } from "../bootstrap/providers/DatabaseProvider";
import type { Farm } from "../domain/farm/Farm";
import type { FarmLocation } from "../domain/farm/FarmLocation";
import type { Farmhand } from "../domain/farmhand/Farmhand";
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
  const [farmhands, setFarmhands] = useState<Farmhand[]>([]);

  const loadPlanningContext = useCallback(async () => {
    const [nextLocations, nextFarmhands] = await Promise.all([
      listLocations(farm.id, database.farmReferenceRepository),
      database.farmhandRepository.listFarmhands(farm.id),
    ]);
    setLocations(nextLocations);
    setFarmhands(nextFarmhands);
  }, [database.farmReferenceRepository, database.farmhandRepository, farm.id]);

  useEffect(() => {
    loadPlanningContext();
  }, [loadPlanningContext]);

  return (
    <PlanningScreen
      farm={farm}
      farmhandRepository={database.farmhandRepository}
      farmhands={farmhands}
      locations={locations}
      organicCertificationRepository={database.organicCertificationRepository}
      repository={database.planningRepository}
    />
  );
}
