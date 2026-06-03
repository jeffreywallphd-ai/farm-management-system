import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { OrganicAdvancedScopesScreen } from "../../ui/screens/OrganicAdvancedScopesScreen";

export default function OrganicAdvancedScopesRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <OrganicAdvancedScopesScreen farm={farm} farmEventRepository={database.farmEventRepository} repository={database.organicCertificationRepository} />
      )}
    </FarmRouteGate>
  );
}
