import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { FarmEventView } from "../../application/ports/FarmEventRepository";
import type { useDatabase } from "../../bootstrap/providers/DatabaseProvider";
import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import { getFarmEventDetail } from "../../application/use-cases/view-farm-events/GetFarmEventDetail";
import { FarmEventDetailScreen } from "../../ui/screens/FarmEventDetailScreen";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;

export default function FarmEventDetailRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => <FarmEventDetailRouteContent database={database} farm={farm} />}
    </FarmRouteGate>
  );
}

function FarmEventDetailRouteContent({
  farm,
  database,
}: {
  farm: Farm;
  database: ReadyDatabase;
}) {
  const params = useLocalSearchParams<{ id?: string }>();
  const [event, setEvent] = useState<FarmEventView | null>(null);
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true);
      const [nextEvent, nextLocations] = await Promise.all([
        params.id
          ? getFarmEventDetail(farm.id, params.id, {
              farmEventRepository: database.farmEventRepository,
            })
          : Promise.resolve(null),
        listLocations(farm.id, database.farmReferenceRepository),
      ]);
      setEvent(nextEvent);
      setLocations(nextLocations);
      setIsLoading(false);
    }

    loadEvent();
  }, [database.farmEventRepository, database.farmReferenceRepository, farm.id, params.id]);

  return <FarmEventDetailScreen event={event} isLoading={isLoading} locations={locations} />;
}
