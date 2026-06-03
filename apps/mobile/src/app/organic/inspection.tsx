import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { OrganicInspectionDayScreen } from "../../ui/screens/OrganicInspectionDayScreen";

export default function OrganicInspectionRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <OrganicInspectionDayScreen
          farm={farm}
          farmEventRepository={database.farmEventRepository}
          repository={database.organicCertificationRepository}
        />
      )}
    </FarmRouteGate>
  );
}
