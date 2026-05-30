import { useEffect, useState } from "react";

import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { FarmEventView } from "../../application/ports/FarmEventRepository";
import type { useDatabase } from "../../bootstrap/providers/DatabaseProvider";
import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import { listFarmEvents } from "../../application/use-cases/view-farm-events/ListFarmEvents";
import { FarmEventTimelineScreen } from "../../ui/screens/FarmEventTimelineScreen";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;

export default function FarmEventsRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => <FarmEventsRouteContent database={database} farm={farm} />}
    </FarmRouteGate>
  );
}

function FarmEventsRouteContent({
  farm,
  database,
}: {
  farm: Farm;
  database: ReadyDatabase;
}) {
  const [events, setEvents] = useState<FarmEventView[]>([]);
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      const [nextEvents, nextLocations] = await Promise.all([
        listFarmEvents(farm.id, { farmEventRepository: database.farmEventRepository }),
        listLocations(farm.id, database.farmReferenceRepository),
      ]);
      setEvents(nextEvents);
      setLocations(nextLocations);
      setIsLoading(false);
    }

    loadEvents();
  }, [database.farmEventRepository, database.farmReferenceRepository, farm.id]);

  return <FarmEventTimelineScreen events={events} isLoading={isLoading} locations={locations} />;
}
