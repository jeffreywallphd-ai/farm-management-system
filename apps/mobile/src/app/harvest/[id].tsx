import { useLocalSearchParams } from "expo-router";

import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import { HarvestDetailScreen } from "../../ui/screens/HarvestDetailScreen";

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
