import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { PlanningTask } from "../../domain/planning/Planning";
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
  const params = useLocalSearchParams<{ taskId?: string; organicCategory?: string }>();
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [planningTasks, setPlanningTasks] = useState<PlanningTask[]>([]);
  const initialPlanningTaskId = typeof params.taskId === "string" ? params.taskId : undefined;
  const initialOrganicCategory = typeof params.organicCategory === "string" ? params.organicCategory : undefined;

  useEffect(() => {
    async function loadContext() {
      const [nextLocations, nextPlanningTasks] = await Promise.all([
        listLocations(farm.id, database.farmReferenceRepository),
        database.planningRepository.listTasks(farm.id),
      ]);
      setLocations(nextLocations);
      setPlanningTasks(nextPlanningTasks);
    }

    loadContext();
  }, [database.farmReferenceRepository, database.planningRepository, farm.id]);

  return (
    <RecordFarmEventScreen
      farm={farm}
      farmEventRepository={database.farmEventRepository}
      farmReferenceRepository={database.farmReferenceRepository}
      organicCertificationRepository={database.organicCertificationRepository}
      initialOrganicCategory={initialOrganicCategory}
      locations={locations}
      initialPlanningTaskId={initialPlanningTaskId}
      planningRepository={database.planningRepository}
      planningTasks={planningTasks}
    />
  );
}
