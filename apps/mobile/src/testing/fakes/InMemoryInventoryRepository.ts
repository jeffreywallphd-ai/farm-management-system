import type { FarmId } from "../../domain/farm/Farm";
import type { TrackedItemId } from "../../domain/farm/TrackedItem";
import type { InventoryItem, InventoryItemId } from "../../domain/inventory/Inventory";
import type { InventoryRepository } from "../../application/ports/InventoryRepository";

export class InMemoryInventoryRepository implements InventoryRepository {
  private items: InventoryItem[] = [];

  constructor(initialItems: InventoryItem[] = []) {
    this.items = initialItems;
  }

  async saveInventoryItem(item: InventoryItem): Promise<void> {
    const existingIndex = this.items.findIndex((candidate) => candidate.farmId === item.farmId && candidate.id === item.id);

    if (existingIndex >= 0) {
      this.items[existingIndex] = item;
      return;
    }

    this.items.push(item);
  }

  async listInventoryItems(farmId: FarmId): Promise<InventoryItem[]> {
    return this.items.filter((item) => item.farmId === farmId);
  }

  async getInventoryItemById(farmId: FarmId, id: InventoryItemId): Promise<InventoryItem | null> {
    return this.items.find((item) => item.farmId === farmId && item.id === id) ?? null;
  }

  async getInventoryItemByTrackedItemId(farmId: FarmId, trackedItemId: TrackedItemId): Promise<InventoryItem | null> {
    return this.items.find((item) => item.farmId === farmId && item.trackedItemId === trackedItemId) ?? null;
  }
}
