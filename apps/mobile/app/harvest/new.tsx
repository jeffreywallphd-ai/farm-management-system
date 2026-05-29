import { FarmRouteGate } from "../../src/app/FarmRouteGate";
import { RecordHarvestScreen } from "../../src/ui/screens/RecordHarvestScreen";

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
