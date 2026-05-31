import type { Farm, FarmId } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem, TrackedItemKind } from "../../domain/farm/TrackedItem";

export interface FarmReferenceRepository {
  createFarm(farm: Farm): Promise<void>;
  getFarm(): Promise<Farm | null>;
  markCorePlacesSetupComplete(farmId: FarmId, completedAt: string): Promise<void>;
  addLocation(location: FarmLocation): Promise<void>;
  updateLocation(location: FarmLocation): Promise<void>;
  listLocations(farmId: FarmId): Promise<FarmLocation[]>;
  addTrackedItem(item: TrackedItem): Promise<void>;
  updateTrackedItem(item: TrackedItem): Promise<void>;
  listTrackedItems(farmId: FarmId, kind?: TrackedItemKind): Promise<TrackedItem[]>;
}
