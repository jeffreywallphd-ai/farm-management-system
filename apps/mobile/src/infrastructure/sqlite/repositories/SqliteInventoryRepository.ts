import type { SQLiteDatabase } from "expo-sqlite";

import type { InventoryRepository } from "../../../application/ports/InventoryRepository";
import type { FarmId } from "../../../domain/farm/Farm";
import type { TrackedItemId } from "../../../domain/farm/TrackedItem";
import type { InventoryItem, InventoryItemId } from "../../../domain/inventory/Inventory";

interface InventoryItemRow {
  id: string;
  farm_id: string;
  kind: InventoryItem["kind"];
  tracked_item_id: string | null;
  name: string;
  category: string | null;
  common_item_key: string | null;
  acquisition_source: InventoryItem["acquisitionSource"];
  status: InventoryItem["status"];
  storage_location_id: string | null;
  default_unit: InventoryItem["defaultUnit"] | null;
  current_amount: number | null;
  current_unit: InventoryItem["currentUnit"] | null;
  supplier: string | null;
  reorder_point: string | null;
  notes: string | null;
  purchase_note_farm_event_id: string | null;
  organic_relevance: InventoryItem["organicRelevance"];
  organic_approval_status: InventoryItem["organicApprovalStatus"];
  organic_regulation_notes: string | null;
  organic_evidence_notes: string | null;
  equipment_contact_risk: string | null;
  cleaning_required: number;
  last_cleaned_at: string | null;
  created_at: string;
  updated_at: string;
}

export class SqliteInventoryRepository implements InventoryRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async saveInventoryItem(item: InventoryItem): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO inventory_items (
        id,
        farm_id,
        kind,
        tracked_item_id,
        name,
        category,
        common_item_key,
        acquisition_source,
        status,
        storage_location_id,
        default_unit,
        current_amount,
        current_unit,
        supplier,
        reorder_point,
        notes,
        purchase_note_farm_event_id,
        organic_relevance,
        organic_approval_status,
        organic_regulation_notes,
        organic_evidence_notes,
        equipment_contact_risk,
        cleaning_required,
        last_cleaned_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        common_item_key = excluded.common_item_key,
        acquisition_source = excluded.acquisition_source,
        status = excluded.status,
        storage_location_id = excluded.storage_location_id,
        default_unit = excluded.default_unit,
        current_amount = excluded.current_amount,
        current_unit = excluded.current_unit,
        supplier = excluded.supplier,
        reorder_point = excluded.reorder_point,
        notes = excluded.notes,
        purchase_note_farm_event_id = excluded.purchase_note_farm_event_id,
        organic_relevance = excluded.organic_relevance,
        organic_approval_status = excluded.organic_approval_status,
        organic_regulation_notes = excluded.organic_regulation_notes,
        organic_evidence_notes = excluded.organic_evidence_notes,
        equipment_contact_risk = excluded.equipment_contact_risk,
        cleaning_required = excluded.cleaning_required,
        last_cleaned_at = excluded.last_cleaned_at,
        updated_at = excluded.updated_at;`,
      [
        item.id,
        item.farmId,
        item.kind,
        item.trackedItemId ?? null,
        item.name,
        item.category ?? null,
        item.commonItemKey ?? null,
        item.acquisitionSource,
        item.status,
        item.storageLocationId ?? null,
        item.defaultUnit ?? null,
        item.currentAmount ?? null,
        item.currentUnit ?? null,
        item.supplier ?? null,
        item.reorderPoint ?? null,
        item.notes ?? null,
        item.purchaseNoteFarmEventId ?? null,
        item.organicRelevance,
        item.organicApprovalStatus,
        item.organicRegulationNotes ?? null,
        item.organicEvidenceNotes ?? null,
        item.equipmentContactRisk ?? null,
        item.cleaningRequired ? 1 : 0,
        item.lastCleanedAt ?? null,
        item.createdAt,
        item.updatedAt,
      ],
    );
  }

  async listInventoryItems(farmId: FarmId): Promise<InventoryItem[]> {
    const rows = await this.database.getAllAsync<InventoryItemRow>(
      `${inventorySelectSql} WHERE farm_id = ? ORDER BY name ASC, created_at ASC;`,
      [farmId],
    );

    return rows.map(mapInventoryItem);
  }

  async getInventoryItemById(farmId: FarmId, id: InventoryItemId): Promise<InventoryItem | null> {
    const row = await this.database.getFirstAsync<InventoryItemRow>(
      `${inventorySelectSql} WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );

    return row ? mapInventoryItem(row) : null;
  }

  async getInventoryItemByTrackedItemId(farmId: FarmId, trackedItemId: TrackedItemId): Promise<InventoryItem | null> {
    const row = await this.database.getFirstAsync<InventoryItemRow>(
      `${inventorySelectSql} WHERE farm_id = ? AND tracked_item_id = ? LIMIT 1;`,
      [farmId, trackedItemId],
    );

    return row ? mapInventoryItem(row) : null;
  }
}

const inventorySelectSql = `SELECT
  id,
  farm_id,
  kind,
  tracked_item_id,
  name,
  category,
  common_item_key,
  acquisition_source,
  status,
  storage_location_id,
  default_unit,
  current_amount,
  current_unit,
  supplier,
  reorder_point,
  notes,
  purchase_note_farm_event_id,
  organic_relevance,
  organic_approval_status,
  organic_regulation_notes,
  organic_evidence_notes,
  equipment_contact_risk,
  cleaning_required,
  last_cleaned_at,
  created_at,
  updated_at
FROM inventory_items`;

function mapInventoryItem(row: InventoryItemRow): InventoryItem {
  return {
    id: row.id,
    farmId: row.farm_id,
    kind: row.kind,
    trackedItemId: row.tracked_item_id ?? undefined,
    name: row.name,
    category: row.category ?? undefined,
    commonItemKey: row.common_item_key ?? undefined,
    acquisitionSource: row.acquisition_source,
    status: row.status,
    storageLocationId: row.storage_location_id ?? undefined,
    defaultUnit: row.default_unit ?? undefined,
    currentAmount: row.current_amount ?? undefined,
    currentUnit: row.current_unit ?? undefined,
    supplier: row.supplier ?? undefined,
    reorderPoint: row.reorder_point ?? undefined,
    notes: row.notes ?? undefined,
    purchaseNoteFarmEventId: row.purchase_note_farm_event_id ?? undefined,
    organicRelevance: row.organic_relevance,
    organicApprovalStatus: row.organic_approval_status,
    organicRegulationNotes: row.organic_regulation_notes ?? undefined,
    organicEvidenceNotes: row.organic_evidence_notes ?? undefined,
    equipmentContactRisk: row.equipment_contact_risk ?? undefined,
    cleaningRequired: row.cleaning_required === 1,
    lastCleanedAt: row.last_cleaned_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
