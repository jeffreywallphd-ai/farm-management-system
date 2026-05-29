import { FarmRouteGate } from "../../src/app/FarmRouteGate";
import { HarvestHistoryScreen } from "../../src/ui/screens/HarvestHistoryScreen";

export default function HarvestHistoryRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <HarvestHistoryScreen farm={farm} localRecordRepository={database.localRecordRepository} />
      )}
    </FarmRouteGate>
  );
}
