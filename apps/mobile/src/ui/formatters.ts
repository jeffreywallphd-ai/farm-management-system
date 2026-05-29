import type { HarvestRecordView } from "../application/ports/LocalRecordRepository";

export function formatHarvestQuantity(view: HarvestRecordView): string {
  return `${view.record.quantity.amount} ${view.record.quantity.unit}`;
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
