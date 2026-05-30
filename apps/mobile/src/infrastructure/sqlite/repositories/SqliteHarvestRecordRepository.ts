import type { SQLiteDatabase } from "expo-sqlite";

import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmLocation } from "../../../domain/farm/FarmLocation";
import type { TrackedItem, TrackedItemKind } from "../../../domain/farm/TrackedItem";
import type { HarvestRecorded } from "../../../domain/records/HarvestRecorded";
import type { InventoryCountRecorded } from "../../../domain/records/InventoryCountRecorded";
import type { MaterialUseRecorded } from "../../../domain/records/MaterialUseRecorded";
import type { OperationalRecordId, OperationalRecordKind } from "../../../domain/records/OperationalRecord";
import type { HarvestUnit } from "../../../domain/quantities/HarvestUnit";
import type {
  HarvestRecordView,
  InventoryCountRecordView,
  LocalActivityRecordView,
  LocalRecordRepository,
  MaterialUseRecordView,
} from "../../../application/ports/LocalRecordRepository";

interface HarvestRow {
  id: string;
  farm_id: string;
  crop_id: string;
  source_location_id: string;
  quantity_amount: number;
  quantity_unit: HarvestUnit;
  effective_at: string;
  created_at: string;
  note: string | null;
  privacy: "privateToFarm";
  crop_name?: string;
  crop_created_at?: string;
  location_name?: string;
  location_kind?: FarmLocation["kind"];
  location_parent_id?: string | null;
  location_created_at?: string;
}

interface MaterialUseRow {
  id: string;
  farm_id: string;
  material_id: string;
  use_location_id: string | null;
  quantity_amount: number;
  quantity_unit: HarvestUnit;
  effective_at: string;
  created_at: string;
  note: string | null;
  privacy: "privateToFarm";
  material_name?: string;
  material_created_at?: string;
  location_name?: string | null;
  location_kind?: FarmLocation["kind"] | null;
  location_parent_id?: string | null;
  location_created_at?: string | null;
}

interface InventoryCountRow {
  id: string;
  farm_id: string;
  tracked_item_id: string;
  tracked_item_kind: "material" | "countableItem";
  location_id: string | null;
  observed_quantity_amount: number;
  observed_quantity_unit: HarvestUnit;
  effective_at: string;
  created_at: string;
  note: string | null;
  privacy: "privateToFarm";
  item_name?: string;
  item_created_at?: string;
  location_name?: string | null;
  location_kind?: FarmLocation["kind"] | null;
  location_parent_id?: string | null;
  location_created_at?: string | null;
}

export class SqliteHarvestRecordRepository implements LocalRecordRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async saveHarvest(record: HarvestRecorded): Promise<void> {
    const crop = await this.database.getFirstAsync<{ id: string }>(
      "SELECT id FROM tracked_items WHERE id = ? AND farm_id = ? AND kind = 'crop' LIMIT 1;",
      [record.cropId, record.farmId],
    );
    const location = await this.database.getFirstAsync<{ id: string }>(
      "SELECT id FROM farm_locations WHERE id = ? AND farm_id = ? LIMIT 1;",
      [record.sourceLocationId, record.farmId],
    );

    if (!crop || !location) {
      throw new Error("Harvest references must already exist on this device.");
    }

    await this.database.runAsync(
      `INSERT INTO harvest_records (
        id,
        farm_id,
        crop_id,
        source_location_id,
        quantity_amount,
        quantity_unit,
        effective_at,
        created_at,
        note,
        privacy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        record.id,
        record.farmId,
        record.cropId,
        record.sourceLocationId,
        record.quantity.amount,
        record.quantity.unit,
        record.effectiveAt,
        record.createdAt,
        record.note ?? null,
        record.privacy,
      ],
    );
  }

  async saveMaterialUse(record: MaterialUseRecorded): Promise<void> {
    await this.assertTrackedItem(record.materialId, record.farmId, ["material"], "Material");
    if (record.useLocationId) {
      await this.assertLocation(record.useLocationId, record.farmId);
    }

    await this.database.runAsync(
      `INSERT INTO material_use_records (
        id, farm_id, material_id, use_location_id, quantity_amount, quantity_unit,
        effective_at, created_at, note, privacy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        record.id,
        record.farmId,
        record.materialId,
        record.useLocationId ?? null,
        record.quantity.amount,
        record.quantity.unit,
        record.effectiveAt,
        record.createdAt,
        record.note ?? null,
        record.privacy,
      ],
    );
  }

  async saveInventoryCount(record: InventoryCountRecorded): Promise<void> {
    await this.assertTrackedItem(record.trackedItemId, record.farmId, ["material", "countableItem"], "Counted item");
    if (record.locationId) {
      await this.assertLocation(record.locationId, record.farmId);
    }

    await this.database.runAsync(
      `INSERT INTO inventory_count_records (
        id, farm_id, tracked_item_id, location_id, observed_quantity_amount,
        observed_quantity_unit, effective_at, created_at, note, privacy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        record.id,
        record.farmId,
        record.trackedItemId,
        record.locationId ?? null,
        record.observedQuantity.amount,
        record.observedQuantity.unit,
        record.effectiveAt,
        record.createdAt,
        record.note ?? null,
        record.privacy,
      ],
    );
  }

  async listLocalActivityHistory(farmId: FarmId): Promise<LocalActivityRecordView[]> {
    const [harvests, materialUses, inventoryCounts] = await Promise.all([
      this.listHarvestHistory(farmId),
      this.listMaterialUseHistory(farmId),
      this.listInventoryCountHistory(farmId),
    ]);

    return [...harvests, ...materialUses, ...inventoryCounts].sort((left, right) => {
      const leftRecord = getRecordFromView(left);
      const rightRecord = getRecordFromView(right);
      return (
        rightRecord.effectiveAt.localeCompare(leftRecord.effectiveAt) ||
        rightRecord.createdAt.localeCompare(leftRecord.createdAt)
      );
    });
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
      return this.getMaterialUseDetail(farmId, id);
    }
    return this.getInventoryCountDetail(farmId, id);
  }

  async listHarvestHistory(farmId: FarmId): Promise<HarvestRecordView[]> {
    const rows = await this.database.getAllAsync<HarvestRow>(
      `${HARVEST_VIEW_SELECT}
       WHERE harvest_records.farm_id = ?
       ORDER BY harvest_records.effective_at DESC, harvest_records.created_at DESC;`,
      [farmId],
    );

    return rows.map(mapHarvestView);
  }

  async getHarvestDetail(farmId: FarmId, id: OperationalRecordId): Promise<HarvestRecordView | null> {
    const row = await this.database.getFirstAsync<HarvestRow>(
      `${HARVEST_VIEW_SELECT}
       WHERE harvest_records.farm_id = ? AND harvest_records.id = ?
       LIMIT 1;`,
      [farmId, id],
    );

    return row ? mapHarvestView(row) : null;
  }

  async listHarvestRecordsForExport(farmId: FarmId): Promise<HarvestRecorded[]> {
    const rows = await this.database.getAllAsync<HarvestRow>(
      `SELECT
        id,
        farm_id,
        crop_id,
        source_location_id,
        quantity_amount,
        quantity_unit,
        effective_at,
        created_at,
        note,
        privacy
      FROM harvest_records
      WHERE farm_id = ?
      ORDER BY effective_at ASC, created_at ASC;`,
      [farmId],
    );

    return rows.map(mapHarvestRecord);
  }

  async listMaterialUseRecordsForExport(farmId: FarmId): Promise<MaterialUseRecorded[]> {
    const rows = await this.database.getAllAsync<MaterialUseRow>(
      `SELECT id, farm_id, material_id, use_location_id, quantity_amount, quantity_unit,
        effective_at, created_at, note, privacy
      FROM material_use_records
      WHERE farm_id = ?
      ORDER BY effective_at ASC, created_at ASC;`,
      [farmId],
    );

    return rows.map(mapMaterialUseRecord);
  }

  async listInventoryCountRecordsForExport(farmId: FarmId): Promise<InventoryCountRecorded[]> {
    const rows = await this.database.getAllAsync<InventoryCountRow>(
      `SELECT id, farm_id, tracked_item_id, tracked_items.kind AS tracked_item_kind, location_id,
        observed_quantity_amount, observed_quantity_unit, inventory_count_records.effective_at,
        inventory_count_records.created_at, note, privacy
      FROM inventory_count_records
      JOIN tracked_items ON tracked_items.id = inventory_count_records.tracked_item_id
      WHERE inventory_count_records.farm_id = ?
      ORDER BY inventory_count_records.effective_at ASC, inventory_count_records.created_at ASC;`,
      [farmId],
    );

    return rows.map(mapInventoryCountRecord);
  }

  private async listMaterialUseHistory(farmId: FarmId): Promise<MaterialUseRecordView[]> {
    const rows = await this.database.getAllAsync<MaterialUseRow>(
      `${MATERIAL_USE_VIEW_SELECT}
       WHERE material_use_records.farm_id = ?
       ORDER BY material_use_records.effective_at DESC, material_use_records.created_at DESC;`,
      [farmId],
    );

    return rows.map(mapMaterialUseView);
  }

  private async listInventoryCountHistory(farmId: FarmId): Promise<InventoryCountRecordView[]> {
    const rows = await this.database.getAllAsync<InventoryCountRow>(
      `${INVENTORY_COUNT_VIEW_SELECT}
       WHERE inventory_count_records.farm_id = ?
       ORDER BY inventory_count_records.effective_at DESC, inventory_count_records.created_at DESC;`,
      [farmId],
    );

    return rows.map(mapInventoryCountView);
  }

  private async getMaterialUseDetail(farmId: FarmId, id: OperationalRecordId): Promise<MaterialUseRecordView | null> {
    const row = await this.database.getFirstAsync<MaterialUseRow>(
      `${MATERIAL_USE_VIEW_SELECT}
       WHERE material_use_records.farm_id = ? AND material_use_records.id = ?
       LIMIT 1;`,
      [farmId, id],
    );

    return row ? mapMaterialUseView(row) : null;
  }

  private async getInventoryCountDetail(
    farmId: FarmId,
    id: OperationalRecordId,
  ): Promise<InventoryCountRecordView | null> {
    const row = await this.database.getFirstAsync<InventoryCountRow>(
      `${INVENTORY_COUNT_VIEW_SELECT}
       WHERE inventory_count_records.farm_id = ? AND inventory_count_records.id = ?
       LIMIT 1;`,
      [farmId, id],
    );

    return row ? mapInventoryCountView(row) : null;
  }

  private async assertTrackedItem(id: string, farmId: FarmId, kinds: TrackedItemKind[], label: string): Promise<void> {
    const placeholders = kinds.map(() => "?").join(", ");
    const item = await this.database.getFirstAsync<{ id: string }>(
      `SELECT id FROM tracked_items WHERE id = ? AND farm_id = ? AND kind IN (${placeholders}) LIMIT 1;`,
      [id, farmId, ...kinds],
    );

    if (!item) {
      throw new Error(`${label} must already exist on this device.`);
    }
  }

  private async assertLocation(id: string, farmId: FarmId): Promise<void> {
    const location = await this.database.getFirstAsync<{ id: string }>(
      "SELECT id FROM farm_locations WHERE id = ? AND farm_id = ? LIMIT 1;",
      [id, farmId],
    );

    if (!location) {
      throw new Error("Location must already exist on this device.");
    }
  }
}

const HARVEST_VIEW_SELECT = `SELECT
  harvest_records.id,
  harvest_records.farm_id,
  harvest_records.crop_id,
  harvest_records.source_location_id,
  harvest_records.quantity_amount,
  harvest_records.quantity_unit,
  harvest_records.effective_at,
  harvest_records.created_at,
  harvest_records.note,
  harvest_records.privacy,
  crops.name AS crop_name,
  crops.created_at AS crop_created_at,
  locations.name AS location_name,
  locations.kind AS location_kind,
  locations.parent_id AS location_parent_id,
  locations.created_at AS location_created_at
FROM harvest_records
JOIN tracked_items crops ON crops.id = harvest_records.crop_id AND crops.kind = 'crop'
JOIN farm_locations locations ON locations.id = harvest_records.source_location_id`;

const MATERIAL_USE_VIEW_SELECT = `SELECT
  material_use_records.id,
  material_use_records.farm_id,
  material_use_records.material_id,
  material_use_records.use_location_id,
  material_use_records.quantity_amount,
  material_use_records.quantity_unit,
  material_use_records.effective_at,
  material_use_records.created_at,
  material_use_records.note,
  material_use_records.privacy,
  materials.name AS material_name,
  materials.created_at AS material_created_at,
  locations.name AS location_name,
  locations.kind AS location_kind,
  locations.parent_id AS location_parent_id,
  locations.created_at AS location_created_at
FROM material_use_records
JOIN tracked_items materials ON materials.id = material_use_records.material_id AND materials.kind = 'material'
LEFT JOIN farm_locations locations ON locations.id = material_use_records.use_location_id`;

const INVENTORY_COUNT_VIEW_SELECT = `SELECT
  inventory_count_records.id,
  inventory_count_records.farm_id,
  inventory_count_records.tracked_item_id,
  items.kind AS tracked_item_kind,
  inventory_count_records.location_id,
  inventory_count_records.observed_quantity_amount,
  inventory_count_records.observed_quantity_unit,
  inventory_count_records.effective_at,
  inventory_count_records.created_at,
  inventory_count_records.note,
  inventory_count_records.privacy,
  items.name AS item_name,
  items.created_at AS item_created_at,
  locations.name AS location_name,
  locations.kind AS location_kind,
  locations.parent_id AS location_parent_id,
  locations.created_at AS location_created_at
FROM inventory_count_records
JOIN tracked_items items ON items.id = inventory_count_records.tracked_item_id AND items.kind IN ('material', 'countableItem')
LEFT JOIN farm_locations locations ON locations.id = inventory_count_records.location_id`;

function mapHarvestView(row: HarvestRow): HarvestRecordView {
  return {
    record: mapHarvestRecord(row),
    crop: mapCrop(row),
    sourceLocation: mapLocation(row),
  };
}

function mapHarvestRecord(row: HarvestRow): HarvestRecorded {
  return {
    id: row.id,
    kind: "HarvestRecorded",
    farmId: row.farm_id,
    cropId: row.crop_id,
    sourceLocationId: row.source_location_id,
    quantity: {
      amount: row.quantity_amount,
      unit: row.quantity_unit,
    },
    effectiveAt: row.effective_at,
    createdAt: row.created_at,
    privacy: row.privacy,
    note: row.note ?? undefined,
  };
}

function mapMaterialUseView(row: MaterialUseRow): MaterialUseRecordView {
  return {
    record: mapMaterialUseRecord(row),
    material: {
      id: row.material_id,
      farmId: row.farm_id,
      kind: "material",
      name: row.material_name ?? "Material",
      createdAt: row.material_created_at ?? row.created_at,
    },
    useLocation: row.use_location_id ? mapOptionalLocation(row.use_location_id, row) : undefined,
  };
}

function mapMaterialUseRecord(row: MaterialUseRow): MaterialUseRecorded {
  return {
    id: row.id,
    kind: "MaterialUseRecorded",
    farmId: row.farm_id,
    materialId: row.material_id,
    useLocationId: row.use_location_id ?? undefined,
    quantity: { amount: row.quantity_amount, unit: row.quantity_unit },
    effectiveAt: row.effective_at,
    createdAt: row.created_at,
    privacy: row.privacy,
    note: row.note ?? undefined,
  };
}

function mapInventoryCountView(row: InventoryCountRow): InventoryCountRecordView {
  return {
    record: mapInventoryCountRecord(row),
    trackedItem: {
      id: row.tracked_item_id,
      farmId: row.farm_id,
      kind: row.tracked_item_kind,
      name: row.item_name ?? "Item",
      createdAt: row.item_created_at ?? row.created_at,
    },
    location: row.location_id ? mapOptionalLocation(row.location_id, row) : undefined,
  };
}

function mapInventoryCountRecord(row: InventoryCountRow): InventoryCountRecorded {
  return {
    id: row.id,
    kind: "InventoryCountRecorded",
    farmId: row.farm_id,
    trackedItemId: row.tracked_item_id,
    locationId: row.location_id ?? undefined,
    observedQuantity: { amount: row.observed_quantity_amount, unit: row.observed_quantity_unit },
    effectiveAt: row.effective_at,
    createdAt: row.created_at,
    privacy: row.privacy,
    note: row.note ?? undefined,
  };
}

function mapCrop(row: HarvestRow): TrackedItem {
  return {
    id: row.crop_id,
    farmId: row.farm_id,
    kind: "crop",
    name: row.crop_name ?? "Crop",
    createdAt: row.crop_created_at ?? row.created_at,
  };
}

function mapLocation(row: HarvestRow): FarmLocation {
  return {
    id: row.source_location_id,
    farmId: row.farm_id,
    name: row.location_name ?? "Location",
    kind: row.location_kind ?? "other",
    parentId: row.location_parent_id ?? undefined,
    createdAt: row.location_created_at ?? row.created_at,
  };
}

function mapOptionalLocation(
  id: string,
  row: {
    farm_id: string;
    location_name?: string | null;
    location_kind?: FarmLocation["kind"] | null;
    location_parent_id?: string | null;
    location_created_at?: string | null;
    created_at: string;
  },
): FarmLocation {
  return {
    id,
    farmId: row.farm_id,
    name: row.location_name ?? "Location",
    kind: row.location_kind ?? "other",
    parentId: row.location_parent_id ?? undefined,
    createdAt: row.location_created_at ?? row.created_at,
  };
}

function getRecordFromView(view: LocalActivityRecordView) {
  return view.record;
}
