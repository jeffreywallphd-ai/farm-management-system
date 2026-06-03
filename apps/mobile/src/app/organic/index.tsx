import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { OrganicCertificationScreen } from "../../ui/screens/OrganicCertificationScreen";

export default function OrganicCertificationRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <OrganicCertificationScreen farm={farm} planningRepository={database.planningRepository} repository={database.organicCertificationRepository} />
      )}
    </FarmRouteGate>
  );
}
