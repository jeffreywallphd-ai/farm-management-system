import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { RecordMaterialUseScreen } from "../../ui/screens/RecordMaterialUseScreen";

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
