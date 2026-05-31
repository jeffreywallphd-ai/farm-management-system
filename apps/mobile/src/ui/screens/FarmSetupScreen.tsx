import { useState } from "react";
import { z } from "zod";

import type { Farm } from "../../domain/farm/Farm";
import { setupFarm } from "../../application/use-cases/setup-farm/setupFarm";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { LocalDataNotice } from "../components/LocalDataNotice";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";

export function FarmSetupScreen({
  repository,
  onFarmCreated,
}: {
  repository: FarmReferenceRepository;
  onFarmCreated: (farm: Farm) => void;
}) {
  const [farmName, setFarmName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreateFarm() {
    setIsSaving(true);
    setError(undefined);

    try {
      const farm = await setupFarm(
        { name: farmName },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );

      onFarmCreated(farm);
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : "Farm setup could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Step 1 of 2"
        supportingText="Name this device-local farm setup before adding the main places where work happens."
        title="Set up your farm"
      />
      <LocalDataNotice />
      <Card>
        <FormField
          error={error}
          label="Farm name"
          onChangeText={setFarmName}
          onSubmitEditing={handleCreateFarm}
          placeholder="Green Hill Farm"
          value={farmName}
        />
        <Button disabled={isSaving} label={isSaving ? "Saving..." : "Save farm name"} onPress={handleCreateFarm} size="large" />
      </Card>
    </Screen>
  );
}
