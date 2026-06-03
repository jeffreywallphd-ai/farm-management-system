import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";

import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import { getPlanningBoardOverview } from "../../application/use-cases/manage-planning/ListPlanning";
import { ensureDefaultPlanningBoards, movePlanningTaskStatus, savePlanningBoard } from "../../application/use-cases/manage-planning/ManagePlanning";
import type { Farm } from "../../domain/farm/Farm";
import {
  PLANNING_BOARD_SCOPE_TYPE_LABELS,
  PLANNING_BOARD_SCOPE_TYPES,
  PLANNING_TASK_PRIORITY_LABELS,
  PLANNING_TASK_STATUS_LABELS,
  type PlanningBoard,
  type PlanningBoardScopeType,
  type PlanningGoal,
  type PlanningLink,
  type PlanningTask,
  type PlanningTaskStatus,
} from "../../domain/planning/Planning";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FormField } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { pushRoute } from "../navigation";
import { theme } from "../theme/theme";
import { BOARD_COLUMN_STATUSES, countFarmNoteLinksByTask, isWipLimitExceeded, selectBoardColumnTasks } from "./PlanningBoardsScreenModel";

export function PlanningBoardsScreen({
  farm,
  initialGoalId,
  repository,
}: {
  farm: Farm;
  initialGoalId?: string;
  repository: PlanningRepository;
}) {
  const router = useRouter();
  const [boards, setBoards] = useState<PlanningBoard[]>([]);
  const [goals, setGoals] = useState<PlanningGoal[]>([]);
  const [tasks, setTasks] = useState<PlanningTask[]>([]);
  const [links, setLinks] = useState<PlanningLink[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<PlanningTaskStatus>("inProgress");
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardScopeType, setBoardScopeType] = useState<PlanningBoardScopeType>("goal");
  const [boardGoalId, setBoardGoalId] = useState("");
  const [boardWipLimit, setBoardWipLimit] = useState("");
  const [error, setError] = useState<string | undefined>();

  async function loadBoards(preferredBoardId = selectedBoardId) {
    const ensuredBoards = await ensureDefaultPlanningBoards(
      { farmId: farm.id },
      { clock: systemClock, idGenerator: localIdGenerator, repository },
    );
    const nextSelectedBoardId =
      preferredBoardId ||
      (initialGoalId ? ensuredBoards.find((board) => board.goalId === initialGoalId)?.id : "") ||
      ensuredBoards[0]?.id ||
      "";
    setBoards(ensuredBoards);
    setSelectedBoardId(nextSelectedBoardId);

    if (nextSelectedBoardId) {
      const overview = await getPlanningBoardOverview({ farmId: farm.id, boardId: nextSelectedBoardId }, { repository });
      setGoals(overview.goals);
      setTasks(overview.tasks);
      setLinks(overview.links);
    } else {
      setGoals(await repository.listGoals(farm.id));
      setTasks([]);
      setLinks([]);
    }
  }

  useEffect(() => {
    loadBoards().catch(() => setError("Farm work boards could not be loaded from this device."));
  }, [farm.id, initialGoalId, repository]);

  async function handleSelectBoard(boardId: string) {
    setError(undefined);
    setSelectedBoardId(boardId);
    try {
      await loadBoards(boardId);
    } catch {
      setError("This board could not be loaded from this device.");
    }
  }

  async function handleSaveBoard() {
    setError(undefined);
    try {
      const board = await savePlanningBoard(
        {
          farmId: farm.id,
          title: boardTitle,
          scopeType: boardScopeType,
          goalId: boardScopeType === "goal" ? boardGoalId : "",
          wipLimit: boardWipLimit ? boardWipLimit : undefined,
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      setBoardTitle("");
      setBoardGoalId("");
      setBoardWipLimit("");
      setIsCreatingBoard(false);
      await loadBoards(board.id);
    } catch (caught) {
      setError(caught instanceof z.ZodError ? caught.issues[0]?.message : "Board could not be saved.");
    }
  }

  async function handleMoveTask(task: PlanningTask, status: PlanningTaskStatus) {
    setError(undefined);
    try {
      await movePlanningTaskStatus(
        { farmId: farm.id, taskId: task.id, status },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      await loadBoards(selectedBoardId);
      setSelectedStatus(status);
    } catch {
      setError("Task status could not be updated.");
    }
  }

  const selectedBoard = boards.find((board) => board.id === selectedBoardId);
  const boardOptions = boards.map((board) => ({ label: board.title, value: board.id }));
  const rootGoalOptions = goals.filter((goal) => !goal.parentGoalId).map((goal) => ({ label: goal.title, value: goal.id }));
  const columnTasks = selectBoardColumnTasks(tasks, selectedStatus);
  const farmNoteCounts = useMemo(() => countFarmNoteLinksByTask(links), [links]);
  const wipExceeded = selectedBoard ? isWipLimitExceeded(tasks, selectedStatus, selectedBoard.wipLimit) : false;

  return (
    <Screen>
      <PageHeader
        eyebrow="Farm planning"
        supportingText="Move planned work through simple columns. Farm events stay connected to the task as the evidence of what happened."
        title="Farm work boards"
      />

      <Card>
        <SectionHeading detail="Default boards are created for each highest-level goal and for tasks without a goal." title="Board" />
        {boards.length ? (
          <SelectField label="Board" onChange={handleSelectBoard} options={boardOptions} value={selectedBoardId} />
        ) : (
          <EmptyState text="Create a goal or task to start a board." />
        )}
        <Button label={isCreatingBoard ? "Hide board form" : "Create board"} onPress={() => setIsCreatingBoard((current) => !current)} size="large" variant="secondary" />
        {isCreatingBoard ? (
          <View style={styles.formBlock}>
            <FormField label="Board title" onChangeText={setBoardTitle} placeholder="Spring greenhouse work" value={boardTitle} />
            <SelectField
              label="Board type"
              onChange={(value) => setBoardScopeType(value as PlanningBoardScopeType)}
              options={PLANNING_BOARD_SCOPE_TYPES.map((scopeType) => ({ label: PLANNING_BOARD_SCOPE_TYPE_LABELS[scopeType], value: scopeType }))}
              value={boardScopeType}
            />
            {boardScopeType === "goal" ? (
              <SelectField
                label="Goal"
                onChange={setBoardGoalId}
                options={[{ label: "Choose a goal", value: "" }, ...rootGoalOptions]}
                value={boardGoalId}
              />
            ) : null}
            <FormField label="Work-in-progress limit" onChangeText={setBoardWipLimit} placeholder="Optional number" value={boardWipLimit} />
            <Button label="Save board" onPress={handleSaveBoard} size="large" />
          </View>
        ) : null}
      </Card>

      <Card>
        <SectionHeading
          detail={selectedBoard?.wipLimit ? `WIP limit: ${selectedBoard.wipLimit}` : "Choose one column to keep the mobile view easy to scan."}
          title="Column"
        />
        <SelectField
          label="Status column"
          onChange={(value) => setSelectedStatus(value as PlanningTaskStatus)}
          options={BOARD_COLUMN_STATUSES.map((status) => ({ label: `${PLANNING_TASK_STATUS_LABELS[status]} (${selectBoardColumnTasks(tasks, status).length})`, value: status }))}
          value={selectedStatus}
        />
        {wipExceeded ? <Text style={styles.warning}>This column is over its work-in-progress limit. Finish or move work before adding more here.</Text> : null}
        {columnTasks.length ? columnTasks.map((task) => (
          <TaskBoardCard
            farmNoteCount={farmNoteCounts[task.id] ?? 0}
            key={task.id}
            onMove={(status) => handleMoveTask(task, status)}
            onRecordEvent={() => pushRoute(router, `/farm-events/new?taskId=${encodeURIComponent(task.id)}`)}
            task={task}
          />
        )) : <EmptyState text="No tasks in this column." />}
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

function TaskBoardCard({
  farmNoteCount,
  onMove,
  onRecordEvent,
  task,
}: {
  farmNoteCount: number;
  onMove: (status: PlanningTaskStatus) => void;
  onRecordEvent: () => void;
  task: PlanningTask;
}) {
  const moveStatuses = BOARD_COLUMN_STATUSES.filter((status) => status !== task.status);
  return (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskDetail}>
        {PLANNING_TASK_PRIORITY_LABELS[task.priority]}
        {task.dueDate ? ` - due ${task.dueDate}` : ""}
        {task.responsiblePerson ? ` - ${task.responsiblePerson}` : ""}
      </Text>
      <Text style={styles.taskDetail}>{farmNoteCount ? `${farmNoteCount} farm event${farmNoteCount === 1 ? "" : "s"} linked` : "No farm events linked yet"}</Text>
      <Button label="Record event for this task" onPress={onRecordEvent} size="large" />
      <View style={styles.moveActions}>
        {moveStatuses.map((status) => (
          <Button
            key={status}
            label={`Move to ${PLANNING_TASK_STATUS_LABELS[status]}`}
            onPress={() => onMove(status)}
            size="large"
            variant="secondary"
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  formBlock: {
    gap: theme.spacing.sm,
  },
  moveActions: {
    gap: theme.spacing.sm,
  },
  taskCard: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  taskDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  taskTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.section,
    fontWeight: "800",
    lineHeight: 26,
  },
  warning: {
    color: theme.colors.warning,
    fontSize: theme.typography.body,
    fontWeight: "700",
    lineHeight: 24,
  },
});
