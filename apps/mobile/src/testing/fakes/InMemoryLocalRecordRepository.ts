import type { FarmId } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import type { HarvestRecorded } from "../../domain/records/HarvestRecorded";
import type { OperationalRecordId } from "../../domain/records/OperationalRecord";
import type { HarvestRecordView, LocalRecordRepository } from "../../application/ports/LocalRecordRepository";

export class InMemoryLocalRecordRepository implements LocalRecordRepository {
  private harvestRecords: HarvestRecorded[] = [];

  constructor(
    private readonly references: {
      locations: FarmLocation[];
      trackedItems: TrackedItem[];
    },
  ) {}

  async saveHarvest(record: HarvestRecorded): Promise<void> {
    this.harvestRecords.push(record);
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

  private toView(record: HarvestRecorded): HarvestRecordView | null {
    const crop = this.references.trackedItems.find((item) => item.id === record.cropId);
    const sourceLocation = this.references.locations.find((location) => location.id === record.sourceLocationId);

    if (!crop || !sourceLocation) {
      return null;
    }

    return { record, crop, sourceLocation };
  }
}
