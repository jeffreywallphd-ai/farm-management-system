import type { Clock } from "../../ports/Clock";
import type { FarmhandRepository } from "../../ports/FarmhandRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { PlanningRepository } from "../../ports/PlanningRepository";
import type {
  PlanningGoal,
  PlanningBoard,
  PlanningLink,
  PlanningTask,
  PlanningTaskStatus,
} from "../../../domain/planning/Planning";
import {
  planningBoardInputSchema,
  planningGoalInputSchema,
  planningLinkInputSchema,
  planningTaskInputSchema,
} from "../../../domain/validation/planningValidation";

interface PlanningDependencies {
  clock: Clock;
  farmhandRepository?: FarmhandRepository;
  idGenerator: IdGenerator;
  repository: PlanningRepository;
}

export async function savePlanningBoard(
  input: Parameters<typeof planningBoardInputSchema.parse>[0],
  dependencies: PlanningDependencies,
): Promise<PlanningBoard> {
  const parsed = planningBoardInputSchema.parse(input);
  const existing = parsed.id ? await dependencies.repository.getBoard(parsed.farmId, parsed.id) : null;
  if (parsed.id && !existing) {
    throw new Error("Planning board does not exist on this farm.");
  }

  if (parsed.goalId && !(await dependencies.repository.getGoal(parsed.farmId, parsed.goalId))) {
    throw new Error("Planning board goal does not exist on this farm.");
  }

  const now = dependencies.clock.now().toISOString();
  const board: PlanningBoard = {
    id: existing?.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    title: parsed.title,
    scopeType: parsed.scopeType,
    goalId: parsed.goalId,
    wipLimit: parsed.wipLimit,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await dependencies.repository.saveBoard(board);
  return board;
}

export async function ensureDefaultPlanningBoards(
  input: { farmId: string },
  dependencies: PlanningDependencies,
): Promise<PlanningBoard[]> {
  const [goals, existingBoards] = await Promise.all([
    dependencies.repository.listGoals(input.farmId),
    dependencies.repository.listBoards(input.farmId),
  ]);
  const rootGoals = goals.filter((goal) => !goal.parentGoalId);
  const boards = [...existingBoards];

  for (const goal of rootGoals) {
    const existingGoalBoard = boards.find((board) => board.scopeType === "goal" && board.goalId === goal.id);
    if (!existingGoalBoard) {
      boards.push(await savePlanningBoard(
        {
          farmId: input.farmId,
          title: goal.title,
          scopeType: "goal",
          goalId: goal.id,
        },
        dependencies,
      ));
    }
  }

  if (!boards.some((board) => board.scopeType === "nonGoalTasks")) {
    boards.push(await savePlanningBoard(
      {
        farmId: input.farmId,
        title: "Non-goal farm work",
        scopeType: "nonGoalTasks",
      },
      dependencies,
    ));
  }

  return dependencies.repository.listBoards(input.farmId);
}

export async function movePlanningTaskStatus(
  input: { farmId: string; taskId: string; status: PlanningTaskStatus },
  dependencies: PlanningDependencies,
): Promise<PlanningTask> {
  const task = await dependencies.repository.getTask(input.farmId, input.taskId);
  if (!task) {
    throw new Error("Planning task does not exist on this farm.");
  }

  return savePlanningTask(
    {
      ...task,
      status: input.status,
    },
    dependencies,
  );
}

export async function savePlanningGoal(
  input: Parameters<typeof planningGoalInputSchema.parse>[0],
  dependencies: PlanningDependencies,
): Promise<PlanningGoal> {
  const parsed = planningGoalInputSchema.parse(input);
  const existing = parsed.id ? await dependencies.repository.getGoal(parsed.farmId, parsed.id) : null;
  if (parsed.id && !existing) {
    throw new Error("Planning goal does not exist on this farm.");
  }

  if (parsed.parentGoalId) {
    await assertValidParentGoal(parsed.farmId, existing?.id ?? parsed.id, parsed.parentGoalId, dependencies.repository);
  }

  if (parsed.placeId && !(await dependencies.repository.getLocation(parsed.farmId, parsed.placeId))) {
    throw new Error("Planning goal place does not exist on this farm.");
  }

  const now = dependencies.clock.now().toISOString();
  const goal: PlanningGoal = {
    id: existing?.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    parentGoalId: parsed.parentGoalId,
    placeId: parsed.placeId,
    title: parsed.title,
    description: parsed.description,
    category: parsed.category,
    status: parsed.status,
    targetDate: parsed.targetDate,
    source: parsed.source,
    templateKey: parsed.templateKey,
    sortOrder: parsed.sortOrder,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await dependencies.repository.saveGoal(goal);
  return goal;
}

export async function savePlanningTask(
  input: Parameters<typeof planningTaskInputSchema.parse>[0],
  dependencies: PlanningDependencies,
): Promise<PlanningTask> {
  const parsed = planningTaskInputSchema.parse(input);
  const existing = parsed.id ? await dependencies.repository.getTask(parsed.farmId, parsed.id) : null;
  if (parsed.id && !existing) {
    throw new Error("Planning task does not exist on this farm.");
  }

  if (parsed.goalId && !(await dependencies.repository.getGoal(parsed.farmId, parsed.goalId))) {
    throw new Error("Planning task goal does not exist on this farm.");
  }

  if (parsed.placeId && !(await dependencies.repository.getLocation(parsed.farmId, parsed.placeId))) {
    throw new Error("Planning task place does not exist on this farm.");
  }

  if (parsed.assignedFarmhandId && dependencies.farmhandRepository && !(await dependencies.farmhandRepository.getFarmhand(parsed.farmId, parsed.assignedFarmhandId))) {
    throw new Error("Assigned farmhand does not exist on this farm.");
  }

  const now = dependencies.clock.now().toISOString();
  const completedAt = parsed.status === "done" ? existing?.completedAt ?? now : undefined;
  const task: PlanningTask = {
    id: existing?.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    goalId: parsed.goalId,
    placeId: parsed.placeId,
    title: parsed.title,
    notes: parsed.notes,
    status: parsed.status,
    priority: parsed.priority,
    plannedStartDate: parsed.plannedStartDate,
    dueDate: parsed.dueDate,
    estimatedMinutes: parsed.estimatedMinutes,
    assignedFarmhandId: parsed.assignedFarmhandId,
    instructionVoiceMemo: parsed.instructionVoiceMemo,
    instructionPhotos: parsed.instructionPhotos,
    completionNotes: parsed.completionNotes,
    completedAt,
    source: parsed.source,
    templateKey: parsed.templateKey,
    sortOrder: parsed.sortOrder,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await dependencies.repository.saveTask(task);
  return task;
}

export async function savePlanningLink(
  input: Parameters<typeof planningLinkInputSchema.parse>[0],
  dependencies: PlanningDependencies,
): Promise<PlanningLink> {
  const parsed = planningLinkInputSchema.parse(input);

  if (parsed.goalId && !(await dependencies.repository.getGoal(parsed.farmId, parsed.goalId))) {
    throw new Error("Planning link goal does not exist on this farm.");
  }

  if (parsed.taskId && !(await dependencies.repository.getTask(parsed.farmId, parsed.taskId))) {
    throw new Error("Planning link task does not exist on this farm.");
  }

  const link: PlanningLink = {
    id: parsed.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    goalId: parsed.goalId,
    taskId: parsed.taskId,
    linkedRecordType: parsed.linkedRecordType,
    linkedRecordId: parsed.linkedRecordId,
    notes: parsed.notes,
    createdAt: dependencies.clock.now().toISOString(),
  };

  await dependencies.repository.saveLink(link);
  return link;
}

async function assertValidParentGoal(
  farmId: string,
  currentGoalId: string | undefined,
  parentGoalId: string,
  repository: PlanningRepository,
) {
  if (currentGoalId && currentGoalId === parentGoalId) {
    throw new Error("A goal cannot be its own parent.");
  }

  let cursor: PlanningGoal | null = await repository.getGoal(farmId, parentGoalId);
  if (!cursor) {
    throw new Error("Parent goal does not exist on this farm.");
  }

  const seen = new Set<string>();
  while (cursor?.parentGoalId) {
    if (seen.has(cursor.id)) {
      throw new Error("Goal hierarchy contains a cycle.");
    }
    seen.add(cursor.id);

    if (currentGoalId && cursor.parentGoalId === currentGoalId) {
      throw new Error("A goal cannot be moved under one of its own subgoals.");
    }

    cursor = await repository.getGoal(farmId, cursor.parentGoalId);
  }
}
