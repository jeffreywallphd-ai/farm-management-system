import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { ExpoRecoveryCopyShareAdapter } from "../../infrastructure/export/ExpoRecoveryCopyShareAdapter";
import { RecoveryCopyExportScreen } from "../../ui/screens/RecoveryCopyExportScreen";

const exportRepository = new ExpoRecoveryCopyShareAdapter();

export default function RecoveryCopyExportRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <RecoveryCopyExportScreen
          exportRepository={exportRepository}
          farm={farm}
          farmEventRepository={database.farmEventRepository}
          farmhandRepository={database.farmhandRepository}
          farmMapRepository={database.farmMapRepository}
          farmNoteTranscriptRepository={database.farmNoteTranscriptRepository}
          farmReferenceRepository={database.farmReferenceRepository}
          localRecordRepository={database.localRecordRepository}
          organicCertificationRepository={database.organicCertificationRepository}
          planningRepository={database.planningRepository}
        />
      )}
    </FarmRouteGate>
  );
}
