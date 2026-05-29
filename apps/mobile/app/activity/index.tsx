import { FarmRouteGate } from "../../src/app/FarmRouteGate";
import { ActivityHistoryScreen } from "../../src/ui/screens/ActivityHistoryScreen";

export default function ActivityHistoryRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <ActivityHistoryScreen farm={farm} localRecordRepository={database.localRecordRepository} />
      )}
    </FarmRouteGate>
  );
}
