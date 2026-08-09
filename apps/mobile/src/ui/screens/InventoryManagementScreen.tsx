import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { PlanningTask } from "../../domain/planning/Planning";
import type { InventoryCatalog } from "../../application/use-cases/manage-inventory/ManageInventory";
import type {
  InventoryAcquisitionSource,
  InventoryItemKind,
  OrganicInventoryApprovalStatus,
  OrganicInventoryRelevance,
} from "../../domain/inventory/Inventory";
import {
  categoryLabelFor,
  commonOptionLabelFor,
  equipmentCatalogCategories,
  materialCatalogCategories,
  OTHER_INVENTORY_OPTION_VALUE,
  type InventoryCatalogCategory,
} from "../../domain/inventory/InventoryCatalogOptions";
import {
  listInventoryCatalog,
  saveInventoryEquipment,
  saveInventoryMaterial,
} from "../../application/use-cases/manage-inventory/ManageInventory";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { InventoryRepository } from "../../application/ports/InventoryRepository";
import type { LocalRecordRepository } from "../../application/ports/LocalRecordRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import { PILOT_UNITS, type PilotUnit } from "../../domain/quantities/PilotUnit";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FormField } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SectionHeading } from "../components/SectionHeading";
import { SelectField, type SelectOption } from "../components/SelectField";
import { buildFarmPlaceOptions } from "../farmPlaceDisplay";
import { theme } from "../theme/theme";
import { RecordFarmEventForm } from "./RecordFarmEventScreen";
import { mapZodIssues } from "./screenValidation";

type AddMode = "material" | "equipment" | undefined;

export function InventoryManagementScreen({
  farm,
  farmEventRepository,
  farmReferenceRepository,
  inventoryRepository,
  localRecordRepository,
  organicCertificationRepository,
  planningRepository,
}: {
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  farmReferenceRepository: FarmReferenceRepository;
  inventoryRepository: InventoryRepository;
  localRecordRepository: LocalRecordRepository;
  organicCertificationRepository: OrganicCertificationRepository;
  planningRepository: PlanningRepository;
}) {
  const [catalog, setCatalog] = useState<InventoryCatalog>({ items: [], materialUsage: [] });
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [planningTasks, setPlanningTasks] = useState<PlanningTask[]>([]);
  const [addMode, setAddMode] = useState<AddMode>();

  const loadInventory = useCallback(async () => {
    const [nextCatalog, nextLocations, nextPlanningTasks] = await Promise.all([
      listInventoryCatalog({ farmId: farm.id }, { farmReferenceRepository, inventoryRepository, localRecordRepository }),
      farmReferenceRepository.listLocations(farm.id),
      planningRepository.listTasks(farm.id),
    ]);
    setCatalog(nextCatalog);
    setLocations(nextLocations);
    setPlanningTasks(nextPlanningTasks);
  }, [farm.id, farmReferenceRepository, inventoryRepository, localRecordRepository, planningRepository]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  return (
    <Screen>
      <PageHeader
        eyebrow="Inventory management"
        supportingText="Track farm inputs, supplies, equipment, and organic evidence in one local place."
        title="Inventory management"
      />
      <Card rootLevelHeader>
        <SectionHeading
          detail="Use this catalog for farm inputs, materials, supplies, and equipment. Material-use reports come from confirmed material-use records."
          title="Inventory catalog"
        />
        <View style={styles.actionRow}>
          <Button label="Add farm input" onPress={() => setAddMode("material")} size="large" />
          <Button label="Add equipment" onPress={() => setAddMode("equipment")} size="large" variant="secondary" />
        </View>
        {addMode === "material" ? (
          <MaterialForm
            farmId={farm.id}
            locations={locations}
            onCancel={() => setAddMode(undefined)}
            onSaved={async () => {
              setAddMode(undefined);
              await loadInventory();
            }}
            repository={farmReferenceRepository}
            inventoryRepository={inventoryRepository}
            farm={farm}
            farmEventRepository={farmEventRepository}
            organicCertificationRepository={organicCertificationRepository}
            planningRepository={planningRepository}
            planningTasks={planningTasks}
          />
        ) : null}
        {addMode === "equipment" ? (
          <EquipmentForm
            farmId={farm.id}
            locations={locations}
            onCancel={() => setAddMode(undefined)}
            onSaved={async () => {
              setAddMode(undefined);
              await loadInventory();
            }}
            inventoryRepository={inventoryRepository}
            farm={farm}
            farmEventRepository={farmEventRepository}
            farmReferenceRepository={farmReferenceRepository}
            organicCertificationRepository={organicCertificationRepository}
            planningRepository={planningRepository}
            planningTasks={planningTasks}
          />
        ) : null}
        <InventoryCatalogList catalog={catalog} locations={locations} />
      </Card>
      <Card rootLevelHeader>
        <SectionHeading
          detail="These totals group material-use records by material and unit. The app does not convert units or claim authoritative stock totals."
          title="Material usage report"
        />
        {catalog.materialUsage.length === 0 ? (
          <EmptyState text="No material use has been recorded yet." />
        ) : (
          <View style={styles.list}>
            {catalog.materialUsage.map((summary) => (
              <View key={`${summary.materialId}:${summary.unit}`} style={styles.reportRow}>
                <Text style={styles.itemTitle}>{summary.materialName}</Text>
                <Text style={styles.itemDetail}>
                  {summary.totalUsed} {summary.unit} used across {summary.useCount} record
                  {summary.useCount === 1 ? "" : "s"}
                </Text>
                {summary.lastUsedAt ? <Text style={styles.itemDetail}>Last used {formatDate(summary.lastUsedAt)}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

function InventoryCatalogList({ catalog, locations }: { catalog: InventoryCatalog; locations: FarmLocation[] }) {
  if (catalog.items.length === 0) {
    return <EmptyState text="No inventory items yet. Add a farm input or equipment item to start." />;
  }

  return (
    <View style={styles.list}>
      {catalog.items.map((item) => (
        <View key={`${item.kind}:${item.id}`} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.kindBadge}>{item.kind === "material" ? "Farm input" : "Equipment"}</Text>
          </View>
          <Text style={styles.itemDetail}>
            {storageLabel(item.storageLocationId, locations)}
            {item.defaultUnit ? ` - Default unit: ${item.defaultUnit}` : ""}
          </Text>
          <Text style={styles.itemDetail}>
            {sourceLabels[item.acquisitionSource]}
            {formatCurrentQuantity(item.currentAmount, item.currentUnit) ? ` - ${formatCurrentQuantity(item.currentAmount, item.currentUnit)}` : ""}
          </Text>
          {item.category ? <Text style={styles.itemDetail}>Category: {catalogCategoryLabel(item.kind, item.category)}</Text> : null}
          {item.supplier ? <Text style={styles.itemDetail}>Supplier: {item.supplier}</Text> : null}
          {item.reorderPoint ? <Text style={styles.itemDetail}>Reorder point: {item.reorderPoint}</Text> : null}
          {item.organicRelevance !== "none" ? (
            <Text style={styles.organicDetail}>
              Organic: {organicRelevanceLabels[item.organicRelevance]} - {organicApprovalStatusLabels[item.organicApprovalStatus]}
            </Text>
          ) : null}
          {item.cleaningRequired ? <Text style={styles.itemDetail}>Cleaning record needed before organic-contact use.</Text> : null}
        </View>
      ))}
    </View>
  );
}

function MaterialForm({
  farm,
  farmEventRepository,
  farmId,
  inventoryRepository,
  locations,
  onCancel,
  onSaved,
  organicCertificationRepository,
  planningRepository,
  planningTasks,
  repository,
}: {
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  farmId: string;
  inventoryRepository: InventoryRepository;
  locations: FarmLocation[];
  onCancel: () => void;
  onSaved: () => Promise<void>;
  organicCertificationRepository: OrganicCertificationRepository;
  planningRepository: PlanningRepository;
  planningTasks: PlanningTask[];
  repository: FarmReferenceRepository;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [commonItemKey, setCommonItemKey] = useState("");
  const [acquisitionSource, setAcquisitionSource] = useState<InventoryAcquisitionSource>("purchase");
  const [currentAmount, setCurrentAmount] = useState("");
  const [defaultUnit, setDefaultUnit] = useState<PilotUnit | "">("");
  const [storageLocationId, setStorageLocationId] = useState("");
  const [supplier, setSupplier] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [notes, setNotes] = useState("");
  const [organicRelevance, setOrganicRelevance] = useState<OrganicInventoryRelevance>("none");
  const [organicApprovalStatus, setOrganicApprovalStatus] = useState<OrganicInventoryApprovalStatus>("notNeeded");
  const [organicRegulationNotes, setOrganicRegulationNotes] = useState("");
  const [organicEvidenceNotes, setOrganicEvidenceNotes] = useState("");
  const [purchaseNoteFarmEventId, setPurchaseNoteFarmEventId] = useState<string | undefined>();
  const [showPurchaseNoteForm, setShowPurchaseNoteForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setErrors({});

    try {
      await saveInventoryMaterial(
        {
          farmId,
          name,
          category,
          commonItemKey,
          acquisitionSource,
          currentAmount,
          defaultUnit: defaultUnit || undefined,
          currentUnit: defaultUnit || undefined,
          storageLocationId,
          supplier,
          reorderPoint,
          notes,
          organicRelevance,
          organicApprovalStatus,
          organicRegulationNotes,
          organicEvidenceNotes,
          purchaseNoteFarmEventId,
        },
        { clock: systemClock, farmReferenceRepository: repository, idGenerator: localIdGenerator, inventoryRepository },
      );
      await onSaved();
    } catch (caughtError) {
      setErrors(caughtError instanceof z.ZodError ? mapZodIssues(caughtError) : { form: "This input could not be saved." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.formBox}>
      <Text style={styles.formTitle}>Add farm input</Text>
      <CatalogChoiceFields
        categories={materialCatalogCategories}
        category={category}
        categoryLabel="Input category"
        commonItemKey={commonItemKey}
        commonItemLabel="Common input"
        customName={name}
        customNameLabel="Custom input name"
        customNamePlaceholder="Optional unless Other is selected"
        error={errors.name}
        onCategoryChange={(value) => {
          setCategory(value);
          setCommonItemKey("");
        }}
        onCommonItemChange={setCommonItemKey}
        onCustomNameChange={setName}
      />
      <SelectField
        label="How added to inventory"
        onChange={(value) => setAcquisitionSource(value as InventoryAcquisitionSource)}
        options={sourceOptions}
        value={acquisitionSource}
      />
      <FormField error={errors.currentAmount} label="Amount received" onChangeText={setCurrentAmount} placeholder="Example: 4" value={currentAmount} />
      <SelectField
        error={errors.currentUnit}
        label="Unit"
        onChange={(value) => setDefaultUnit(value as PilotUnit | "")}
        options={[{ label: "No default", value: "" }, ...PILOT_UNITS.map((unit) => ({ label: unit, value: unit }))]}
        value={defaultUnit}
      />
      <SelectField
        label="Storage place"
        onChange={setStorageLocationId}
        options={[{ label: "No storage place", value: "" }, ...buildFarmPlaceOptions(locations)]}
        value={storageLocationId}
      />
      <FormField label="Supplier" onChangeText={setSupplier} placeholder="Optional" value={supplier} />
      <FormField label="Reorder point" onChangeText={setReorderPoint} placeholder="Example: order when under 2 bags" value={reorderPoint} />
      <OrganicInventoryFields
        approvalStatus={organicApprovalStatus}
        evidenceNotes={organicEvidenceNotes}
        onApprovalStatusChange={(value) => setOrganicApprovalStatus(value as OrganicInventoryApprovalStatus)}
        onEvidenceNotesChange={setOrganicEvidenceNotes}
        onRegulationNotesChange={setOrganicRegulationNotes}
        onRelevanceChange={(value) => setOrganicRelevance(value as OrganicInventoryRelevance)}
        regulationNotes={organicRegulationNotes}
        relevance={organicRelevance}
      />
      <FormField label="Notes" multiline onChangeText={setNotes} placeholder="Optional" value={notes} />
      <PurchaseNoteSection
        farm={farm}
        eventType="materialPurchase"
        farmEventRepository={farmEventRepository}
        farmReferenceRepository={repository}
        locations={locations}
        noteSavedMessage="Material purchase note saved. Save the farm input to link it to this catalog item."
        onSaved={setPurchaseNoteFarmEventId}
        organicCertificationRepository={organicCertificationRepository}
        planningRepository={planningRepository}
        planningTasks={planningTasks}
        savedEventId={purchaseNoteFarmEventId}
        showForm={showPurchaseNoteForm}
        toggleLabel="Record material purchase"
        onToggle={() => setShowPurchaseNoteForm((current) => !current)}
      />
      {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
      <Button disabled={isSaving} label={isSaving ? "Saving..." : "Save farm input"} onPress={handleSave} />
      <Button label="Cancel" onPress={onCancel} variant="secondary" />
    </View>
  );
}

function EquipmentForm({
  farm,
  farmEventRepository,
  farmReferenceRepository,
  farmId,
  inventoryRepository,
  locations,
  onCancel,
  onSaved,
  organicCertificationRepository,
  planningRepository,
  planningTasks,
}: {
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  farmReferenceRepository: FarmReferenceRepository;
  farmId: string;
  inventoryRepository: InventoryRepository;
  locations: FarmLocation[];
  onCancel: () => void;
  onSaved: () => Promise<void>;
  organicCertificationRepository: OrganicCertificationRepository;
  planningRepository: PlanningRepository;
  planningTasks: PlanningTask[];
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [commonItemKey, setCommonItemKey] = useState("");
  const [acquisitionSource, setAcquisitionSource] = useState<InventoryAcquisitionSource>("purchase");
  const [currentAmount, setCurrentAmount] = useState("1");
  const [currentUnit, setCurrentUnit] = useState<PilotUnit | "">("each");
  const [storageLocationId, setStorageLocationId] = useState("");
  const [supplier, setSupplier] = useState("");
  const [equipmentContactRisk, setEquipmentContactRisk] = useState("");
  const [cleaningRequired, setCleaningRequired] = useState("false");
  const [notes, setNotes] = useState("");
  const [organicRelevance, setOrganicRelevance] = useState<OrganicInventoryRelevance>("none");
  const [organicApprovalStatus, setOrganicApprovalStatus] = useState<OrganicInventoryApprovalStatus>("notNeeded");
  const [organicRegulationNotes, setOrganicRegulationNotes] = useState("");
  const [organicEvidenceNotes, setOrganicEvidenceNotes] = useState("");
  const [purchaseNoteFarmEventId, setPurchaseNoteFarmEventId] = useState<string | undefined>();
  const [showPurchaseNoteForm, setShowPurchaseNoteForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setErrors({});

    try {
      await saveInventoryEquipment(
        {
          farmId,
          name,
          category,
          commonItemKey,
          acquisitionSource,
          currentAmount,
          currentUnit: currentUnit || undefined,
          storageLocationId,
          supplier,
          equipmentContactRisk,
          cleaningRequired: cleaningRequired === "true",
          notes,
          organicRelevance,
          organicApprovalStatus,
          organicRegulationNotes,
          organicEvidenceNotes,
          purchaseNoteFarmEventId,
        },
        { clock: systemClock, idGenerator: localIdGenerator, inventoryRepository },
      );
      await onSaved();
    } catch (caughtError) {
      setErrors(caughtError instanceof z.ZodError ? mapZodIssues(caughtError) : { form: "This equipment could not be saved." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.formBox}>
      <Text style={styles.formTitle}>Add equipment</Text>
      <CatalogChoiceFields
        categories={equipmentCatalogCategories}
        category={category}
        categoryLabel="Equipment category"
        commonItemKey={commonItemKey}
        commonItemLabel="Common equipment"
        customName={name}
        customNameLabel="Custom equipment name"
        customNamePlaceholder="Optional unless Other is selected"
        error={errors.name}
        onCategoryChange={(value) => {
          setCategory(value);
          setCommonItemKey("");
        }}
        onCommonItemChange={setCommonItemKey}
        onCustomNameChange={setName}
      />
      <SelectField
        label="How added to inventory"
        onChange={(value) => setAcquisitionSource(value as InventoryAcquisitionSource)}
        options={sourceOptions}
        value={acquisitionSource}
      />
      <FormField error={errors.currentAmount} label="Amount received" onChangeText={setCurrentAmount} placeholder="Example: 1" value={currentAmount} />
      <SelectField
        error={errors.currentUnit}
        label="Unit"
        onChange={(value) => setCurrentUnit(value as PilotUnit | "")}
        options={PILOT_UNITS.map((unit) => ({ label: unit, value: unit }))}
        value={currentUnit}
      />
      <SelectField
        label="Storage place"
        onChange={setStorageLocationId}
        options={[{ label: "No storage place", value: "" }, ...buildFarmPlaceOptions(locations)]}
        value={storageLocationId}
      />
      <FormField label="Supplier or source" onChangeText={setSupplier} placeholder="Optional" value={supplier} />
      <SelectField
        label="Needs cleaning before organic-contact use?"
        onChange={setCleaningRequired}
        options={[
          { label: "No", value: "false" },
          { label: "Yes", value: "true" },
        ]}
        value={cleaningRequired}
      />
      <FormField
        label="Organic contact risk"
        multiline
        onChangeText={setEquipmentContactRisk}
        placeholder="Example: shared with nonorganic harvest bins"
        value={equipmentContactRisk}
      />
      <OrganicInventoryFields
        approvalStatus={organicApprovalStatus}
        evidenceNotes={organicEvidenceNotes}
        onApprovalStatusChange={(value) => setOrganicApprovalStatus(value as OrganicInventoryApprovalStatus)}
        onEvidenceNotesChange={setOrganicEvidenceNotes}
        onRegulationNotesChange={setOrganicRegulationNotes}
        onRelevanceChange={(value) => setOrganicRelevance(value as OrganicInventoryRelevance)}
        regulationNotes={organicRegulationNotes}
        relevance={organicRelevance}
      />
      <FormField label="Notes" multiline onChangeText={setNotes} placeholder="Optional" value={notes} />
      <PurchaseNoteSection
        farm={farm}
        eventType="equipmentPurchase"
        farmEventRepository={farmEventRepository}
        farmReferenceRepository={farmReferenceRepository}
        locations={locations}
        noteSavedMessage="Equipment purchase note saved. Save the equipment to link it to this catalog item."
        onSaved={setPurchaseNoteFarmEventId}
        organicCertificationRepository={organicCertificationRepository}
        planningRepository={planningRepository}
        planningTasks={planningTasks}
        savedEventId={purchaseNoteFarmEventId}
        showForm={showPurchaseNoteForm}
        toggleLabel="Record equipment purchase"
        onToggle={() => setShowPurchaseNoteForm((current) => !current)}
      />
      {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
      <Button disabled={isSaving} label={isSaving ? "Saving..." : "Save equipment"} onPress={handleSave} />
      <Button label="Cancel" onPress={onCancel} variant="secondary" />
    </View>
  );
}

function CatalogChoiceFields({
  categories,
  category,
  categoryLabel,
  commonItemKey,
  commonItemLabel,
  customName,
  customNameLabel,
  customNamePlaceholder,
  error,
  onCategoryChange,
  onCommonItemChange,
  onCustomNameChange,
}: {
  categories: InventoryCatalogCategory[];
  category: string;
  categoryLabel: string;
  commonItemKey: string;
  commonItemLabel: string;
  customName: string;
  customNameLabel: string;
  customNamePlaceholder: string;
  error?: string;
  onCategoryChange: (value: string) => void;
  onCommonItemChange: (value: string) => void;
  onCustomNameChange: (value: string) => void;
}) {
  const selectedCategory = categories.find((candidate) => candidate.value === category);

  return (
    <>
      <SelectField
        label={categoryLabel}
        onChange={onCategoryChange}
        options={categories.map((candidate) => ({
          label: candidate.label,
          value: candidate.value,
        }))}
        value={category}
      />
      {selectedCategory ? (
        <SelectField
          label={commonItemLabel}
          onChange={onCommonItemChange}
          options={commonItemOptions(selectedCategory)}
          value={commonItemKey}
        />
      ) : null}
      {selectedCategory && commonItemKey ? (
        <FormField
          error={error}
          label={customNameLabel}
          onChangeText={onCustomNameChange}
          placeholder={customNamePlaceholder}
          value={customName}
        />
      ) : null}
    </>
  );
}

function OrganicInventoryFields({
  approvalStatus,
  evidenceNotes,
  onApprovalStatusChange,
  onEvidenceNotesChange,
  onRegulationNotesChange,
  onRelevanceChange,
  regulationNotes,
  relevance,
}: {
  approvalStatus: string;
  evidenceNotes: string;
  onApprovalStatusChange: (value: string) => void;
  onEvidenceNotesChange: (value: string) => void;
  onRegulationNotesChange: (value: string) => void;
  onRelevanceChange: (value: string) => void;
  regulationNotes: string;
  relevance: string;
}) {
  return (
    <View style={styles.organicBox}>
      <Text style={styles.formTitle}>Organic details</Text>
      <SelectField
        label="Organic relevance"
        onChange={(value) => {
          onRelevanceChange(value);
          if (value === "none") {
            onApprovalStatusChange("notNeeded");
          }
        }}
        options={organicRelevanceOptions}
        value={relevance}
      />
      {relevance !== "none" ? (
        <>
          <SelectField
            label="Approval or review status"
            onChange={onApprovalStatusChange}
            options={organicApprovalStatusOptions}
            value={approvalStatus}
          />
          <FormField
            label="USDA/certifier notes"
            multiline
            onChangeText={onRegulationNotesChange}
            placeholder="Example: 7 CFR 205.201 input list; certifier approval needed"
            value={regulationNotes}
          />
          <FormField
            label="Evidence notes"
            multiline
            onChangeText={onEvidenceNotesChange}
            placeholder="Example: label photo saved in farm notes; OMRI listing checked"
            value={evidenceNotes}
          />
        </>
      ) : null}
    </View>
  );
}

function PurchaseNoteSection({
  eventType,
  farm,
  farmEventRepository,
  farmReferenceRepository,
  locations,
  noteSavedMessage,
  onSaved,
  onToggle,
  organicCertificationRepository,
  planningRepository,
  planningTasks,
  savedEventId,
  showForm,
  toggleLabel,
}: {
  eventType: "materialPurchase" | "equipmentPurchase";
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  farmReferenceRepository: FarmReferenceRepository;
  locations: FarmLocation[];
  noteSavedMessage: string;
  onSaved: (eventId: string) => void;
  onToggle: () => void;
  organicCertificationRepository: OrganicCertificationRepository;
  planningRepository: PlanningRepository;
  planningTasks: PlanningTask[];
  savedEventId?: string;
  showForm: boolean;
  toggleLabel: string;
}) {
  return (
    <View style={styles.purchaseNoteBox}>
      <Text style={styles.formTitle}>Purchase note</Text>
      <Text style={styles.itemDetail}>
        Save a private voice/photo farm note for the item, receipt, label, or storage place. It will link to this catalog item when you save the form.
      </Text>
      {savedEventId ? <Text style={styles.success}>{noteSavedMessage}</Text> : null}
      <Button label={showForm ? "Hide purchase note recorder" : toggleLabel} onPress={onToggle} variant="secondary" />
      {showForm ? (
        <View style={styles.embeddedRecorder}>
          <RecordFarmEventForm
            farm={farm}
            farmEventRepository={farmEventRepository}
            farmReferenceRepository={farmReferenceRepository}
            initialEventType={eventType}
            locations={locations}
            onSaved={(eventId) => {
              onSaved(eventId);
            }}
            organicCertificationRepository={organicCertificationRepository}
            planningRepository={planningRepository}
            planningTasks={planningTasks}
            saveButtonLabel="Save purchase note"
            savedMessageText="Purchase note saved on this device."
            showCertificationRequirementField={false}
            showTaskField={false}
          />
        </View>
      ) : null}
    </View>
  );
}

const organicRelevanceLabels = {
  none: "Not organic-related",
  cropProductionInput: "Crop production input",
  soilAmendment: "Soil amendment or compost",
  pestControlInput: "Pest, weed, or disease input",
  seedOrPlantingStock: "Seed or planting stock",
  cleaningOrSanitation: "Cleaning or sanitation",
  packagingOrHandling: "Packaging or handling",
  sharedEquipment: "Shared equipment",
} as const;

const organicApprovalStatusLabels = {
  notNeeded: "Not needed",
  unknown: "Unknown",
  needsReview: "Needs review",
  approvedByCertifier: "Approved by certifier",
  omriListed: "OMRI listed",
  wsdaListed: "WSDA listed",
  allowedByNationalList: "Allowed by National List",
  restricted: "Restricted",
  prohibited: "Prohibited",
} as const;

const sourceLabels: Record<InventoryAcquisitionSource, string> = {
  purchase: "Purchased",
  donation: "Donated",
  selfProduced: "Self-produced",
  alreadyOwned: "Already owned",
};

const sourceOptions: SelectOption[] = [
  { label: "Purchased", value: "purchase" },
  { label: "Donated", value: "donation" },
  { label: "Self-produced", value: "selfProduced" },
  { label: "Already owned", value: "alreadyOwned" },
];

const organicRelevanceOptions = Object.entries(organicRelevanceLabels).map(([value, label]) => ({ label, value }));
const organicApprovalStatusOptions = Object.entries(organicApprovalStatusLabels)
  .filter(([value]) => value !== "notNeeded")
  .map(([value, label]) => ({ label, value }));

function commonItemOptions(category: InventoryCatalogCategory): SelectOption[] {
  return [
    ...category.options.map((option) => ({
      label: option.label,
      value: option.value,
    })),
    { label: "Other...", value: OTHER_INVENTORY_OPTION_VALUE },
  ];
}

function catalogCategoryLabel(kind: InventoryItemKind, category: string): string {
  const categories = kind === "material" ? materialCatalogCategories : equipmentCatalogCategories;

  return categoryLabelFor(categories, category) ?? category;
}

function formatCurrentQuantity(amount: number | undefined, unit: string | undefined): string | undefined {
  if (amount === undefined || !unit) {
    return undefined;
  }

  return `${amount} ${unit} on hand`;
}

function storageLabel(storageLocationId: string | undefined, locations: FarmLocation[]): string {
  if (!storageLocationId) {
    return "No storage place saved";
  }

  return locations.find((location) => location.id === storageLocationId)?.name ?? "Saved storage place";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

const styles = StyleSheet.create({
  actionRow: {
    gap: theme.spacing.sm,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  embeddedRecorder: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  formBox: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  formTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  itemCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  itemDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  itemHeader: {
    alignItems: "flex-start",
    gap: theme.spacing.xs,
  },
  itemTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  kindBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primarySubtle,
    borderRadius: theme.radius.sm,
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "700",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  list: {
    gap: theme.spacing.sm,
  },
  organicBox: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  organicDetail: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "700",
    lineHeight: 20,
  },
  purchaseNoteBox: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  reportRow: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  success: {
    color: theme.colors.success,
    fontSize: theme.typography.small,
    fontWeight: "700",
    lineHeight: 20,
  },
});
