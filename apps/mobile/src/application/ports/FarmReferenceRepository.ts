import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";

export interface FarmReferenceRepository {
  getFarm(): Promise<Farm | null>;
  listLocations(): Promise<FarmLocation[]>;
  listTrackedItems(): Promise<TrackedItem[]>;
}
