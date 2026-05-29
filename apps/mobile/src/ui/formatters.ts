import type { HarvestRecordView } from "../application/ports/LocalRecordRepository";
import type {
  InventoryCountRecordView,
  LocalActivityRecordView,
  MaterialUseRecordView,
} from "../application/ports/LocalRecordRepository";
import type { Quantity } from "../domain/quantities/Quantity";

export function formatHarvestQuantity(view: HarvestRecordView): string {
  return `${view.record.quantity.amount} ${view.record.quantity.unit}`;
}

export function formatQuantity(quantity: Quantity): string {
  return `${quantity.amount} ${quantity.unit}`;
}

export function getActivityTitle(view: LocalActivityRecordView): string {
  if (view.record.kind === "HarvestRecorded") {
    const harvest = view as HarvestRecordView;
    return `Harvested ${formatHarvestQuantity(harvest)} ${harvest.crop.name}`;
  }

  if (view.record.kind === "MaterialUseRecorded") {
    const materialUse = view as MaterialUseRecordView;
    return `Used ${formatQuantity(materialUse.record.quantity)} ${materialUse.material.name}`;
  }

  const inventoryCount = view as InventoryCountRecordView;
  return `Counted ${formatQuantity(inventoryCount.record.observedQuantity)} ${inventoryCount.trackedItem.name}`;
}

export function getActivityDetail(view: LocalActivityRecordView): string {
  const location =
    view.record.kind === "HarvestRecorded"
      ? (view as HarvestRecordView).sourceLocation.name
      : view.record.kind === "MaterialUseRecorded"
        ? (view as MaterialUseRecordView).useLocation?.name
        : (view as InventoryCountRecordView).location?.name;

  return `${getActivityKindLabel(view.record.kind)}${location ? ` · ${location}` : ""} · ${formatRecordDate(
    view.record.effectiveAt,
  )}`;
}

export function getActivityKindLabel(kind: LocalActivityRecordView["record"]["kind"]): string {
  if (kind === "HarvestRecorded") {
    return "Harvest";
  }
  if (kind === "MaterialUseRecorded") {
    return "Material use";
  }
  return "Inventory count";
}

export function formatRecordDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
