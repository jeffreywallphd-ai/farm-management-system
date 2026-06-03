import { useLocalSearchParams } from "expo-router";

import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import type { useDatabase } from "../../bootstrap/providers/DatabaseProvider";
import type { Farm } from "../../domain/farm/Farm";
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

  return <PlanningBoardsScreen farm={farm} initialGoalId={initialGoalId} repository={database.planningRepository} />;
}
