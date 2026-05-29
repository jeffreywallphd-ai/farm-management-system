import { FarmRouteGate } from "../../src/app/FarmRouteGate";
import { ExpoRecoveryCopyShareAdapter } from "../../src/infrastructure/export/ExpoRecoveryCopyShareAdapter";
import { RecoveryCopyExportScreen } from "../../src/ui/screens/RecoveryCopyExportScreen";

const exportRepository = new ExpoRecoveryCopyShareAdapter();

export default function RecoveryCopyExportRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <RecoveryCopyExportScreen
          exportRepository={exportRepository}
          farm={farm}
          farmReferenceRepository={database.farmReferenceRepository}
          localRecordRepository={database.localRecordRepository}
        />
      )}
    </FarmRouteGate>
  );
}
