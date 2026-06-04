import { FarmRouteGate } from "../bootstrap/FarmRouteGate";
import type { useDatabase } from "../bootstrap/providers/DatabaseProvider";
import type { Farm } from "../domain/farm/Farm";
import { FarmhandsScreen } from "../ui/screens/FarmhandsScreen";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;

export default function FarmhandsRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => <FarmhandsRouteContent database={database} farm={farm} />}
    </FarmRouteGate>
  );
}

function FarmhandsRouteContent({ database, farm }: { database: ReadyDatabase; farm: Farm }) {
  return (
    <FarmhandsScreen
      farm={farm}
      farmhandRepository={database.farmhandRepository}
    />
  );
}
