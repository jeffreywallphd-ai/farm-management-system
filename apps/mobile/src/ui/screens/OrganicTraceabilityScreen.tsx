import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import { createOrganicTraceabilityReport } from "../../application/use-cases/manage-organic-certification/CreateOrganicTraceabilityReports";
import {
  recordOrganicHandlingEvent,
  recordOrganicSaleRecord,
  recordOrganicStorageRecord,
  saveOrganicLot,
} from "../../application/use-cases/manage-organic-certification/ManageOrganicTraceability";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import {
  ORGANIC_HANDLING_EVENT_TYPE_LABELS,
  ORGANIC_HANDLING_EVENT_TYPES,
  ORGANIC_LOT_STATUS_LABELS,
  ORGANIC_LOT_STATUSES,
  type OrganicHandlingEventType,
  type OrganicLot,
  type OrganicLotStatus,
} from "../../domain/organic/OrganicTraceability";
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

type ReportType = "lots" | "handling" | "storage" | "sales" | "massBalance";

export function OrganicTraceabilityScreen({
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
  const [lots, setLots] = useState<OrganicLot[]>([]);
  const [editingLotId, setEditingLotId] = useState("");
  const [lotCode, setLotCode] = useState("");
  const [cropId, setCropId] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [organicStatus, setOrganicStatus] = useState<OrganicLotStatus>("organic");
  const [quantityHarvested, setQuantityHarvested] = useState("");
  const [unit, setUnit] = useState("lb");
  const [createdFromHarvestRecordId, setCreatedFromHarvestRecordId] = useState("");
  const [lotNotes, setLotNotes] = useState("");
  const [selectedLotId, setSelectedLotId] = useState("");
  const [handlingType, setHandlingType] = useState<OrganicHandlingEventType>("wash");
  const [handlingDate, setHandlingDate] = useState("");
  const [inputLotIdsText, setInputLotIdsText] = useState("");
  const [outputLotIdsText, setOutputLotIdsText] = useState("");
  const [quantityIn, setQuantityIn] = useState("");
  const [quantityOut, setQuantityOut] = useState("");
  const [facilityPlaceId, setFacilityPlaceId] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState("");
  const [storagePlaceId, setStoragePlaceId] = useState("");
  const [dateIn, setDateIn] = useState("");
  const [dateOut, setDateOut] = useState("");
  const [storageQuantityIn, setStorageQuantityIn] = useState("");
  const [storageQuantityOut, setStorageQuantityOut] = useState("");
  const [containerId, setContainerId] = useState("");
  const [buyer, setBuyer] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [organicClaim, setOrganicClaim] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [report, setReport] = useState<string | undefined>();

  const placeOptions = useMemo(() => buildFarmPlaceOptions(locations), [locations]);
  const cropOptions = useMemo(() => crops.map((crop) => ({ label: crop.name, value: crop.id })), [crops]);
  const lotOptions = useMemo(() => lots.map((lot) => ({ label: lot.lotCode, value: lot.id })), [lots]);

  async function loadLots() {
    const nextLots = await repository.listOrganicLots(farm.id);
    setLots(nextLots);
    if (!selectedLotId && nextLots[0]) setSelectedLotId(nextLots[0].id);
  }

  useEffect(() => {
    loadLots();
  }, [farm.id, repository]);

  function beginEdit(lot: OrganicLot) {
    setEditingLotId(lot.id);
    setLotCode(lot.lotCode);
    setCropId(lot.cropId);
    setPlaceId(lot.placeId);
    setHarvestDate(lot.harvestDate.slice(0, 10));
    setOrganicStatus(lot.organicStatus);
    setQuantityHarvested(String(lot.quantityHarvested));
    setUnit(lot.unit);
    setCreatedFromHarvestRecordId(lot.createdFromHarvestRecordId ?? "");
    setLotNotes(lot.notes ?? "");
    setError(undefined);
  }

  function resetLotForm() {
    setEditingLotId("");
    setLotCode("");
    setCropId("");
    setPlaceId("");
    setHarvestDate("");
    setOrganicStatus("organic");
    setQuantityHarvested("");
    setUnit("lb");
    setCreatedFromHarvestRecordId("");
    setLotNotes("");
  }

  function message(caught: unknown, fallback: string) {
    return caught instanceof z.ZodError ? caught.issues[0]?.message : fallback;
  }

  async function handleSaveLot() {
    setError(undefined);
    try {
      const saved = await saveOrganicLot(
        { farmId: farm.id, id: editingLotId || undefined, lotCode, cropId, placeId, harvestDate, organicStatus, quantityHarvested, unit, createdFromHarvestRecordId, notes: lotNotes },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository },
      );
      setSelectedLotId(saved.id);
      resetLotForm();
      await loadLots();
    } catch (caught) {
      setError(message(caught, "Organic lot could not be saved."));
    }
  }

  async function handleRecordHandling() {
    setError(undefined);
    try {
      await recordOrganicHandlingEvent(
        { farmId: farm.id, lotId: selectedLotId, eventType: handlingType, eventDate: handlingDate, inputLotIdsText, outputLotIdsText, quantityIn, quantityOut, unit, facilityPlaceId, equipmentUsed },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository },
      );
      setHandlingDate("");
      setInputLotIdsText("");
      setOutputLotIdsText("");
      setQuantityIn("");
      setQuantityOut("");
      setEquipmentUsed("");
    } catch (caught) {
      setError(message(caught, "Handling event could not be saved."));
    }
  }

  async function handleRecordStorage() {
    setError(undefined);
    try {
      await recordOrganicStorageRecord(
        { farmId: farm.id, lotId: selectedLotId, storagePlaceId, dateIn, dateOut, quantityIn: storageQuantityIn, quantityOut: storageQuantityOut, unit, containerId },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, repository },
      );
      setDateIn("");
      setDateOut("");
      setStorageQuantityIn("");
      setStorageQuantityOut("");
      setContainerId("");
    } catch (caught) {
      setError(message(caught, "Storage record could not be saved."));
    }
  }

  async function handleRecordSale() {
    setError(undefined);
    try {
      await recordOrganicSaleRecord(
        { farmId: farm.id, lotId: selectedLotId, buyer, saleDate, quantity: saleQuantity, unit, invoiceNumber, organicClaim },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      setBuyer("");
      setSaleDate("");
      setSaleQuantity("");
      setInvoiceNumber("");
      setOrganicClaim("");
    } catch (caught) {
      setError(message(caught, "Sale record could not be saved."));
    }
  }

  async function handleCreateReport(reportType: ReportType) {
    setReport(await createOrganicTraceabilityReport({ farm, reportType, lotId: selectedLotId || undefined }, { clock: systemClock, farmReferenceRepository, repository }));
  }

  return (
    <Screen>
      <PageHeader eyebrow="Organic Certification" supportingText="Link harvest lots to handling, storage, sales, and mass-balance records kept locally." title="Organic traceability" />
      <OrganicDashboardButton />
      <OrganicEvidencePanel category="lotTraceability" farm={farm} farmEventRepository={farmEventRepository} repository={repository} />
      <OrganicEvidencePanel category="handlingMassBalance" farm={farm} farmEventRepository={farmEventRepository} repository={repository} />
      <Card rootLevelHeader>
        <SectionHeading detail="Lots are farmer-entered traceability records. Link an existing harvest record ID when useful." title="Harvest lot" />
        <OrganicFarmEventPrompt category="lotTraceability" />
        {lots.map((lot) => (
          <View key={lot.id} style={styles.lotRow}>
            <View style={styles.lotText}>
              <Text style={styles.lotTitle}>{lot.lotCode}</Text>
              <Text style={styles.lotDetail}>{ORGANIC_LOT_STATUS_LABELS[lot.organicStatus]} - {lot.quantityHarvested} {lot.unit}</Text>
            </View>
            <Button label="Edit" onPress={() => beginEdit(lot)} size="large" variant="secondary" />
            {editingLotId === lot.id ? (
              <LotForm
                createdFromHarvestRecordId={createdFromHarvestRecordId}
                cropId={cropId}
                cropOptions={cropOptions}
                harvestDate={harvestDate}
                lotCode={lotCode}
                lotNotes={lotNotes}
                organicStatus={organicStatus}
                placeId={placeId}
                placeOptions={placeOptions}
                quantityHarvested={quantityHarvested}
                unit={unit}
                onCancel={resetLotForm}
                onCreatedFromHarvestRecordIdChange={setCreatedFromHarvestRecordId}
                onCropIdChange={setCropId}
                onHarvestDateChange={setHarvestDate}
                onLotCodeChange={setLotCode}
                onLotNotesChange={setLotNotes}
                onOrganicStatusChange={(value) => setOrganicStatus(value as OrganicLotStatus)}
                onPlaceIdChange={setPlaceId}
                onQuantityHarvestedChange={setQuantityHarvested}
                onSave={handleSaveLot}
                onUnitChange={setUnit}
                saveLabel="Save lot changes"
              />
            ) : null}
          </View>
        ))}
        {!editingLotId ? (
          <LotForm
            createdFromHarvestRecordId={createdFromHarvestRecordId}
            cropId={cropId}
            cropOptions={cropOptions}
            harvestDate={harvestDate}
            lotCode={lotCode}
            lotNotes={lotNotes}
            organicStatus={organicStatus}
            placeId={placeId}
            placeOptions={placeOptions}
            quantityHarvested={quantityHarvested}
            unit={unit}
            onCreatedFromHarvestRecordIdChange={setCreatedFromHarvestRecordId}
            onCropIdChange={setCropId}
            onHarvestDateChange={setHarvestDate}
            onLotCodeChange={setLotCode}
            onLotNotesChange={setLotNotes}
            onOrganicStatusChange={(value) => setOrganicStatus(value as OrganicLotStatus)}
            onPlaceIdChange={setPlaceId}
            onQuantityHarvestedChange={setQuantityHarvested}
            onSave={handleSaveLot}
            onUnitChange={setUnit}
            saveLabel="Save organic lot"
          />
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>
      <Card rootLevelHeader>
        <SectionHeading detail="Record lot movement through handling, storage, and sales for traceability review." title="Handling, storage, and sales" />
        <OrganicFarmEventPrompt category="handlingMassBalance" />
        {lots.length === 0 ? (
          <Text style={styles.lotDetail}>Save an organic lot before recording movement or sales.</Text>
        ) : (
          <>
            <SelectField label="Lot" onChange={setSelectedLotId} options={lotOptions} value={selectedLotId} />
            <SelectField label="Handling type" onChange={(value) => setHandlingType(value as OrganicHandlingEventType)} options={ORGANIC_HANDLING_EVENT_TYPES.map((type) => ({ label: ORGANIC_HANDLING_EVENT_TYPE_LABELS[type], value: type }))} value={handlingType} />
            <DateField label="Handling date" onChangeText={setHandlingDate} placeholder="YYYY-MM-DD or leave blank" value={handlingDate} />
            <FormField label="Input lot IDs" multiline onChangeText={setInputLotIdsText} placeholder="Optional, one per line or comma-separated for combine/split events" value={inputLotIdsText} />
            <FormField label="Output lot IDs" multiline onChangeText={setOutputLotIdsText} placeholder="Optional, one per line or comma-separated for combine/split events" value={outputLotIdsText} />
            <FormField label="Quantity in" keyboardType="decimal-pad" onChangeText={setQuantityIn} placeholder="Optional" value={quantityIn} />
            <FormField label="Quantity out" keyboardType="decimal-pad" onChangeText={setQuantityOut} placeholder="Optional" value={quantityOut} />
            <SelectField label="Handling place" onChange={setFacilityPlaceId} options={[{ label: "No handling place", value: "" }, ...placeOptions]} value={facilityPlaceId} />
            <FormField label="Equipment used" onChangeText={setEquipmentUsed} placeholder="Washer, table, bins" value={equipmentUsed} />
            <Button label="Record handling event" onPress={handleRecordHandling} size="large" variant="secondary" />
            <SelectField label="Storage place" onChange={setStoragePlaceId} options={placeOptions} value={storagePlaceId} />
            <DateField label="Date in" onChangeText={setDateIn} placeholder="YYYY-MM-DD" value={dateIn} />
            <DateField label="Date out" onChangeText={setDateOut} placeholder="YYYY-MM-DD or blank" value={dateOut} />
            <FormField label="Storage quantity in" keyboardType="decimal-pad" onChangeText={setStorageQuantityIn} placeholder="25" value={storageQuantityIn} />
            <FormField label="Storage quantity out" keyboardType="decimal-pad" onChangeText={setStorageQuantityOut} placeholder="Optional" value={storageQuantityOut} />
            <FormField label="Container ID" onChangeText={setContainerId} placeholder="Bin or tote ID" value={containerId} />
            <Button label="Record storage" onPress={handleRecordStorage} size="large" variant="secondary" />
            <FormField label="Buyer" onChangeText={setBuyer} placeholder="Buyer or market" value={buyer} />
            <DateField label="Sale date" onChangeText={setSaleDate} placeholder="YYYY-MM-DD" value={saleDate} />
            <FormField label="Sale quantity" keyboardType="decimal-pad" onChangeText={setSaleQuantity} placeholder="10" value={saleQuantity} />
            <FormField label="Invoice number" onChangeText={setInvoiceNumber} placeholder="Optional" value={invoiceNumber} />
            <FormField label="Organic claim" onChangeText={setOrganicClaim} placeholder="Optional label or claim wording" value={organicClaim} />
            <Button label="Record sale" onPress={handleRecordSale} size="large" variant="secondary" />
          </>
        )}
      </Card>
      <Card rootLevelHeader>
        <SectionHeading detail="Create local reports for harvest lots, handling, storage, sales, and mass balance." title="Organic traceability reports" />
        <View style={styles.buttons}>
          <Button label="Lot Traceability" onPress={() => handleCreateReport("lots")} size="large" variant="secondary" />
          <Button label="Handling Report" onPress={() => handleCreateReport("handling")} size="large" variant="secondary" />
          <Button label="Storage Report" onPress={() => handleCreateReport("storage")} size="large" variant="secondary" />
          <Button label="Sales Report" onPress={() => handleCreateReport("sales")} size="large" variant="secondary" />
          <Button label="Mass Balance" onPress={() => handleCreateReport("massBalance")} size="large" variant="secondary" />
        </View>
        {report ? <Text style={styles.report}>{report}</Text> : null}
      </Card>
    </Screen>
  );
}

function LotForm({
  createdFromHarvestRecordId,
  cropId,
  cropOptions,
  harvestDate,
  lotCode,
  lotNotes,
  organicStatus,
  placeId,
  placeOptions,
  quantityHarvested,
  saveLabel,
  unit,
  onCancel,
  onCreatedFromHarvestRecordIdChange,
  onCropIdChange,
  onHarvestDateChange,
  onLotCodeChange,
  onLotNotesChange,
  onOrganicStatusChange,
  onPlaceIdChange,
  onQuantityHarvestedChange,
  onSave,
  onUnitChange,
}: {
  createdFromHarvestRecordId: string;
  cropId: string;
  cropOptions: Array<{ label: string; value: string }>;
  harvestDate: string;
  lotCode: string;
  lotNotes: string;
  organicStatus: OrganicLotStatus;
  placeId: string;
  placeOptions: Array<{ label: string; value: string }>;
  quantityHarvested: string;
  saveLabel: string;
  unit: string;
  onCancel?: () => void;
  onCreatedFromHarvestRecordIdChange: (value: string) => void;
  onCropIdChange: (value: string) => void;
  onHarvestDateChange: (value: string) => void;
  onLotCodeChange: (value: string) => void;
  onLotNotesChange: (value: string) => void;
  onOrganicStatusChange: (value: string) => void;
  onPlaceIdChange: (value: string) => void;
  onQuantityHarvestedChange: (value: string) => void;
  onSave: () => void;
  onUnitChange: (value: string) => void;
}) {
  return (
    <View style={styles.inlineEdit}>
      <FormField label="Lot code" onChangeText={onLotCodeChange} placeholder="KALE-2026-001" value={lotCode} />
      <SelectField label="Crop" onChange={onCropIdChange} options={cropOptions} value={cropId} />
      <SelectField label="Harvest place" onChange={onPlaceIdChange} options={placeOptions} value={placeId} />
      <DateField label="Harvest date" onChangeText={onHarvestDateChange} placeholder="YYYY-MM-DD" value={harvestDate} />
      <SelectField label="Organic status" onChange={onOrganicStatusChange} options={ORGANIC_LOT_STATUSES.map((status) => ({ label: ORGANIC_LOT_STATUS_LABELS[status], value: status }))} value={organicStatus} />
      <FormField label="Quantity harvested" keyboardType="decimal-pad" onChangeText={onQuantityHarvestedChange} placeholder="25" value={quantityHarvested} />
      <SelectField label="Unit" onChange={onUnitChange} options={PILOT_UNITS.map((pilotUnit) => ({ label: pilotUnit, value: pilotUnit }))} value={unit} />
      <FormField label="Source harvest record ID" onChangeText={onCreatedFromHarvestRecordIdChange} placeholder="Optional existing harvest record ID" value={createdFromHarvestRecordId} />
      <FormField label="Notes" multiline onChangeText={onLotNotesChange} placeholder="Optional" value={lotNotes} />
      <Button label={saveLabel} onPress={onSave} size="large" />
      {onCancel ? <Button label="Cancel edit" onPress={onCancel} size="large" variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: theme.spacing.sm },
  error: { color: theme.colors.error, fontSize: theme.typography.small, lineHeight: 20 },
  inlineEdit: { gap: theme.spacing.sm },
  lotDetail: { color: theme.colors.textSecondary, fontSize: theme.typography.body, lineHeight: 22 },
  lotRow: { borderColor: theme.colors.border, borderRadius: theme.radius.sm, borderWidth: 1, gap: theme.spacing.sm, padding: theme.spacing.sm },
  lotText: { gap: 2 },
  lotTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.body, fontWeight: "700" },
  report: { color: theme.colors.textPrimary, fontSize: theme.typography.small, lineHeight: 20 },
});
