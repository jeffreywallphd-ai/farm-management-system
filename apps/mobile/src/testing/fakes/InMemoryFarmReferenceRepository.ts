import type { Farm, FarmId } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem, TrackedItemKind } from "../../domain/farm/TrackedItem";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";

export class InMemoryFarmReferenceRepository implements FarmReferenceRepository {
  private farm: Farm | null = null;
  private locations: FarmLocation[] = [];
  private trackedItems: TrackedItem[] = [];

  async createFarm(farm: Farm): Promise<void> {
    this.farm = farm;
  }

  async getFarm(): Promise<Farm | null> {
    return this.farm;
  }

  async addLocation(location: FarmLocation): Promise<void> {
    if (location.parentId) {
      const parent = this.locations.find(
        (candidate) => candidate.id === location.parentId && candidate.farmId === location.farmId,
      );

      if (!parent) {
        throw new Error("Choose a saved parent place or leave it as a top-level place.");
      }
    }

    this.locations.push(location);
  }

  async listLocations(farmId: FarmId): Promise<FarmLocation[]> {
    return this.locations.filter((location) => location.farmId === farmId);
  }

  async addTrackedItem(item: TrackedItem): Promise<void> {
    this.trackedItems.push(item);
  }

  async listTrackedItems(farmId: FarmId, kind?: TrackedItemKind): Promise<TrackedItem[]> {
    return this.trackedItems.filter(
      (item) => item.farmId === farmId && (!kind || item.kind === kind),
    );
  }
}
