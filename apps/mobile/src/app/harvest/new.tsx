import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { RecordHarvestScreen } from "../../ui/screens/RecordHarvestScreen";

export default function NewHarvestRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <RecordHarvestScreen
          farm={farm}
          farmReferenceRepository={database.farmReferenceRepository}
          localRecordRepository={database.localRecordRepository}
        />
      )}
    </FarmRouteGate>
  );
}
