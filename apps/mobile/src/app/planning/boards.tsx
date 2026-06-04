import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import type { useDatabase } from "../../bootstrap/providers/DatabaseProvider";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import { PlanningBoardsScreen } from "../../ui/screens/PlanningBoardsScreen";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;

export default function PlanningBoardsRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => <PlanningBoardsRouteContent database={database} farm={farm} />}
    </FarmRouteGate>
  );
}

function PlanningBoardsRouteContent({
  farm,
  database,
}: {
  farm: Farm;
  database: ReadyDatabase;
}) {
  const params = useLocalSearchParams<{ goalId?: string }>();
  const initialGoalId = typeof params.goalId === "string" ? params.goalId : undefined;
  const [locations, setLocations] = useState<FarmLocation[]>([]);

  const loadBoardContext = useCallback(async () => {
    setLocations(await listLocations(farm.id, database.farmReferenceRepository));
  }, [database.farmReferenceRepository, farm.id]);

  useEffect(() => {
    loadBoardContext();
  }, [loadBoardContext]);

  return (
    <PlanningBoardsScreen
      farm={farm}
      farmEventRepository={database.farmEventRepository}
      farmReferenceRepository={database.farmReferenceRepository}
      farmhandRepository={database.farmhandRepository}
      initialGoalId={initialGoalId}
      locations={locations}
      organicCertificationRepository={database.organicCertificationRepository}
      repository={database.planningRepository}
    />
  );
}
