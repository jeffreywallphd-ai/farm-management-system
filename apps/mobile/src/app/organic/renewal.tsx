import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { OrganicRenewalScreen } from "../../ui/screens/OrganicRenewalScreen";

export default function OrganicRenewalRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <OrganicRenewalScreen
          farm={farm}
          farmEventRepository={database.farmEventRepository}
          repository={database.organicCertificationRepository}
        />
      )}
    </FarmRouteGate>
  );
}
