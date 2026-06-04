export type TimeMeridiem = "AM" | "PM";

export interface TimePickerParts {
  hour: string;
  minute: string;
  meridiem: TimeMeridiem;
}

export const TIME_PICKER_HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1));
export const TIME_PICKER_MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
export const TIME_PICKER_MERIDIEMS: TimeMeridiem[] = ["AM", "PM"];

const twentyFourHourPattern = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const twelveHourPattern = /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(AM|PM)$/i;

export function parseTimeInput(value: string): TimePickerParts | null {
  const trimmed = value.trim();
  const twelveHourMatch = twelveHourPattern.exec(trimmed);
  if (twelveHourMatch) {
    return {
      hour: String(Number(twelveHourMatch[1])),
      minute: twelveHourMatch[2] ?? "00",
      meridiem: twelveHourMatch[3]?.toUpperCase() === "PM" ? "PM" : "AM",
    };
  }

  const twentyFourHourMatch = twentyFourHourPattern.exec(trimmed);
  if (!twentyFourHourMatch) {
    return null;
  }

  const hour24 = Number(twentyFourHourMatch[1]);
  return {
    hour: String(hour24 % 12 || 12),
    minute: twentyFourHourMatch[2] ?? "00",
    meridiem: hour24 >= 12 ? "PM" : "AM",
  };
}

export function defaultTimeParts(): TimePickerParts {
  return { hour: "8", minute: "00", meridiem: "AM" };
}

export function formatTimeInput(parts: TimePickerParts): string {
  const hour12 = Number(parts.hour);
  const normalizedHour = Number.isFinite(hour12) && hour12 >= 1 && hour12 <= 12 ? hour12 : 8;
  const hour24 = parts.meridiem === "PM"
    ? (normalizedHour === 12 ? 12 : normalizedHour + 12)
    : (normalizedHour === 12 ? 0 : normalizedHour);

  return `${String(hour24).padStart(2, "0")}:${parts.minute.padStart(2, "0")}`;
}

export function formatTimeDisplay(value: string): string {
  const parts = parseTimeInput(value);
  if (!parts) {
    return "Choose time";
  }
  return `${Number(parts.hour)}:${parts.minute.padStart(2, "0")} ${parts.meridiem}`;
}

export function minuteOptionsFor(value: string): string[] {
  const parsed = parseTimeInput(value);
  if (!parsed || TIME_PICKER_MINUTES.includes(parsed.minute)) {
    return TIME_PICKER_MINUTES;
  }

  return [parsed.minute, ...TIME_PICKER_MINUTES].sort((left, right) => Number(left) - Number(right));
}
