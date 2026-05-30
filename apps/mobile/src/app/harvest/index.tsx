import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { HarvestHistoryScreen } from "../../ui/screens/HarvestHistoryScreen";

export default function HarvestHistoryRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <HarvestHistoryScreen farm={farm} localRecordRepository={database.localRecordRepository} />
      )}
    </FarmRouteGate>
  );
}
