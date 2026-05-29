import { PILOT_UNITS } from "./PilotUnit";

export const HARVEST_UNITS = PILOT_UNITS;

export type HarvestUnit = (typeof HARVEST_UNITS)[number];
