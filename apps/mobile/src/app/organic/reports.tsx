import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { ExpoRecoveryCopyShareAdapter } from "../../infrastructure/export/ExpoRecoveryCopyShareAdapter";
import { OrganicReportPackagesScreen } from "../../ui/screens/OrganicReportPackagesScreen";

const exportRepository = new ExpoRecoveryCopyShareAdapter();

export default function OrganicReportsRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <OrganicReportPackagesScreen
          farm={farm}
          farmEventRepository={database.farmEventRepository}
          farmReferenceRepository={database.farmReferenceRepository}
          exportRepository={exportRepository}
          planningRepository={database.planningRepository}
          repository={database.organicCertificationRepository}
        />
      )}
    </FarmRouteGate>
  );
}
