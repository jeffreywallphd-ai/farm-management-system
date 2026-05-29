import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";

import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import { HARVEST_UNITS } from "../../domain/quantities/HarvestUnit";
import { recordHarvest } from "../../application/use-cases/record-harvest/RecordHarvest";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { LocalRecordRepository } from "../../application/ports/LocalRecordRepository";
import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import { listTrackedItems } from "../../application/use-cases/list-tracked-items/listTrackedItems";
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

interface FormErrors {
  cropId?: string;
  sourceLocationId?: string;
  quantityText?: string;
  unit?: string;
  note?: string;
  form?: string;
}

export function RecordHarvestScreen({
  farm,
  farmReferenceRepository,
  localRecordRepository,
}: {
  farm: Farm;
  farmReferenceRepository: FarmReferenceRepository;
  localRecordRepository: LocalRecordRepository;
}) {
  const router = useRouter();
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [crops, setCrops] = useState<TrackedItem[]>([]);
  const [cropId, setCropId] = useState("");
  const [sourceLocationId, setSourceLocationId] = useState("");
  const [quantityText, setQuantityText] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadReferences() {
      const [nextLocations, nextCrops] = await Promise.all([
        listLocations(farm.id, farmReferenceRepository),
        listTrackedItems(farm.id, "crop", farmReferenceRepository),
      ]);

      setLocations(nextLocations);
      setCrops(nextCrops);
    }

    loadReferences();
  }, [farm.id, farmReferenceRepository]);

  const missingReferences = crops.length === 0 || locations.length === 0;

  async function handleSave() {
    setIsSaving(true);
    setErrors({});

    try {
      await recordHarvest(
        { farmId: farm.id, cropId, sourceLocationId, quantityText, unit, note },
        {
          clock: systemClock,
          farmReferenceRepository,
          idGenerator: localIdGenerator,
          localRecordRepository,
        },
      );
      router.replace("/harvest?saved=1");
    } catch (caughtError) {
      if (caughtError instanceof z.ZodError) {
        setErrors(mapZodErrors(caughtError));
      } else {
        setErrors({ form: "This harvest could not be saved on this device." });
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Harvest"
        supportingText="Record a crop harvest where the work happens. No reception is needed."
        title="Record harvest"
      />
      <LocalDataNotice />
      {missingReferences ? (
        <Card>
          <SectionHeading title="Finish setup first" />
          {crops.length === 0 ? <EmptyState text="Add a crop before recording a harvest." /> : null}
          {locations.length === 0 ? <EmptyState text="Add a location before recording a harvest." /> : null}
          <Button label="Back to farm setup" onPress={() => router.replace("/")} variant="secondary" />
        </Card>
      ) : (
        <Card>
          <SectionHeading detail="Saved harvests stay private on this device." title="Harvest details" />
          <SelectField
            error={errors.cropId}
            label="Crop"
            onChange={setCropId}
            options={crops.map((crop) => ({ label: crop.name, value: crop.id }))}
            value={cropId}
          />
          <SelectField
            error={errors.sourceLocationId}
            label="Source location"
            onChange={setSourceLocationId}
            options={locations.map((location) => ({ label: location.name, value: location.id }))}
            value={sourceLocationId}
          />
          <View style={styles.quantityRow}>
            <View style={styles.quantityInput}>
              <FormField
                error={errors.quantityText}
                keyboardType="decimal-pad"
                label="Amount"
                onChangeText={setQuantityText}
                placeholder="25"
                value={quantityText}
              />
            </View>
          </View>
          <SelectField
            error={errors.unit}
            label="Unit"
            onChange={setUnit}
            options={HARVEST_UNITS.map((harvestUnit) => ({ label: harvestUnit, value: harvestUnit }))}
            value={unit}
          />
          <FormField
            error={errors.note}
            label="Note"
            multiline
            onChangeText={setNote}
            placeholder="Optional"
            value={note}
          />
          {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
          <Button disabled={isSaving} label={isSaving ? "Saving..." : "Save harvest"} onPress={handleSave} />
        </Card>
      )}
    </Screen>
  );
}

function mapZodErrors(error: z.ZodError): FormErrors {
  const nextErrors: FormErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (field === "cropId") {
      nextErrors.cropId = issue.message;
    } else if (field === "sourceLocationId") {
      nextErrors.sourceLocationId = issue.message;
    } else if (field === "quantityText") {
      nextErrors.quantityText = issue.message;
    } else if (field === "unit") {
      nextErrors.unit = issue.message;
    } else if (field === "note") {
      nextErrors.note = issue.message;
    } else {
      nextErrors.form = issue.message;
    }
  }

  return nextErrors;
}

const styles = StyleSheet.create({
  quantityRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  quantityInput: {
    flex: 1,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
