import { useLocalSearchParams } from "expo-router";

import { FarmRouteGate } from "../../../bootstrap/FarmRouteGate";
import type { OperationalRecordKind } from "../../../domain/records/OperationalRecord";
import { ActivityDetailScreen } from "../../../ui/screens/ActivityDetailScreen";

const allowedKinds: OperationalRecordKind[] = [
  "HarvestRecorded",
  "MaterialUseRecorded",
  "InventoryCountRecorded",
];

export default function ActivityDetailRoute() {
  const params = useLocalSearchParams<{ kind?: string; id?: string }>();
  const kind = allowedKinds.includes(params.kind as OperationalRecordKind)
    ? (params.kind as OperationalRecordKind)
    : "HarvestRecorded";

  return (
    <FarmRouteGate>
      {({ farm, database }) => (
        <ActivityDetailScreen
          farm={farm}
          kind={kind}
          recordId={params.id ?? ""}
          localRecordRepository={database.localRecordRepository}
        />
      )}
    </FarmRouteGate>
  );
}
