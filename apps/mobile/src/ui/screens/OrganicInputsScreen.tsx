import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import { createOrganicInputReport } from "../../application/use-cases/manage-organic-certification/CreateOrganicInputReports";
import { recordOrganicInputApplication } from "../../application/use-cases/manage-organic-certification/RecordOrganicInputApplication";
import { saveOrganicInput } from "../../application/use-cases/manage-organic-certification/SaveOrganicInput";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import {
  ORGANIC_INPUT_APPROVAL_STATUS_LABELS,
  ORGANIC_INPUT_APPROVAL_STATUSES,
  ORGANIC_INPUT_CATEGORY_LABELS,
  ORGANIC_INPUT_CATEGORIES,
  type OrganicInput,
  type OrganicInputApprovalStatus,
  type OrganicInputCategory,
} from "../../domain/organic/OrganicInput";
import { PILOT_UNITS } from "../../domain/quantities/PilotUnit";
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

type ReportType = "inputList" | "applicationLog" | "approvalEvidence" | "needsReview";

export function OrganicInputsScreen({
  crops,
  farm,
  farmEventRepository,
  farmReferenceRepository,
  locations,
  materials,
  repository,
}: {
  crops: TrackedItem[];
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  farmReferenceRepository: FarmReferenceRepository;
  locations: FarmLocation[];
  materials: TrackedItem[];
  repository: OrganicCertificationRepository;
}) {
  const [inputs, setInputs] = useState<OrganicInput[]>([]);
  const [editingInputId, setEditingInputId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [name, setName] = useState("");
  const [inputCategory, setInputCategory] = useState<OrganicInputCategory>("fertility");
  const [manufacturer, setManufacturer] = useState("");
  const [supplier, setSupplier] = useState("");
  const [composition, setComposition] = useState("");
  const [source, setSource] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<OrganicInputApprovalStatus>("needsReview");
  const [approvalEvidenceAttachmentIdsText, setApprovalEvidenceAttachmentIdsText] = useState("");
  const [certifierApprovalDate, setCertifierApprovalDate] = useState("");
  const [approvalExpirationDate, setApprovalExpirationDate] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [notes, setNotes] = useState("");
  const [applicationInputId, setApplicationInputId] = useState("");
  const [applicationPlaceId, setApplicationPlaceId] = useState("");
  const [applicationCropId, setApplicationCropId] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [rate, setRate] = useState("");
  const [reason, setReason] = useState("");
  const [targetProblem, setTargetProblem] = useState("");
  const [weatherNotes, setWeatherNotes] = useState("");
  const [appliedBy, setAppliedBy] = useState("");
  const [applicationEvidenceText, setApplicationEvidenceText] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [report, setReport] = useState<string | undefined>();

  const materialOptions = useMemo(
    () => [{ label: "No setup material link", value: "" }, ...materials.map((material) => ({ label: material.name, value: material.id }))],
    [materials],
  );
  const inputOptions = useMemo(
    () => inputs.map((input) => ({ label: input.name, value: input.id })),
    [inputs],
  );

  async function loadInputs() {
    const nextInputs = await repository.listOrganicInputs(farm.id);
    setInputs(nextInputs);
    if (!applicationInputId && nextInputs[0]) {
      setApplicationInputId(nextInputs[0].id);
    }
  }

  useEffect(() => {
    loadInputs();
  }, [farm.id, repository]);

  function beginEdit(input: OrganicInput) {
    setEditingInputId(input.id);
    setMaterialId(input.materialId ?? "");
    setName(input.name);
    setInputCategory(input.inputCategory);
    setManufacturer(input.manufacturer ?? "");
    setSupplier(input.supplier ?? "");
    setComposition(input.composition ?? "");
    setSource(input.source ?? "");
    setApprovalStatus(input.approvalStatus);
    setApprovalEvidenceAttachmentIdsText(input.approvalEvidenceAttachmentIds.join("\n"));
    setCertifierApprovalDate(input.certifierApprovalDate ?? "");
    setApprovalExpirationDate(input.approvalExpirationDate ?? "");
    setRestrictions(input.restrictions ?? "");
    setNotes(input.notes ?? "");
    setError(undefined);
  }

  function resetInputForm() {
    setEditingInputId("");
    setMaterialId("");
    setName("");
    setInputCategory("fertility");
    setManufacturer("");
    setSupplier("");
    setComposition("");
    setSource("");
    setApprovalStatus("needsReview");
    setApprovalEvidenceAttachmentIdsText("");
    setCertifierApprovalDate("");
    setApprovalExpirationDate("");
    setRestrictions("");
    setNotes("");
  }

  async function handleSaveInput() {
    setError(undefined);
    setReport(undefined);

    try {
      const saved = await saveOrganicInput(
        {
          farmId: farm.id,
          id: editingInputId || undefined,
          materialId,
          name,
          inputCategory,
          manufacturer,
          supplier,
          composition,
          source,
          approvalStatus,
          approvalEvidenceAttachmentIdsText,
          certifierApprovalDate,
          approvalExpirationDate,
          restrictions,
          notes,
        },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository },
      );
      setApplicationInputId(saved.id);
      resetInputForm();
      await loadInputs();
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : "Organic input could not be saved.");
    }
  }

  async function handleRecordApplication() {
    setError(undefined);
    setReport(undefined);

    try {
      await recordOrganicInputApplication(
        {
          farmId: farm.id,
          inputId: applicationInputId,
          placeId: applicationPlaceId,
          cropId: applicationCropId,
          date: applicationDate,
          quantity,
          unit,
          rate,
          reason,
          targetProblem,
          weatherNotes,
          appliedBy,
          evidenceAttachmentIdsText: applicationEvidenceText,
        },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository },
      );
      setApplicationDate("");
      setQuantity("");
      setUnit("");
      setRate("");
      setReason("");
      setTargetProblem("");
      setWeatherNotes("");
      setAppliedBy("");
      setApplicationEvidenceText("");
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : "Organic input application could not be saved.");
    }
  }

  async function handleCreateReport(reportType: ReportType) {
    setError(undefined);
    setReport(await createOrganicInputReport({ farm, reportType }, { clock: systemClock, repository }));
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Organic Certification"
        supportingText="Track organic input approvals, labels, restrictions, and use history for certifier review."
        title="Organic inputs"
      />
      <OrganicDashboardButton />
      <OrganicEvidencePanel category="inputs" farm={farm} farmEventRepository={farmEventRepository} repository={repository} />
      <Card>
        <SectionHeading detail="Approval status is farmer-entered. Confirm input acceptability with your certifier." title="Organic input details" />
        <OrganicFarmEventPrompt category="inputs" />
        {inputs.map((input) => (
          <View key={input.id} style={styles.inputRow}>
            <View style={styles.inputText}>
              <Text style={styles.inputTitle}>{input.name}</Text>
              <Text style={styles.inputDetail}>
                {ORGANIC_INPUT_CATEGORY_LABELS[input.inputCategory]} - {ORGANIC_INPUT_APPROVAL_STATUS_LABELS[input.approvalStatus]}
              </Text>
            </View>
            <Button label="Edit" onPress={() => beginEdit(input)} size="large" variant="secondary" />
          </View>
        ))}
        <SelectField label="Linked setup material" onChange={setMaterialId} options={materialOptions} value={materialId} />
        <FormField label="Input name" onChangeText={setName} placeholder="Compost, copper spray, sanitizer" value={name} />
        <SelectField
          label="Input category"
          onChange={(value) => setInputCategory(value as OrganicInputCategory)}
          options={ORGANIC_INPUT_CATEGORIES.map((category) => ({ label: ORGANIC_INPUT_CATEGORY_LABELS[category], value: category }))}
          value={inputCategory}
        />
        <SelectField
          label="Approval status"
          onChange={(value) => setApprovalStatus(value as OrganicInputApprovalStatus)}
          options={ORGANIC_INPUT_APPROVAL_STATUSES.map((status) => ({ label: ORGANIC_INPUT_APPROVAL_STATUS_LABELS[status], value: status }))}
          value={approvalStatus}
        />
        <FormField label="Manufacturer" onChangeText={setManufacturer} placeholder="Optional" value={manufacturer} />
        <FormField label="Supplier" onChangeText={setSupplier} placeholder="Optional" value={supplier} />
        <FormField label="Composition" multiline onChangeText={setComposition} placeholder="Ingredients, analysis, label composition" value={composition} />
        <FormField label="Source" onChangeText={setSource} placeholder="Where it came from" value={source} />
        <FormField label="Approval evidence IDs or local references" multiline onChangeText={setApprovalEvidenceAttachmentIdsText} placeholder="Label photo, receipt, OMRI listing, certifier email" value={approvalEvidenceAttachmentIdsText} />
        <DateField label="Certifier approval date" onChangeText={setCertifierApprovalDate} placeholder="YYYY-MM-DD" value={certifierApprovalDate} />
        <DateField label="Approval expiration date" onChangeText={setApprovalExpirationDate} placeholder="YYYY-MM-DD" value={approvalExpirationDate} />
        <FormField label="Restrictions" multiline onChangeText={setRestrictions} placeholder="Rate limits, crop restrictions, certifier conditions" value={restrictions} />
        <FormField label="Notes" multiline onChangeText={setNotes} placeholder="Optional" value={notes} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={editingInputId ? "Save organic input changes" : "Save organic input"} onPress={handleSaveInput} size="large" />
        {editingInputId ? <Button label="Cancel edit" onPress={resetInputForm} size="large" variant="secondary" /> : null}
      </Card>
      <Card>
        <SectionHeading detail="Use this for organic input applications that need place, crop, amount, reason, and evidence context." title="Input application" />
        <OrganicFarmEventPrompt category="inputs" />
        {inputs.length === 0 ? (
          <Text style={styles.inputDetail}>Save an organic input before recording applications.</Text>
        ) : (
          <>
            <SelectField label="Organic input" onChange={setApplicationInputId} options={inputOptions} value={applicationInputId} />
            <SelectField label="Farm place" onChange={setApplicationPlaceId} options={[{ label: "No place", value: "" }, ...buildFarmPlaceOptions(locations)]} value={applicationPlaceId} />
            <SelectField label="Crop" onChange={setApplicationCropId} options={[{ label: "No crop", value: "" }, ...crops.map((crop) => ({ label: crop.name, value: crop.id }))]} value={applicationCropId} />
            <DateField label="Application date" onChangeText={setApplicationDate} placeholder="YYYY-MM-DD or leave blank for now" value={applicationDate} />
            <FormField label="Quantity" onChangeText={setQuantity} placeholder="2" value={quantity} />
            <SelectField label="Unit" onChange={setUnit} options={[{ label: "No unit", value: "" }, ...PILOT_UNITS.map((pilotUnit) => ({ label: pilotUnit, value: pilotUnit }))]} value={unit} />
            <FormField label="Rate" onChangeText={setRate} placeholder="Optional rate" value={rate} />
            <FormField label="Reason" multiline onChangeText={setReason} placeholder="Why this input was used" value={reason} />
            <FormField label="Target problem" onChangeText={setTargetProblem} placeholder="Optional" value={targetProblem} />
            <FormField label="Weather notes" multiline onChangeText={setWeatherNotes} placeholder="Optional" value={weatherNotes} />
            <FormField label="Applied by" onChangeText={setAppliedBy} placeholder="Optional" value={appliedBy} />
            <FormField label="Evidence IDs or local references" multiline onChangeText={setApplicationEvidenceText} placeholder="Photo, receipt, label, or farm note reference" value={applicationEvidenceText} />
            <Button label="Record input application" onPress={handleRecordApplication} size="large" variant="secondary" />
          </>
        )}
      </Card>
      <Card>
        <SectionHeading title="Organic input reports" />
        <View style={styles.buttonStack}>
          <Button label="Input List for OSP" onPress={() => handleCreateReport("inputList")} size="large" variant="secondary" />
          <Button label="Input Application Log" onPress={() => handleCreateReport("applicationLog")} size="large" variant="secondary" />
          <Button label="Approval Evidence Packet" onPress={() => handleCreateReport("approvalEvidence")} size="large" variant="secondary" />
          <Button label="Needs Review Inputs" onPress={() => handleCreateReport("needsReview")} size="large" variant="secondary" />
        </View>
        {report ? <Text style={styles.report}>{report}</Text> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttonStack: {
    gap: theme.spacing.sm,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  inputRow: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  inputText: {
    gap: 2,
  },
  inputTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  inputDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  report: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
