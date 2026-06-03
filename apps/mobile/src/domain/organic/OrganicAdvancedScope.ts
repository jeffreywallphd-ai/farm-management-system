import type { FarmId } from "../farm/Farm";
import type { IsoDateTimeString } from "../records/OperationalRecord";
import type { OrganicReadinessStatus } from "./OrganicSystemPlan";

export const ORGANIC_ADVANCED_SCOPE_TYPES = [
  "livestock",
  "wildCrops",
  "mushrooms",
  "producerGroup",
  "imports",
  "labeling",
] as const;
export type OrganicAdvancedScopeType = (typeof ORGANIC_ADVANCED_SCOPE_TYPES)[number];

export const ORGANIC_ADVANCED_SCOPE_TYPE_LABELS: Record<OrganicAdvancedScopeType, string> = {
  livestock: "Livestock",
  wildCrops: "Wild crops",
  mushrooms: "Mushrooms",
  producerGroup: "Producer group",
  imports: "Imports",
  labeling: "Labeling and product claims",
};

export interface OrganicAdvancedScopeRecord {
  id: string;
  farmId: FarmId;
  scopeType: OrganicAdvancedScopeType;
  topic: string;
  description: string;
  readinessStatus: OrganicReadinessStatus;
  evidenceAttachmentIds: string[];
  notes?: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}
