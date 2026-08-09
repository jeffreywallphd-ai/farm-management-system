import { FarmRouteGate } from "../bootstrap/FarmRouteGate";
import { InventoryManagementScreen } from "../ui/screens/InventoryManagementScreen";

export default function InventoryRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <InventoryManagementScreen
          farm={farm}
          farmEventRepository={database.farmEventRepository}
          farmReferenceRepository={database.farmReferenceRepository}
          inventoryRepository={database.inventoryRepository}
          localRecordRepository={database.localRecordRepository}
          organicCertificationRepository={database.organicCertificationRepository}
          planningRepository={database.planningRepository}
        />
      )}
    </FarmRouteGate>
  );
}
