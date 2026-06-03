import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { OrganicSystemPlanScreen } from "../../ui/screens/OrganicSystemPlanScreen";

export default function OrganicSystemPlanRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <OrganicSystemPlanScreen
          farm={farm}
          farmEventRepository={database.farmEventRepository}
          planningRepository={database.planningRepository}
          repository={database.organicCertificationRepository}
        />
      )}
    </FarmRouteGate>
  );
}
