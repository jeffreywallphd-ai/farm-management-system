export const PILOT_UNITS = [
  "lb",
  "oz",
  "kg",
  "g",
  "each",
  "bunch",
  "crate",
  "bag",
  "gal",
  "L",
  "flat",
  "tray",
] as const;

export type PilotUnit = (typeof PILOT_UNITS)[number];
