import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import { createOrganicPestReport } from "../../application/use-cases/manage-organic-certification/CreateOrganicPestReports";
import { recordPestWeedDiseaseAction, recordPestWeedDiseaseObservation, recordPlasticMulchRecord } from "../../application/use-cases/manage-organic-certification/ManageOrganicPest";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import { PEST_WEED_DISEASE_ACTION_TYPE_LABELS, PEST_WEED_DISEASE_ACTION_TYPES, PEST_WEED_DISEASE_TYPE_LABELS, PEST_WEED_DISEASE_TYPES, type PestWeedDiseaseActionType, type PestWeedDiseaseObservation, type PestWeedDiseaseType } from "../../domain/organic/OrganicPest";
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

type ReportType = "pest" | "weed" | "disease" | "inputEscalation" | "plasticMulch";

export function OrganicPestScreen({ crops, farm, farmEventRepository, farmReferenceRepository, locations, repository }: { crops: TrackedItem[]; farm: Farm; farmEventRepository: FarmEventRepository; farmReferenceRepository: FarmReferenceRepository; locations: FarmLocation[]; repository: OrganicCertificationRepository }) {
  const [observations, setObservations] = useState<PestWeedDiseaseObservation[]>([]);
  const [placeId, setPlaceId] = useState("");
  const [cropId, setCropId] = useState("");
  const [type, setType] = useState<PestWeedDiseaseType>("pest");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [observationId, setObservationId] = useState("");
  const [actionType, setActionType] = useState<PestWeedDiseaseActionType>("prevention");
  const [actionDescription, setActionDescription] = useState("");
  const [whyNeeded, setWhyNeeded] = useState("");
  const [mulchMaterial, setMulchMaterial] = useState("");
  const [mulchRemovedDate, setMulchRemovedDate] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [report, setReport] = useState<string | undefined>();
  const placeOptions = useMemo(() => [{ label: "No place", value: "" }, ...buildFarmPlaceOptions(locations)], [locations]);
  const cropOptions = useMemo(() => [{ label: "No crop", value: "" }, ...crops.map((crop) => ({ label: crop.name, value: crop.id }))], [crops]);

  async function loadObservations() {
    const next = await repository.listPestWeedDiseaseObservations(farm.id);
    setObservations(next);
    if (!observationId && next[0]) setObservationId(next[0].id);
  }
  useEffect(() => { loadObservations(); }, [farm.id, repository]);
  const message = (caught: unknown, fallback: string) => caught instanceof z.ZodError ? caught.issues[0]?.message : fallback;

  async function saveObservation() {
    setError(undefined);
    try {
      const saved = await recordPestWeedDiseaseObservation({ farmId: farm.id, type, placeId, cropId, severity, description }, { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository });
      setObservationId(saved.id);
      setDescription("");
      await loadObservations();
    } catch (caught) { setError(message(caught, "Observation could not be saved.")); }
  }

  async function saveAction() {
    setError(undefined);
    try {
      await recordPestWeedDiseaseAction({ farmId: farm.id, observationId, actionType, description: actionDescription, whyNeeded }, { clock: systemClock, idGenerator: localIdGenerator, repository });
      setActionDescription("");
      setWhyNeeded("");
    } catch (caught) { setError(message(caught, "Action could not be saved.")); }
  }

  async function saveMulch() {
    setError(undefined);
    try {
      await recordPlasticMulchRecord({ farmId: farm.id, placeId, cropId, material: mulchMaterial, removedDate: mulchRemovedDate }, { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository });
      setMulchMaterial("");
      setMulchRemovedDate("");
    } catch (caught) { setError(message(caught, "Plastic mulch record could not be saved.")); }
  }

  async function createReport(reportType: ReportType) {
    setReport(await createOrganicPestReport({ farm, reportType }, { clock: systemClock, repository }));
  }

  return (
    <Screen>
      <PageHeader eyebrow="Organic Certification" supportingText="Track pest, weed, disease, prevention, control actions, and mulch removal locally." title="Organic pest/weed/disease" />
      <OrganicDashboardButton />
      <OrganicEvidencePanel category="pest" farm={farm} farmEventRepository={farmEventRepository} repository={repository} />
      <Card>
        <SectionHeading title="Observation" />
        <OrganicFarmEventPrompt category="pest" />
        <SelectField label="Farm place" onChange={setPlaceId} options={placeOptions} value={placeId} />
        <SelectField label="Crop" onChange={setCropId} options={cropOptions} value={cropId} />
        <SelectField label="Type" onChange={(value) => setType(value as PestWeedDiseaseType)} options={PEST_WEED_DISEASE_TYPES.map((item) => ({ label: PEST_WEED_DISEASE_TYPE_LABELS[item], value: item }))} value={type} />
        <FormField label="Severity" onChangeText={setSeverity} placeholder="Optional" value={severity} />
        <FormField label="Description" multiline onChangeText={setDescription} placeholder="What did you observe?" value={description} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Save observation" onPress={saveObservation} size="large" />
      </Card>
      <Card>
        <SectionHeading title="Action" />
        <OrganicFarmEventPrompt category="pest" />
        <SelectField label="Observation" onChange={setObservationId} options={observations.map((observation) => ({ label: observation.description, value: observation.id }))} value={observationId} />
        <SelectField label="Action type" onChange={(value) => setActionType(value as PestWeedDiseaseActionType)} options={PEST_WEED_DISEASE_ACTION_TYPES.map((item) => ({ label: PEST_WEED_DISEASE_ACTION_TYPE_LABELS[item], value: item }))} value={actionType} />
        <FormField label="Action description" multiline onChangeText={setActionDescription} placeholder="Prevention, sanitation, mechanical control, biological control, or input use" value={actionDescription} />
        <FormField label="Why needed" multiline onChangeText={setWhyNeeded} placeholder="Required when escalating beyond prevention" value={whyNeeded} />
        <Button label="Save action" onPress={saveAction} size="large" variant="secondary" />
      </Card>
      <Card>
        <SectionHeading title="Plastic mulch" />
        <OrganicFarmEventPrompt category="pest" />
        <FormField label="Material" onChangeText={setMulchMaterial} placeholder="Plastic mulch" value={mulchMaterial} />
        <DateField label="Removed date" onChangeText={setMulchRemovedDate} placeholder="YYYY-MM-DD" value={mulchRemovedDate} />
        <Button label="Record mulch removal" onPress={saveMulch} size="large" variant="secondary" />
      </Card>
      <Card>
        <SectionHeading title="Organic pest reports" />
        <View style={styles.buttons}>
          <Button label="Pest Report" onPress={() => createReport("pest")} size="large" variant="secondary" />
          <Button label="Weed Report" onPress={() => createReport("weed")} size="large" variant="secondary" />
          <Button label="Disease Report" onPress={() => createReport("disease")} size="large" variant="secondary" />
          <Button label="Input Escalation Report" onPress={() => createReport("inputEscalation")} size="large" variant="secondary" />
          <Button label="Plastic Mulch Report" onPress={() => createReport("plasticMulch")} size="large" variant="secondary" />
        </View>
        {report ? <Text style={styles.report}>{report}</Text> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({ buttons: { gap: theme.spacing.sm }, error: { color: theme.colors.error, fontSize: theme.typography.small, lineHeight: 20 }, report: { color: theme.colors.textPrimary, fontSize: theme.typography.small, lineHeight: 20 } });
