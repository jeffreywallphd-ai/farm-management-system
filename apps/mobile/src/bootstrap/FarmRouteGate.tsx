import { ReactNode, useEffect, useState } from "react";
import { Text } from "react-native";

import { listLocations } from "../application/use-cases/list-locations/listLocations";
import type { Farm } from "../domain/farm/Farm";
import type { FarmLocation } from "../domain/farm/FarmLocation";
import { Card } from "../ui/components/Card";
import { PageHeader } from "../ui/components/PageHeader";
import { Screen } from "../ui/components/Screen";
import { FarmPlacesSetupScreen } from "../ui/screens/FarmPlacesSetupScreen";
import { getStartupStep } from "../ui/setupFlow";
import { useDatabase } from "./providers/DatabaseProvider";

export function FarmRouteGate({
  children,
}: {
  children: (context: {
    farm: Farm;
    database: Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;
  }) => ReactNode;
}) {
  const database = useDatabase();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [isLoadingFarm, setIsLoadingFarm] = useState(true);

  async function loadFarm() {
    if (database.status !== "ready") {
      return;
    }

    setIsLoadingFarm(true);
    const nextFarm = await database.farmReferenceRepository.getFarm();
    setFarm(nextFarm);
    if (nextFarm) {
      setLocations(await listLocations(nextFarm.id, database.farmReferenceRepository));
    }
    setIsLoadingFarm(false);
  }

  useEffect(() => {
    async function load() {
      if (database.status !== "ready") {
        return;
      }

      await loadFarm();
    }

    load();
  }, [database]);

  if (database.status === "loading" || isLoadingFarm) {
    return (
      <Screen>
        <PageHeader supportingText="Opening local records on this device." title="Getting things ready" />
      </Screen>
    );
  }

  if (database.status === "error") {
    return (
      <Screen>
        <PageHeader supportingText="Try closing and reopening the app." title="Local records are unavailable" />
        <Card>
          <Text>{database.message}</Text>
        </Card>
      </Screen>
    );
  }

  const startupStep = getStartupStep(farm);

  if (startupStep === "farmName") {
    return (
      <Screen>
        <PageHeader supportingText="Create a farm profile before recording harvests." title="Set up your farm" />
      </Screen>
    );
  }

  if (startupStep === "coreFarmPlaces" && farm) {
    return (
      <FarmPlacesSetupScreen
        farm={farm}
        locations={locations}
        onReferenceSaved={loadFarm}
        onSetupCompleted={(updatedFarm) => setFarm(updatedFarm)}
        repository={database.farmReferenceRepository}
      />
    );
  }

  return farm ? <>{children({ farm, database })}</> : null;
}
