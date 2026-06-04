import type { FarmId } from "../farm/Farm";
import type { FarmLocationId } from "../farm/FarmLocation";
import type { FarmhandId } from "../farmhand/Farmhand";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export type PlanningGoalId = string;
export type PlanningTaskId = string;
export type PlanningLinkId = string;
export type PlanningBoardId = string;

export const PLANNING_GOAL_CATEGORIES = [
  "general",
  "organicCertification",
  "cropProduction",
  "soilHealth",
  "infrastructure",
  "equipment",
  "sales",
  "team",
] as const;

export type PlanningGoalCategory = (typeof PLANNING_GOAL_CATEGORIES)[number];

export const PLANNING_GOAL_CATEGORY_LABELS: Record<PlanningGoalCategory, string> = {
  general: "General",
  organicCertification: "Organic certification",
  cropProduction: "Crop production",
  soilHealth: "Soil health",
  infrastructure: "Infrastructure",
  equipment: "Equipment",
  sales: "Sales",
  team: "Team",
};

export const PLANNING_GOAL_STATUSES = ["planned", "active", "paused", "completed", "canceled"] as const;

export type PlanningGoalStatus = (typeof PLANNING_GOAL_STATUSES)[number];

export const PLANNING_GOAL_STATUS_LABELS: Record<PlanningGoalStatus, string> = {
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  canceled: "Canceled",
};

export const PLANNING_TASK_STATUSES = ["notStarted", "inProgress", "blocked", "done", "canceled"] as const;

export type PlanningTaskStatus = (typeof PLANNING_TASK_STATUSES)[number];

export const PLANNING_TASK_STATUS_LABELS: Record<PlanningTaskStatus, string> = {
  notStarted: "Not started",
  inProgress: "In progress",
  blocked: "Blocked",
  done: "Done",
  canceled: "Canceled",
};

export const PLANNING_TASK_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export type PlanningTaskPriority = (typeof PLANNING_TASK_PRIORITIES)[number];

export const PLANNING_TASK_PRIORITY_LABELS: Record<PlanningTaskPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const PLANNING_RECORD_LINK_TYPES = [
  "farmNote",
  "farmPlace",
  "trackedItem",
  "organicProfile",
  "organicPlaceProfile",
  "organicInput",
  "organicInputApplication",
  "seedLot",
  "organicPlantingEvent",
  "soilFertilityPractice",
  "compostBatch",
  "manureApplication",
  "cropRotationRecord",
  "pestObservation",
  "pestAction",
  "organicLot",
  "organicSystemPlanSection",
  "organicReportPackage",
  "organicAdvancedScopeRecord",
  "organicEvidenceLink",
  "other",
] as const;

export type PlanningRecordLinkType = (typeof PLANNING_RECORD_LINK_TYPES)[number];

export const PLANNING_RECORD_LINK_TYPE_LABELS: Record<PlanningRecordLinkType, string> = {
  farmNote: "Farm note",
  farmPlace: "Farm place",
  trackedItem: "Crop, material, or item",
  organicProfile: "Organic profile",
  organicPlaceProfile: "Organic place",
  organicInput: "Organic input",
  organicInputApplication: "Input application",
  seedLot: "Seed lot",
  organicPlantingEvent: "Planting event",
  soilFertilityPractice: "Soil practice",
  compostBatch: "Compost batch",
  manureApplication: "Manure application",
  cropRotationRecord: "Crop rotation",
  pestObservation: "Pest observation",
  pestAction: "Pest action",
  organicLot: "Organic lot",
  organicSystemPlanSection: "OSP section",
  organicReportPackage: "Organic report package",
  organicAdvancedScopeRecord: "Advanced scope record",
  organicEvidenceLink: "Organic evidence link",
  other: "Other",
};

export const PLANNING_SOURCES = ["farmer", "organicCertificationTemplate", "organicCertification"] as const;

export type PlanningSource = (typeof PLANNING_SOURCES)[number];

export const PLANNING_BOARD_SCOPE_TYPES = ["goal", "nonGoalTasks"] as const;

export type PlanningBoardScopeType = (typeof PLANNING_BOARD_SCOPE_TYPES)[number];

export const PLANNING_BOARD_SCOPE_TYPE_LABELS: Record<PlanningBoardScopeType, string> = {
  goal: "Goal board",
  nonGoalTasks: "Non-goal tasks",
};

export interface PlanningGoal {
  id: PlanningGoalId;
  farmId: FarmId;
  parentGoalId?: PlanningGoalId;
  placeId?: FarmLocationId;
  title: string;
  description?: string;
  category: PlanningGoalCategory;
  status: PlanningGoalStatus;
  targetDate?: string;
  source: PlanningSource;
  templateKey?: string;
  sortOrder: number;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface PlanningTaskInstructionVoiceMemo {
  localUri: string;
  durationMs?: number;
  fileSizeBytes?: number;
}

export interface PlanningTaskInstructionPhoto {
  localUri: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileSizeBytes?: number;
}

export interface PlanningTask {
  id: PlanningTaskId;
  farmId: FarmId;
  goalId?: PlanningGoalId;
  placeId?: FarmLocationId;
  title: string;
  notes?: string;
  status: PlanningTaskStatus;
  priority: PlanningTaskPriority;
  plannedStartDate?: string;
  dueDate?: string;
  estimatedMinutes?: number;
  assignedFarmhandId?: FarmhandId;
  instructionVoiceMemo?: PlanningTaskInstructionVoiceMemo;
  instructionPhotos?: PlanningTaskInstructionPhoto[];
  completionNotes?: string;
  completedAt?: IsoDateTimeString;
  source: PlanningSource;
  templateKey?: string;
  sortOrder: number;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface PlanningLink {
  id: PlanningLinkId;
  farmId: FarmId;
  goalId?: PlanningGoalId;
  taskId?: PlanningTaskId;
  linkedRecordType: PlanningRecordLinkType;
  linkedRecordId: string;
  notes?: string;
  createdAt: IsoDateTimeString;
}

export interface PlanningBoard {
  id: PlanningBoardId;
  farmId: FarmId;
  title: string;
  scopeType: PlanningBoardScopeType;
  goalId?: PlanningGoalId;
  wipLimit?: number;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}
