import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import { createOrganicSeedReport } from "../../application/use-cases/manage-organic-certification/CreateOrganicSeedReports";
import {
  recordCommercialAvailabilitySearch,
  recordOrganicPlantingEvent,
  saveSeedLot,
} from "../../application/use-cases/manage-organic-certification/ManageOrganicSeeds";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import {
  COMMERCIAL_AVAILABILITY_RESULT_LABELS,
  COMMERCIAL_AVAILABILITY_RESULTS,
  SEED_LOT_ORGANIC_STATUS_LABELS,
  SEED_LOT_ORGANIC_STATUSES,
  type CommercialAvailabilityResult,
  type SeedLot,
  type SeedLotOrganicStatus,
} from "../../domain/organic/OrganicSeed";
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

type ReportType = "seedLots" | "commercialAvailability" | "plantingEvents" | "traceability";

export function OrganicSeedsScreen({
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
  const [seedLots, setSeedLots] = useState<SeedLot[]>([]);
  const [editingSeedLotId, setEditingSeedLotId] = useState("");
  const [cropId, setCropId] = useState("");
  const [variety, setVariety] = useState("");
  const [supplier, setSupplier] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [organicStatus, setOrganicStatus] = useState<SeedLotOrganicStatus>("organic");
  const [seedTreatment, setSeedTreatment] = useState("");
  const [invoiceAttachmentId, setInvoiceAttachmentId] = useState("");
  const [labelAttachmentId, setLabelAttachmentId] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedSeedLotId, setSelectedSeedLotId] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [searchResult, setSearchResult] = useState<CommercialAvailabilityResult>("unavailable");
  const [searchEvidence, setSearchEvidence] = useState("");
  const [searchNotes, setSearchNotes] = useState("");
  const [plantPlaceId, setPlantPlaceId] = useState("");
  const [plantCropId, setPlantCropId] = useState("");
  const [plantDate, setPlantDate] = useState("");
  const [quantityPlanted, setQuantityPlanted] = useState("");
  const [plantingMethod, setPlantingMethod] = useState<"transplant" | "directSeed" | "">("");
  const [error, setError] = useState<string | undefined>();
  const [report, setReport] = useState<string | undefined>();

  const cropOptions = useMemo(() => [{ label: "No crop", value: "" }, ...crops.map((crop) => ({ label: crop.name, value: crop.id }))], [crops]);
  const seedLotOptions = useMemo(() => seedLots.map((seedLot) => ({ label: seedLot.variety, value: seedLot.id })), [seedLots]);

  async function loadSeedLots() {
    const nextSeedLots = await repository.listSeedLots(farm.id);
    setSeedLots(nextSeedLots);
    if (!selectedSeedLotId && nextSeedLots[0]) {
      setSelectedSeedLotId(nextSeedLots[0].id);
    }
  }

  useEffect(() => {
    loadSeedLots();
  }, [farm.id, repository]);

  function beginEdit(seedLot: SeedLot) {
    setEditingSeedLotId(seedLot.id);
    setCropId(seedLot.cropId ?? "");
    setVariety(seedLot.variety);
    setSupplier(seedLot.supplier ?? "");
    setLotNumber(seedLot.lotNumber ?? "");
    setPurchaseDate(seedLot.purchaseDate ?? "");
    setQuantity(seedLot.quantity ?? "");
    setOrganicStatus(seedLot.organicStatus);
    setSeedTreatment(seedLot.seedTreatment ?? "");
    setInvoiceAttachmentId(seedLot.invoiceAttachmentId ?? "");
    setLabelAttachmentId(seedLot.labelAttachmentId ?? "");
    setNotes(seedLot.notes ?? "");
  }

  function resetSeedLotForm() {
    setEditingSeedLotId("");
    setCropId("");
    setVariety("");
    setSupplier("");
    setLotNumber("");
    setPurchaseDate("");
    setQuantity("");
    setOrganicStatus("organic");
    setSeedTreatment("");
    setInvoiceAttachmentId("");
    setLabelAttachmentId("");
    setNotes("");
  }

  async function handleSaveSeedLot() {
    setError(undefined);
    setReport(undefined);
    try {
      const saved = await saveSeedLot(
        { farmId: farm.id, id: editingSeedLotId || undefined, cropId, variety, supplier, lotNumber, purchaseDate, quantity, organicStatus, seedTreatment, invoiceAttachmentId, labelAttachmentId, notes },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository },
      );
      setSelectedSeedLotId(saved.id);
      resetSeedLotForm();
      await loadSeedLots();
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : "Seed lot could not be saved.");
    }
  }

  async function handleRecordSearch() {
    setError(undefined);
    try {
      await recordCommercialAvailabilitySearch(
        { farmId: farm.id, seedLotId: selectedSeedLotId, crop: crops.find((crop) => crop.id === cropId)?.name, variety, supplierName: searchSupplier, result: searchResult, evidenceAttachmentId: searchEvidence, notes: searchNotes },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      setSearchSupplier("");
      setSearchEvidence("");
      setSearchNotes("");
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : "Commercial availability search could not be saved.");
    }
  }

  async function handleRecordPlanting() {
    setError(undefined);
    try {
      await recordOrganicPlantingEvent(
        { farmId: farm.id, seedLotId: selectedSeedLotId, cropId: plantCropId, placeId: plantPlaceId, date: plantDate, quantityPlanted, transplantOrDirectSeed: plantingMethod || undefined },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository },
      );
      setPlantDate("");
      setQuantityPlanted("");
      setPlantingMethod("");
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : "Planting event could not be saved.");
    }
  }

  async function handleCreateReport(reportType: ReportType) {
    setError(undefined);
    setReport(await createOrganicSeedReport({ farm, reportType }, { clock: systemClock, repository }));
  }

  return (
    <Screen>
      <PageHeader eyebrow="Organic Certification" supportingText="Track seed lots, commercial availability searches, and planting events locally." title="Organic seeds" />
      <OrganicDashboardButton />
      <OrganicEvidencePanel category="seeds" farm={farm} farmEventRepository={farmEventRepository} repository={repository} />
      <Card rootLevelHeader>
        <SectionHeading detail="Nonorganic seed records are evidence prompts for certifier review, not automatic approval." title="Seed lot" />
        <OrganicFarmEventPrompt category="seeds" />
        {seedLots.map((seedLot) => (
          <View key={seedLot.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.title}>{seedLot.variety}</Text>
              <Text style={styles.detail}>{SEED_LOT_ORGANIC_STATUS_LABELS[seedLot.organicStatus]}</Text>
            </View>
            <Button label="Edit" onPress={() => beginEdit(seedLot)} size="large" variant="secondary" />
            {editingSeedLotId === seedLot.id ? (
              <SeedLotForm
                cropId={cropId}
                cropOptions={cropOptions}
                invoiceAttachmentId={invoiceAttachmentId}
                labelAttachmentId={labelAttachmentId}
                lotNumber={lotNumber}
                notes={notes}
                organicStatus={organicStatus}
                purchaseDate={purchaseDate}
                quantity={quantity}
                saveLabel="Save seed lot changes"
                seedTreatment={seedTreatment}
                supplier={supplier}
                variety={variety}
                onCancel={resetSeedLotForm}
                onCropIdChange={setCropId}
                onInvoiceAttachmentIdChange={setInvoiceAttachmentId}
                onLabelAttachmentIdChange={setLabelAttachmentId}
                onLotNumberChange={setLotNumber}
                onNotesChange={setNotes}
                onOrganicStatusChange={(value) => setOrganicStatus(value as SeedLotOrganicStatus)}
                onPurchaseDateChange={setPurchaseDate}
                onQuantityChange={setQuantity}
                onSave={handleSaveSeedLot}
                onSeedTreatmentChange={setSeedTreatment}
                onSupplierChange={setSupplier}
                onVarietyChange={setVariety}
              />
            ) : null}
          </View>
        ))}
        {!editingSeedLotId ? (
          <SeedLotForm
            cropId={cropId}
            cropOptions={cropOptions}
            invoiceAttachmentId={invoiceAttachmentId}
            labelAttachmentId={labelAttachmentId}
            lotNumber={lotNumber}
            notes={notes}
            organicStatus={organicStatus}
            purchaseDate={purchaseDate}
            quantity={quantity}
            saveLabel="Save seed lot"
            seedTreatment={seedTreatment}
            supplier={supplier}
            variety={variety}
            onCropIdChange={setCropId}
            onInvoiceAttachmentIdChange={setInvoiceAttachmentId}
            onLabelAttachmentIdChange={setLabelAttachmentId}
            onLotNumberChange={setLotNumber}
            onNotesChange={setNotes}
            onOrganicStatusChange={(value) => setOrganicStatus(value as SeedLotOrganicStatus)}
            onPurchaseDateChange={setPurchaseDate}
            onQuantityChange={setQuantity}
            onSave={handleSaveSeedLot}
            onSeedTreatmentChange={setSeedTreatment}
            onSupplierChange={setSupplier}
            onVarietyChange={setVariety}
          />
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>
      <Card rootLevelHeader>
        <SectionHeading detail="Record searches used to document whether organic seed was commercially available." title="Commercial availability search" />
        <OrganicFarmEventPrompt category="seeds" />
        <SelectField label="Seed lot" onChange={setSelectedSeedLotId} options={seedLotOptions} value={selectedSeedLotId} />
        <FormField label="Supplier searched" onChangeText={setSearchSupplier} placeholder="Supplier name" value={searchSupplier} />
        <SelectField label="Result" onChange={(value) => setSearchResult(value as CommercialAvailabilityResult)} options={COMMERCIAL_AVAILABILITY_RESULTS.map((result) => ({ label: COMMERCIAL_AVAILABILITY_RESULT_LABELS[result], value: result }))} value={searchResult} />
        <FormField label="Evidence" onChangeText={setSearchEvidence} placeholder="Screenshot, catalog note, email" value={searchEvidence} />
        <FormField label="Notes" multiline onChangeText={setSearchNotes} placeholder="Variety, quantity, quality, timing details" value={searchNotes} />
        <Button label="Record search" onPress={handleRecordSearch} size="large" variant="secondary" />
      </Card>
      <Card rootLevelHeader>
        <SectionHeading detail="Link seed lots to planting records for local certification review." title="Planting event" />
        <OrganicFarmEventPrompt category="seeds" />
        <SelectField label="Seed lot" onChange={setSelectedSeedLotId} options={seedLotOptions} value={selectedSeedLotId} />
        <SelectField label="Crop" onChange={setPlantCropId} options={cropOptions} value={plantCropId} />
        <SelectField label="Farm place" onChange={setPlantPlaceId} options={[{ label: "No place", value: "" }, ...buildFarmPlaceOptions(locations)]} value={plantPlaceId} />
        <DateField label="Planting date" onChangeText={setPlantDate} placeholder="YYYY-MM-DD or blank for now" value={plantDate} />
        <FormField label="Quantity planted" onChangeText={setQuantityPlanted} placeholder="Optional" value={quantityPlanted} />
        <SelectField label="Method" onChange={(value) => setPlantingMethod(value as "transplant" | "directSeed" | "")} options={[{ label: "Not recorded", value: "" }, { label: "Transplant", value: "transplant" }, { label: "Direct seed", value: "directSeed" }]} value={plantingMethod} />
        <Button label="Record planting" onPress={handleRecordPlanting} size="large" variant="secondary" />
      </Card>
      <Card rootLevelHeader>
        <SectionHeading detail="Create local reports for seed lots, searches, and planting events." title="Organic seed reports" />
        <View style={styles.buttons}>
          <Button label="Seed and Planting Stock Report" onPress={() => handleCreateReport("seedLots")} size="large" variant="secondary" />
          <Button label="Commercial Availability Report" onPress={() => handleCreateReport("commercialAvailability")} size="large" variant="secondary" />
          <Button label="Planting Event Report" onPress={() => handleCreateReport("plantingEvents")} size="large" variant="secondary" />
          <Button label="Seed-to-Crop Traceability" onPress={() => handleCreateReport("traceability")} size="large" variant="secondary" />
        </View>
        {report ? <Text style={styles.report}>{report}</Text> : null}
      </Card>
    </Screen>
  );
}

function SeedLotForm({
  cropId,
  cropOptions,
  invoiceAttachmentId,
  labelAttachmentId,
  lotNumber,
  notes,
  organicStatus,
  purchaseDate,
  quantity,
  saveLabel,
  seedTreatment,
  supplier,
  variety,
  onCancel,
  onCropIdChange,
  onInvoiceAttachmentIdChange,
  onLabelAttachmentIdChange,
  onLotNumberChange,
  onNotesChange,
  onOrganicStatusChange,
  onPurchaseDateChange,
  onQuantityChange,
  onSave,
  onSeedTreatmentChange,
  onSupplierChange,
  onVarietyChange,
}: {
  cropId: string;
  cropOptions: Array<{ label: string; value: string }>;
  invoiceAttachmentId: string;
  labelAttachmentId: string;
  lotNumber: string;
  notes: string;
  organicStatus: SeedLotOrganicStatus;
  purchaseDate: string;
  quantity: string;
  saveLabel: string;
  seedTreatment: string;
  supplier: string;
  variety: string;
  onCancel?: () => void;
  onCropIdChange: (value: string) => void;
  onInvoiceAttachmentIdChange: (value: string) => void;
  onLabelAttachmentIdChange: (value: string) => void;
  onLotNumberChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onOrganicStatusChange: (value: string) => void;
  onPurchaseDateChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onSave: () => void;
  onSeedTreatmentChange: (value: string) => void;
  onSupplierChange: (value: string) => void;
  onVarietyChange: (value: string) => void;
}) {
  return (
    <View style={styles.inlineEdit}>
      <SelectField label="Crop" onChange={onCropIdChange} options={cropOptions} value={cropId} />
      <FormField label="Variety" onChangeText={onVarietyChange} placeholder="Red Russian kale" value={variety} />
      <FormField label="Supplier" onChangeText={onSupplierChange} placeholder="Optional" value={supplier} />
      <FormField label="Lot number" onChangeText={onLotNumberChange} placeholder="Optional" value={lotNumber} />
      <DateField label="Purchase date" onChangeText={onPurchaseDateChange} placeholder="YYYY-MM-DD" value={purchaseDate} />
      <FormField label="Quantity" onChangeText={onQuantityChange} placeholder="Optional" value={quantity} />
      <SelectField label="Organic status" onChange={onOrganicStatusChange} options={SEED_LOT_ORGANIC_STATUSES.map((status) => ({ label: SEED_LOT_ORGANIC_STATUS_LABELS[status], value: status }))} value={organicStatus} />
      <FormField label="Seed treatment" onChangeText={onSeedTreatmentChange} placeholder="Untreated, treatment name, or notes" value={seedTreatment} />
      <FormField label="Invoice evidence" onChangeText={onInvoiceAttachmentIdChange} placeholder="Optional local reference" value={invoiceAttachmentId} />
      <FormField label="Label evidence" onChangeText={onLabelAttachmentIdChange} placeholder="Optional local reference" value={labelAttachmentId} />
      <FormField label="Notes" multiline onChangeText={onNotesChange} placeholder="Optional" value={notes} />
      <Button label={saveLabel} onPress={onSave} size="large" />
      {onCancel ? <Button label="Cancel edit" onPress={onCancel} size="large" variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: theme.spacing.sm },
  detail: { color: theme.colors.textSecondary, fontSize: theme.typography.body, lineHeight: 22 },
  error: { color: theme.colors.error, fontSize: theme.typography.small, lineHeight: 20 },
  inlineEdit: { gap: theme.spacing.sm },
  report: { color: theme.colors.textPrimary, fontSize: theme.typography.small, lineHeight: 20 },
  row: { borderColor: theme.colors.border, borderRadius: theme.radius.sm, borderWidth: 1, gap: theme.spacing.sm, padding: theme.spacing.sm },
  rowText: { gap: 2 },
  title: { color: theme.colors.textPrimary, fontSize: theme.typography.body, fontWeight: "700" },
});
