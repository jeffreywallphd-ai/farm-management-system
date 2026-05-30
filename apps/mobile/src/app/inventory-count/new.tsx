import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { RecordInventoryCountScreen } from "../../ui/screens/RecordInventoryCountScreen";

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
