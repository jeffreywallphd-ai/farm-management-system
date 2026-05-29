import { FarmRouteGate } from "../../src/app/FarmRouteGate";
import { RecordMaterialUseScreen } from "../../src/ui/screens/RecordMaterialUseScreen";

export default function NewMaterialUseRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <RecordMaterialUseScreen
          farm={farm}
          farmReferenceRepository={database.farmReferenceRepository}
          localRecordRepository={database.localRecordRepository}
        />
      )}
    </FarmRouteGate>
  );
}
