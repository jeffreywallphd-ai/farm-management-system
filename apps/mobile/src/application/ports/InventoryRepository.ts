import type { FarmId } from "../../domain/farm/Farm";
import type { TrackedItemId } from "../../domain/farm/TrackedItem";
import type { InventoryItem, InventoryItemId } from "../../domain/inventory/Inventory";

export interface InventoryRepository {
  saveInventoryItem(item: InventoryItem): Promise<void>;
  listInventoryItems(farmId: FarmId): Promise<InventoryItem[]>;
  getInventoryItemById(farmId: FarmId, id: InventoryItemId): Promise<InventoryItem | null>;
  getInventoryItemByTrackedItemId(farmId: FarmId, trackedItemId: TrackedItemId): Promise<InventoryItem | null>;
}
