import type { FarmId } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import type { HarvestRecorded } from "../../domain/records/HarvestRecorded";
import type { InventoryCountRecorded } from "../../domain/records/InventoryCountRecorded";
import type { MaterialUseRecorded } from "../../domain/records/MaterialUseRecorded";
import type { OperationalRecordId, OperationalRecordKind } from "../../domain/records/OperationalRecord";
import type {
  HarvestRecordView,
  InventoryCountRecordView,
  LocalActivityRecordView,
  LocalRecordRepository,
  MaterialUseRecordView,
} from "../../application/ports/LocalRecordRepository";

export class InMemoryLocalRecordRepository implements LocalRecordRepository {
  private harvestRecords: HarvestRecorded[] = [];
  private materialUseRecords: MaterialUseRecorded[] = [];
  private inventoryCountRecords: InventoryCountRecorded[] = [];

  constructor(
    private readonly references: {
      locations: FarmLocation[];
      trackedItems: TrackedItem[];
    },
  ) {}

  async saveHarvest(record: HarvestRecorded): Promise<void> {
    this.harvestRecords.push(record);
  }

  async saveMaterialUse(record: MaterialUseRecorded): Promise<void> {
    this.materialUseRecords.push(record);
  }

  async saveInventoryCount(record: InventoryCountRecorded): Promise<void> {
    this.inventoryCountRecords.push(record);
  }

  async listLocalActivityHistory(farmId: FarmId): Promise<LocalActivityRecordView[]> {
    const harvests = await this.listHarvestHistory(farmId);
    const materialUses = this.materialUseRecords
      .filter((record) => record.farmId === farmId)
      .map((record) => this.toMaterialUseView(record))
      .filter((view): view is MaterialUseRecordView => view !== null);
    const inventoryCounts = this.inventoryCountRecords
      .filter((record) => record.farmId === farmId)
      .map((record) => this.toInventoryCountView(record))
      .filter((view): view is InventoryCountRecordView => view !== null);

    return [...harvests, ...materialUses, ...inventoryCounts].sort(
      (left, right) =>
        right.record.effectiveAt.localeCompare(left.record.effectiveAt) ||
        right.record.createdAt.localeCompare(left.record.createdAt),
    );
  }

  async getLocalActivityDetail(
    farmId: FarmId,
    kind: OperationalRecordKind,
    id: OperationalRecordId,
  ): Promise<LocalActivityRecordView | null> {
    if (kind === "HarvestRecorded") {
      return this.getHarvestDetail(farmId, id);
    }

    if (kind === "MaterialUseRecorded") {
      const record = this.materialUseRecords.find((candidate) => candidate.farmId === farmId && candidate.id === id);
      return record ? this.toMaterialUseView(record) : null;
    }

    const record = this.inventoryCountRecords.find((candidate) => candidate.farmId === farmId && candidate.id === id);
    return record ? this.toInventoryCountView(record) : null;
  }

  async listHarvestHistory(farmId: FarmId): Promise<HarvestRecordView[]> {
    return this.harvestRecords
      .filter((record) => record.farmId === farmId)
      .sort((left, right) => right.effectiveAt.localeCompare(left.effectiveAt))
      .map((record) => this.toView(record))
      .filter((view): view is HarvestRecordView => view !== null);
  }

  async getHarvestDetail(farmId: FarmId, id: OperationalRecordId): Promise<HarvestRecordView | null> {
    const record = this.harvestRecords.find((candidate) => candidate.farmId === farmId && candidate.id === id);
    return record ? this.toView(record) : null;
  }

  async listHarvestRecordsForExport(farmId: FarmId): Promise<HarvestRecorded[]> {
    return this.harvestRecords.filter((record) => record.farmId === farmId);
  }

  async listMaterialUseRecordsForExport(farmId: FarmId): Promise<MaterialUseRecorded[]> {
    return this.materialUseRecords.filter((record) => record.farmId === farmId);
  }

  async listInventoryCountRecordsForExport(farmId: FarmId): Promise<InventoryCountRecorded[]> {
    return this.inventoryCountRecords.filter((record) => record.farmId === farmId);
  }

  private toView(record: HarvestRecorded): HarvestRecordView | null {
    const crop = this.references.trackedItems.find((item) => item.id === record.cropId);
    const sourceLocation = this.references.locations.find((location) => location.id === record.sourceLocationId);

    if (!crop || !sourceLocation) {
      return null;
    }

    return { record, crop, sourceLocation };
  }

  private toMaterialUseView(record: MaterialUseRecorded): MaterialUseRecordView | null {
    const material = this.references.trackedItems.find((item) => item.id === record.materialId);
    const useLocation = record.useLocationId
      ? this.references.locations.find((location) => location.id === record.useLocationId)
      : undefined;

    if (!material || (record.useLocationId && !useLocation)) {
      return null;
    }

    return { record, material, useLocation };
  }

  private toInventoryCountView(record: InventoryCountRecorded): InventoryCountRecordView | null {
    const trackedItem = this.references.trackedItems.find((item) => item.id === record.trackedItemId);
    const location = record.locationId
      ? this.references.locations.find((candidate) => candidate.id === record.locationId)
      : undefined;

    if (!trackedItem || (record.locationId && !location)) {
      return null;
    }

    return { record, trackedItem, location };
  }
}
