import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";

import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import { PILOT_UNITS } from "../../domain/quantities/PilotUnit";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { LocalRecordRepository } from "../../application/ports/LocalRecordRepository";
import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import { listTrackedItems } from "../../application/use-cases/list-tracked-items/listTrackedItems";
import { recordMaterialUse } from "../../application/use-cases/record-material-use/RecordMaterialUse";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FormField } from "../components/FormField";
import { LocalDataNotice } from "../components/LocalDataNotice";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";
import { replaceRoute } from "../navigation";
import { mapZodIssues } from "./screenValidation";

export function RecordMaterialUseScreen({
  farm,
  farmReferenceRepository,
  localRecordRepository,
}: {
  farm: Farm;
  farmReferenceRepository: FarmReferenceRepository;
  localRecordRepository: LocalRecordRepository;
}) {
  const router = useRouter();
  const [materials, setMaterials] = useState<TrackedItem[]>([]);
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [materialId, setMaterialId] = useState("");
  const [useLocationId, setUseLocationId] = useState("");
  const [quantityText, setQuantityText] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadReferences() {
      const [nextMaterials, nextLocations] = await Promise.all([
        listTrackedItems(farm.id, "material", farmReferenceRepository),
        listLocations(farm.id, farmReferenceRepository),
      ]);
      setMaterials(nextMaterials);
      setLocations(nextLocations);
    }
    loadReferences();
  }, [farm.id, farmReferenceRepository]);

  async function handleSave() {
    setIsSaving(true);
    setErrors({});
    try {
      await recordMaterialUse(
        { farmId: farm.id, materialId, useLocationId, quantityText, unit, note },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, localRecordRepository },
      );
      replaceRoute(router, "/activity?saved=material-use");
    } catch (caughtError) {
      setErrors(caughtError instanceof z.ZodError ? mapZodIssues(caughtError) : { form: "This material use could not be saved on this device." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <PageHeader eyebrow="Material use" supportingText="Record material use without reception." title="Record material use" />
      <LocalDataNotice />
      {materials.length === 0 ? (
        <Card>
          <SectionHeading title="Finish setup first" />
          <EmptyState text="Add a material before recording use." />
          <Button label="Back to farm setup" onPress={() => replaceRoute(router, "/")} variant="secondary" />
        </Card>
      ) : (
        <Card>
          <SectionHeading detail="Saved material-use records stay private on this device." title="Use details" />
          <SelectField error={errors.materialId} label="Material" onChange={setMaterialId} options={materials.map((material) => ({ label: material.name, value: material.id }))} value={materialId} />
          <FormField error={errors.quantityText} keyboardType="decimal-pad" label="Amount" onChangeText={setQuantityText} placeholder="2" value={quantityText} />
          <SelectField error={errors.unit} label="Unit" onChange={setUnit} options={PILOT_UNITS.map((pilotUnit) => ({ label: pilotUnit, value: pilotUnit }))} value={unit} />
          <SelectField label="Location" onChange={setUseLocationId} options={[{ label: "No location", value: "" }, ...locations.map((location) => ({ label: location.name, value: location.id }))]} value={useLocationId} error={errors.useLocationId} />
          <FormField error={errors.note} label="Note" multiline onChangeText={setNote} placeholder="Optional" value={note} />
          {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
          <Button disabled={isSaving} label={isSaving ? "Saving..." : "Save material use"} onPress={handleSave} />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
