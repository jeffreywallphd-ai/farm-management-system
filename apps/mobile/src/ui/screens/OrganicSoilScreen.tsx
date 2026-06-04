import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import { createOrganicSoilReport } from "../../application/use-cases/manage-organic-certification/CreateOrganicSoilReports";
import {
  recordCompostTemperatureLog,
  recordCropRotationRecord,
  recordManureApplication,
  recordSoilFertilityPractice,
  saveCompostBatch,
} from "../../application/use-cases/manage-organic-certification/ManageOrganicSoil";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import {
  SOIL_FERTILITY_PRACTICE_TYPE_LABELS,
  SOIL_FERTILITY_PRACTICE_TYPES,
  type CompostBatch,
  type SoilFertilityPracticeType,
} from "../../domain/organic/OrganicSoil";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { buildFarmPlaceOptions } from "../farmPlaceDisplay";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DateField } from "../components/DateField";
import { FormField } from "../components/FormField";
import { OrganicDashboardButton } from "../components/OrganicDashboardButton";
import { OrganicEvidencePanel } from "../components/OrganicEvidencePanel";
import { OrganicFarmEventPrompt } from "../components/OrganicFarmEventPrompt";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";

type ReportType = "soilFertility" | "compost" | "manure" | "rotation" | "erosion";

export function OrganicSoilScreen({
  crops,
  farm,
  farmEventRepository,
  farmReferenceRepository,
  locations,
  repository,
}: {
  crops: TrackedItem[];
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  farmReferenceRepository: FarmReferenceRepository;
  locations: FarmLocation[];
  repository: OrganicCertificationRepository;
}) {
  const [compostBatches, setCompostBatches] = useState<CompostBatch[]>([]);
  const [placeId, setPlaceId] = useState("");
  const [cropId, setCropId] = useState("");
  const [practiceType, setPracticeType] = useState<SoilFertilityPracticeType>("coverCrop");
  const [description, setDescription] = useState("");
  const [practiceDate, setPracticeDate] = useState("");
  const [evidence, setEvidence] = useState("");
  const [batchName, setBatchName] = useState("");
  const [batchIngredients, setBatchIngredients] = useState("");
  const [batchMethod, setBatchMethod] = useState<"windrow" | "staticAeratedPile" | "inVessel" | "other" | "">("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [temperatureF, setTemperatureF] = useState("");
  const [turned, setTurned] = useState("false");
  const [manureDate, setManureDate] = useState("");
  const [manureContactSoil, setManureContactSoil] = useState("false");
  const [manureType, setManureType] = useState("");
  const [rotationYear, setRotationYear] = useState(String(new Date().getFullYear()));
  const [rotationSeason, setRotationSeason] = useState("");
  const [previousCropId, setPreviousCropId] = useState("");
  const [coverCropUsed, setCoverCropUsed] = useState("false");
  const [error, setError] = useState<string | undefined>();
  const [report, setReport] = useState<string | undefined>();

  const placeOptions = useMemo(() => [{ label: "No place", value: "" }, ...buildFarmPlaceOptions(locations)], [locations]);
  const cropOptions = useMemo(() => [{ label: "No crop", value: "" }, ...crops.map((crop) => ({ label: crop.name, value: crop.id }))], [crops]);

  async function loadCompostBatches() {
    const batches = await repository.listCompostBatches(farm.id);
    setCompostBatches(batches);
    if (!selectedBatchId && batches[0]) {
      setSelectedBatchId(batches[0].id);
    }
  }

  useEffect(() => {
    loadCompostBatches();
  }, [farm.id, repository]);

  function errorMessage(caughtError: unknown, fallback: string) {
    return caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : fallback;
  }

  async function savePractice() {
    setError(undefined);
    try {
      await recordSoilFertilityPractice(
        { farmId: farm.id, placeId, cropId, practiceType, date: practiceDate, description, evidenceAttachmentIdsText: evidence },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository },
      );
      setDescription("");
      setEvidence("");
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Soil practice could not be saved."));
    }
  }

  async function saveBatch() {
    setError(undefined);
    try {
      const batch = await saveCompostBatch(
        { farmId: farm.id, name: batchName, ingredients: batchIngredients, compostingMethod: batchMethod || undefined },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      setSelectedBatchId(batch.id);
      setBatchName("");
      setBatchIngredients("");
      setBatchMethod("");
      await loadCompostBatches();
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Compost batch could not be saved."));
    }
  }

  async function saveTemperatureLog() {
    setError(undefined);
    try {
      await recordCompostTemperatureLog(
        { farmId: farm.id, compostBatchId: selectedBatchId, temperatureF, turned: turned === "true" },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      setTemperatureF("");
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Temperature log could not be saved."));
    }
  }

  async function saveManure() {
    setError(undefined);
    try {
      await recordManureApplication(
        { farmId: farm.id, placeId, cropId, applicationDate: manureDate, manureType, ediblePortionContactSoil: manureContactSoil === "true" },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository },
      );
      setManureDate("");
      setManureType("");
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Manure application could not be saved."));
    }
  }

  async function saveRotation() {
    setError(undefined);
    try {
      await recordCropRotationRecord(
        { farmId: farm.id, placeId, cropId, previousCropId, year: rotationYear, season: rotationSeason, coverCropUsed: coverCropUsed === "true" },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository },
      );
      setRotationSeason("");
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Rotation record could not be saved."));
    }
  }

  async function createReport(reportType: ReportType) {
    setError(undefined);
    setReport(await createOrganicSoilReport({ farm, reportType }, { clock: systemClock, repository }));
  }

  return (
    <Screen>
      <PageHeader eyebrow="Organic Certification" supportingText="Track soil-building practices, compost, manure intervals, and rotations locally." title="Organic soil" />
      <OrganicDashboardButton />
      <OrganicEvidencePanel category="soilFertility" farm={farm} farmEventRepository={farmEventRepository} repository={repository} />
      <OrganicEvidencePanel category="compost" farm={farm} farmEventRepository={farmEventRepository} repository={repository} />
      <OrganicEvidencePanel category="manure" farm={farm} farmEventRepository={farmEventRepository} repository={repository} />
      <Card>
        <SectionHeading title="Soil fertility practice" />
        <OrganicFarmEventPrompt category="soilFertility" />
        <SelectField label="Farm place" onChange={setPlaceId} options={placeOptions} value={placeId} />
        <SelectField label="Crop" onChange={setCropId} options={cropOptions} value={cropId} />
        <SelectField label="Practice type" onChange={(value) => setPracticeType(value as SoilFertilityPracticeType)} options={SOIL_FERTILITY_PRACTICE_TYPES.map((type) => ({ label: SOIL_FERTILITY_PRACTICE_TYPE_LABELS[type], value: type }))} value={practiceType} />
        <DateField label="Date" onChangeText={setPracticeDate} placeholder="YYYY-MM-DD or blank for now" value={practiceDate} />
        <FormField label="Description" multiline onChangeText={setDescription} placeholder="Cover crop, soil test, erosion-control note" value={description} />
        <FormField label="Evidence IDs or local references" multiline onChangeText={setEvidence} placeholder="Optional" value={evidence} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Save soil practice" onPress={savePractice} size="large" />
      </Card>
      <Card>
        <SectionHeading title="Compost batch" />
        <OrganicFarmEventPrompt category="compost" />
        <FormField label="Batch name" onChangeText={setBatchName} placeholder="Spring compost pile" value={batchName} />
        <FormField label="Ingredients" multiline onChangeText={setBatchIngredients} placeholder="Crop residue, leaves, manure" value={batchIngredients} />
        <SelectField label="Method" onChange={(value) => setBatchMethod(value as typeof batchMethod)} options={[{ label: "Not recorded", value: "" }, { label: "Windrow", value: "windrow" }, { label: "Static aerated pile", value: "staticAeratedPile" }, { label: "In-vessel", value: "inVessel" }, { label: "Other", value: "other" }]} value={batchMethod} />
        <Button label="Save compost batch" onPress={saveBatch} size="large" variant="secondary" />
        <SelectField label="Compost batch" onChange={setSelectedBatchId} options={compostBatches.map((batch) => ({ label: batch.name, value: batch.id }))} value={selectedBatchId} />
        <FormField label="Temperature F" keyboardType="decimal-pad" onChangeText={setTemperatureF} placeholder="145" value={temperatureF} />
        <SelectField label="Turned?" onChange={setTurned} options={[{ label: "No", value: "false" }, { label: "Yes", value: "true" }]} value={turned} />
        <Button label="Record compost temperature" onPress={saveTemperatureLog} size="large" variant="secondary" />
      </Card>
      <Card>
        <SectionHeading title="Manure interval" />
        <OrganicFarmEventPrompt category="manure" />
        <DateField label="Application date" onChangeText={setManureDate} placeholder="YYYY-MM-DD or blank for now" value={manureDate} />
        <FormField label="Manure type" onChangeText={setManureType} placeholder="Optional" value={manureType} />
        <SelectField label="Edible portion contacts soil?" onChange={setManureContactSoil} options={[{ label: "No, 90-day interval", value: "false" }, { label: "Yes, 120-day interval", value: "true" }]} value={manureContactSoil} />
        <Button label="Record manure application" onPress={saveManure} size="large" variant="secondary" />
      </Card>
      <Card>
        <SectionHeading title="Crop rotation" />
        <OrganicFarmEventPrompt category="soilFertility" />
        <FormField label="Year" keyboardType="decimal-pad" onChangeText={setRotationYear} value={rotationYear} />
        <FormField label="Season" onChangeText={setRotationSeason} placeholder="Spring, summer, fall" value={rotationSeason} />
        <SelectField label="Previous crop" onChange={setPreviousCropId} options={cropOptions} value={previousCropId} />
        <SelectField label="Cover crop used?" onChange={setCoverCropUsed} options={[{ label: "No", value: "false" }, { label: "Yes", value: "true" }]} value={coverCropUsed} />
        <Button label="Record rotation" onPress={saveRotation} size="large" variant="secondary" />
      </Card>
      <Card>
        <SectionHeading title="Organic soil reports" />
        <View style={styles.buttons}>
          <Button label="Soil Fertility Report" onPress={() => createReport("soilFertility")} size="large" variant="secondary" />
          <Button label="Compost Production Log" onPress={() => createReport("compost")} size="large" variant="secondary" />
          <Button label="Manure Interval Report" onPress={() => createReport("manure")} size="large" variant="secondary" />
          <Button label="Crop Rotation Report" onPress={() => createReport("rotation")} size="large" variant="secondary" />
          <Button label="Erosion Control Report" onPress={() => createReport("erosion")} size="large" variant="secondary" />
        </View>
        {report ? <Text style={styles.report}>{report}</Text> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: theme.spacing.sm },
  error: { color: theme.colors.error, fontSize: theme.typography.small, lineHeight: 20 },
  report: { color: theme.colors.textPrimary, fontSize: theme.typography.small, lineHeight: 20 },
});
