import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { ActivityHistoryScreen } from "../../ui/screens/ActivityHistoryScreen";

export default function ActivityHistoryRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <ActivityHistoryScreen farm={farm} localRecordRepository={database.localRecordRepository} />
      )}
    </FarmRouteGate>
  );
}
