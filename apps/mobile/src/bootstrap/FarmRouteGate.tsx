import { ReactNode, useCallback, useEffect, useState } from "react";
import { Text } from "react-native";

import { listLocations } from "../application/use-cases/list-locations/listLocations";
import type { Farm } from "../domain/farm/Farm";
import type { FarmLocation } from "../domain/farm/FarmLocation";
import { Card } from "../ui/components/Card";
import { DatePreferencesProvider } from "../ui/datePreferences";
import { PageHeader } from "../ui/components/PageHeader";
import { Screen } from "../ui/components/Screen";
import { FarmPlacesSetupScreen } from "../ui/screens/FarmPlacesSetupScreen";
import { StarterWorkPacksSetupScreen } from "../ui/screens/StarterWorkPacksSetupScreen";
import { getStartupStep } from "../ui/setupFlow";
import { useDatabase } from "./providers/DatabaseProvider";

type CachedFarmRouteContext = {
  farm: Farm;
  locations: FarmLocation[];
};

let cachedFarmRouteContext: CachedFarmRouteContext | null = null;

export function rememberFarmRouteContext(farm: Farm, locations: FarmLocation[] = []): void {
  cachedFarmRouteContext = { farm, locations };
}

export function FarmRouteGate({
  children,
}: {
  children: (context: {
    farm: Farm;
    database: Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;
  }) => ReactNode;
}) {
  const database = useDatabase();
  const [farm, setFarm] = useState<Farm | null>(() => cachedFarmRouteContext?.farm ?? null);
  const [locations, setLocations] = useState<FarmLocation[]>(() => cachedFarmRouteContext?.locations ?? []);
  const [isLoadingFarm, setIsLoadingFarm] = useState(cachedFarmRouteContext === null);

  const loadFarm = useCallback(async (options?: { showLoading?: boolean }) => {
    if (database.status !== "ready") {
      return;
    }

    if (options?.showLoading || cachedFarmRouteContext === null) {
      setIsLoadingFarm(true);
    }

    const nextFarm = await database.farmReferenceRepository.getFarm();
    setFarm(nextFarm);

    if (nextFarm) {
      const nextLocations = await listLocations(nextFarm.id, database.farmReferenceRepository);
      setLocations(nextLocations);
      rememberFarmRouteContext(nextFarm, nextLocations);
    } else {
      setLocations([]);
      cachedFarmRouteContext = null;
    }

    setIsLoadingFarm(false);
  }, [database]);

  useEffect(() => {
    async function load() {
      if (database.status !== "ready") {
        return;
      }

      await loadFarm({ showLoading: cachedFarmRouteContext === null });
    }

    load();
  }, [database, loadFarm]);

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
        onReferenceSaved={() => loadFarm()}
        onSetupCompleted={(updatedFarm) => {
          setFarm(updatedFarm);
          rememberFarmRouteContext(updatedFarm, locations);
        }}
        repository={database.farmReferenceRepository}
      />
    );
  }

  if (startupStep === "starterWorkPacks" && farm) {
    return (
      <StarterWorkPacksSetupScreen
        farm={farm}
        farmReferenceRepository={database.farmReferenceRepository}
        onSetupCompleted={(updatedFarm) => {
          setFarm(updatedFarm);
          rememberFarmRouteContext(updatedFarm, locations);
        }}
        planningRepository={database.planningRepository}
      />
    );
  }

  return farm ? (
    <DatePreferencesProvider farmhandRepository={database.farmhandRepository} farmId={farm.id}>
      {children({ farm, database })}
    </DatePreferencesProvider>
  ) : null;
}
