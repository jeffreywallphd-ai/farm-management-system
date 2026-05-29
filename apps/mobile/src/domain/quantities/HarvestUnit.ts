export const HARVEST_UNITS = ["lb", "oz", "kg", "g", "each", "bunch", "crate"] as const;

export type HarvestUnit = (typeof HARVEST_UNITS)[number];
