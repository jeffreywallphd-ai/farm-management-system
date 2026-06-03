import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { OrganicReportPackagesScreen } from "../../ui/screens/OrganicReportPackagesScreen";

export default function OrganicReportsRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <OrganicReportPackagesScreen
          farm={farm}
          farmEventRepository={database.farmEventRepository}
          farmReferenceRepository={database.farmReferenceRepository}
          planningRepository={database.planningRepository}
          repository={database.organicCertificationRepository}
        />
      )}
    </FarmRouteGate>
  );
}
