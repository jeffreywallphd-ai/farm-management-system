import { ReactNode, useEffect, useState } from "react";
import { Text } from "react-native";

import { useDatabase } from "./providers/DatabaseProvider";
import type { Farm } from "../domain/farm/Farm";
import { Card } from "../ui/components/Card";
import { PageHeader } from "../ui/components/PageHeader";
import { Screen } from "../ui/components/Screen";

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
  const [isLoadingFarm, setIsLoadingFarm] = useState(true);

  useEffect(() => {
    async function loadFarm() {
      if (database.status !== "ready") {
        return;
      }

      setIsLoadingFarm(true);
      setFarm(await database.farmReferenceRepository.getFarm());
      setIsLoadingFarm(false);
    }

    loadFarm();
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

  if (!farm) {
    return (
      <Screen>
        <PageHeader supportingText="Create a farm profile before recording harvests." title="Set up your farm" />
      </Screen>
    );
  }

  return <>{children({ farm, database })}</>;
}
