import { useLocalSearchParams } from "expo-router";

import { FarmRouteGate } from "../../src/app/FarmRouteGate";
import { HarvestDetailScreen } from "../../src/ui/screens/HarvestDetailScreen";

export default function HarvestDetailRoute() {
  const params = useLocalSearchParams<{ id?: string }>();

  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <HarvestDetailScreen
          farm={farm}
          harvestId={params.id ?? ""}
          localRecordRepository={database.localRecordRepository}
        />
      )}
    </FarmRouteGate>
  );
}
