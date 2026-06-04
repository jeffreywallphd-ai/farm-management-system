import { z } from "zod";

import {
  PLANNING_GOAL_CATEGORIES,
  PLANNING_GOAL_STATUSES,
  PLANNING_BOARD_SCOPE_TYPES,
  PLANNING_RECORD_LINK_TYPES,
  PLANNING_SOURCES,
  PLANNING_TASK_PRIORITIES,
  PLANNING_TASK_STATUSES,
} from "../planning/Planning";

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength).optional().transform((value) => (value ? value : undefined));

const optionalDateText = optionalText(32);
const optionalUriText = optionalText(2000);

export const planningGoalInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  farmId: z.string().trim().min(1),
  parentGoalId: optionalText(128),
  placeId: optionalText(128),
  title: z.string().trim().min(1, "Goal title is required.").max(120),
  description: optionalText(1000),
  category: z.enum(PLANNING_GOAL_CATEGORIES).default("general"),
  status: z.enum(PLANNING_GOAL_STATUSES).default("planned"),
  targetDate: optionalDateText,
  source: z.enum(PLANNING_SOURCES).default("farmer"),
  templateKey: optionalText(160),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const planningTaskInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  farmId: z.string().trim().min(1),
  goalId: optionalText(128),
  placeId: optionalText(128),
  title: z.string().trim().min(1, "Task title is required.").max(140),
  notes: optionalText(1000),
  status: z.enum(PLANNING_TASK_STATUSES).default("notStarted"),
  priority: z.enum(PLANNING_TASK_PRIORITIES).default("normal"),
  plannedStartDate: optionalDateText,
  dueDate: optionalDateText,
  estimatedMinutes: z.coerce.number().int().positive().max(24 * 60).optional(),
  assignedFarmhandId: optionalText(128),
  instructionVoiceMemo: z.object({
    localUri: optionalUriText,
    durationMs: z.coerce.number().int().positive().optional(),
    fileSizeBytes: z.coerce.number().int().nonnegative().optional(),
  }).optional().transform((value) => (value?.localUri ? value as { localUri: string; durationMs?: number; fileSizeBytes?: number } : undefined)),
  instructionPhotos: z.array(z.object({
    localUri: optionalUriText,
    width: z.coerce.number().int().positive().optional(),
    height: z.coerce.number().int().positive().optional(),
    mimeType: optionalText(80),
    fileSizeBytes: z.coerce.number().int().nonnegative().optional(),
  }).transform((value) => (value.localUri ? { ...value, localUri: value.localUri } : null))).default([])
    .transform((values) => values.filter((value): value is NonNullable<typeof value> => value !== null)),
  completionNotes: optionalText(1000),
  source: z.enum(PLANNING_SOURCES).default("farmer"),
  templateKey: optionalText(180),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const planningLinkInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  farmId: z.string().trim().min(1),
  goalId: optionalText(128),
  taskId: optionalText(128),
  linkedRecordType: z.enum(PLANNING_RECORD_LINK_TYPES),
  linkedRecordId: z.string().trim().min(1, "Linked record ID is required.").max(180),
  notes: optionalText(500),
}).refine((input) => Boolean(input.goalId || input.taskId), {
  message: "A planning link must belong to a goal or task.",
  path: ["goalId"],
});

export const planningBoardInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  farmId: z.string().trim().min(1),
  title: z.string().trim().min(1, "Board title is required.").max(120),
  scopeType: z.enum(PLANNING_BOARD_SCOPE_TYPES),
  goalId: optionalText(128),
  wipLimit: z.coerce.number().int().positive().max(99).optional(),
}).superRefine((input, context) => {
  if (input.scopeType === "goal" && !input.goalId) {
    context.addIssue({
      code: "custom",
      message: "Choose a goal for this board.",
      path: ["goalId"],
    });
  }

  if (input.scopeType === "nonGoalTasks" && input.goalId) {
    context.addIssue({
      code: "custom",
      message: "The non-goal task board cannot be tied to a goal.",
      path: ["goalId"],
    });
  }
});
