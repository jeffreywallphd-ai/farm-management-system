import { FarmRouteGate } from "../../src/app/FarmRouteGate";
import { RecordInventoryCountScreen } from "../../src/ui/screens/RecordInventoryCountScreen";

export default function NewInventoryCountRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <RecordInventoryCountScreen
          farm={farm}
          farmReferenceRepository={database.farmReferenceRepository}
          localRecordRepository={database.localRecordRepository}
        />
      )}
    </FarmRouteGate>
  );
}
