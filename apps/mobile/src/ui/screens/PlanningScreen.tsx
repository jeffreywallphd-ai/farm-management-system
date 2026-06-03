import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";

import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import { getPlanningOverview } from "../../application/use-cases/manage-planning/ListPlanning";
import { savePlanningGoal, savePlanningTask } from "../../application/use-cases/manage-planning/ManagePlanning";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import {
  PLANNING_GOAL_CATEGORIES,
  PLANNING_GOAL_CATEGORY_LABELS,
  PLANNING_GOAL_STATUSES,
  PLANNING_GOAL_STATUS_LABELS,
  PLANNING_TASK_PRIORITIES,
  PLANNING_TASK_PRIORITY_LABELS,
  PLANNING_TASK_STATUSES,
  PLANNING_TASK_STATUS_LABELS,
  type PlanningGoal,
  type PlanningGoalCategory,
  type PlanningGoalStatus,
  type PlanningPeriod,
  type PlanningTask,
  type PlanningTaskPriority,
  type PlanningTaskStatus,
} from "../../domain/planning/Planning";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DateField } from "../components/DateField";
import { EmptyState } from "../components/EmptyState";
import { FormField } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SearchableSelectField, type SearchableSelectOption } from "../components/SearchableSelectField";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { buildFarmPlaceDisplays, type FarmPlaceDisplay } from "../farmPlaceDisplay";
import { theme } from "../theme/theme";
import { pushRoute } from "../navigation";
import {
  findRootGoalId,
  selectFocusedGoalScope,
  selectPlanningReviewLists,
  type PlanningMode,
} from "./PlanningScreenModel";

export function PlanningScreen({ farm, locations, repository }: { farm: Farm; locations: FarmLocation[]; repository: PlanningRepository }) {
  const router = useRouter();
  const [mode, setMode] = useState<PlanningMode>("review");
  const [goals, setGoals] = useState<PlanningGoal[]>([]);
  const [periods, setPeriods] = useState<PlanningPeriod[]>([]);
  const [tasks, setTasks] = useState<PlanningTask[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [focusedRootGoalId, setFocusedRootGoalId] = useState("");

  const [editingGoalId, setEditingGoalId] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalCategory, setGoalCategory] = useState<PlanningGoalCategory>("general");
  const [goalStatus, setGoalStatus] = useState<PlanningGoalStatus>("planned");
  const [parentGoalId, setParentGoalId] = useState("");
  const [goalPlaceId, setGoalPlaceId] = useState("");
  const [goalTargetDate, setGoalTargetDate] = useState("");

  const [editingTaskId, setEditingTaskId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskGoalId, setTaskGoalId] = useState("");
  const [taskPeriodId, setTaskPeriodId] = useState("");
  const [taskPlaceId, setTaskPlaceId] = useState("");
  const [taskStatus, setTaskStatus] = useState<PlanningTaskStatus>("notStarted");
  const [taskPriority, setTaskPriority] = useState<PlanningTaskPriority>("normal");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskResponsiblePerson, setTaskResponsiblePerson] = useState("");

  async function loadPlanning() {
    const overview = await getPlanningOverview({ farmId: farm.id }, { repository });
    setGoals(overview.goals);
    setPeriods(overview.periods);
    setTasks(overview.tasks);
  }

  useEffect(() => {
    loadPlanning().catch(() => setError("Planning records could not be loaded from this device."));
  }, [farm.id, repository]);

  function errorMessage(caught: unknown, fallback: string): string {
    return caught instanceof z.ZodError ? caught.issues[0]?.message ?? fallback : fallback;
  }

  function resetGoalForm() {
    setEditingGoalId("");
    setGoalTitle("");
    setGoalDescription("");
    setGoalCategory("general");
    setGoalStatus("planned");
    setParentGoalId("");
    setGoalPlaceId("");
    setGoalTargetDate("");
  }

  function resetTaskForm(nextGoalId = "") {
    setEditingTaskId("");
    setTaskTitle("");
    setTaskNotes("");
    setTaskGoalId(nextGoalId);
    setTaskPeriodId("");
    setTaskPlaceId("");
    setTaskStatus("notStarted");
    setTaskPriority("normal");
    setTaskDueDate("");
    setTaskResponsiblePerson("");
  }

  function startCreateGoalWithTasks() {
    setMode("createGoal");
    setError(undefined);
    setFocusedRootGoalId("");
    resetGoalForm();
    resetTaskForm();
  }

  function startSingleTask() {
    setMode("singleTask");
    setError(undefined);
    setFocusedRootGoalId("");
    resetGoalForm();
    resetTaskForm();
  }

  function startReview() {
    setMode("review");
    setError(undefined);
    setFocusedRootGoalId("");
    resetGoalForm();
    resetTaskForm();
  }

  function beginEditGoal(goal: PlanningGoal) {
    setMode("createGoal");
    setFocusedRootGoalId(findRootGoalId(goal, goals));
    setEditingGoalId(goal.id);
    setGoalTitle(goal.title);
    setGoalDescription(goal.description ?? "");
    setGoalCategory(goal.category);
    setGoalStatus(goal.status);
    setParentGoalId(goal.parentGoalId ?? "");
    setGoalPlaceId(goal.placeId ?? "");
    setGoalTargetDate(goal.targetDate ?? "");
    resetTaskForm(goal.id);
  }

  function beginEditTask(task: PlanningTask) {
    setError(undefined);
    if (task.goalId) {
      const goal = goals.find((candidate) => candidate.id === task.goalId);
      if (goal) {
        setMode("createGoal");
        setFocusedRootGoalId(findRootGoalId(goal, goals));
      }
    } else {
      setMode("singleTask");
      setFocusedRootGoalId("");
    }
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskNotes(task.notes ?? "");
    setTaskGoalId(task.goalId ?? "");
    setTaskPeriodId(task.periodId ?? "");
    setTaskPlaceId(task.placeId ?? "");
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate ?? "");
    setTaskResponsiblePerson(task.responsiblePerson ?? "");
    resetGoalForm();
  }

  async function handleSaveGoal() {
    setError(undefined);
    try {
      const effectiveParentGoalId = focusedRootGoalId && !editingGoalId ? parentGoalId || focusedRootGoalId : parentGoalId;
      const savedGoal = await savePlanningGoal(
        {
          farmId: farm.id,
          id: editingGoalId || undefined,
          parentGoalId: effectiveParentGoalId,
          placeId: goalPlaceId,
          title: goalTitle,
          description: goalDescription,
          category: goalCategory,
          status: goalStatus,
          targetDate: goalTargetDate,
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );

      const nextRootGoalId = effectiveParentGoalId ? focusedRootGoalId || findRootGoalId(savedGoal, goals) : savedGoal.id;
      setFocusedRootGoalId(nextRootGoalId);
      resetGoalForm();
      if (!taskGoalId) {
        setTaskGoalId(savedGoal.id);
      }
      await loadPlanning();
    } catch (caught) {
      setError(errorMessage(caught, "Goal could not be saved."));
    }
  }

  async function handleSaveTask() {
    setError(undefined);
    try {
      const goalIdForMode = mode === "singleTask" ? "" : taskGoalId || focusedRootGoalId;
      const placeIdForMode = mode === "createGoal" ? taskPlaceId || defaultTaskPlaceId(goalIdForMode, goals) : taskPlaceId;
      await savePlanningTask(
        {
          farmId: farm.id,
          id: editingTaskId || undefined,
          goalId: goalIdForMode,
          periodId: taskPeriodId,
          placeId: placeIdForMode,
          title: taskTitle,
          notes: taskNotes,
          status: taskStatus,
          priority: taskPriority,
          dueDate: taskDueDate,
          responsiblePerson: taskResponsiblePerson,
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      resetTaskForm(mode === "createGoal" ? goalIdForMode : "");
      setTaskPlaceId(mode === "createGoal" ? placeIdForMode : "");
      await loadPlanning();
    } catch (caught) {
      setError(errorMessage(caught, "Task could not be saved."));
    }
  }

  const { rootGoals, nonGoalTasks } = selectPlanningReviewLists(goals, tasks);
  const { focusedGoals, focusedRootGoal, focusedTasks, parentGoalOptions, taskGoalOptions } = selectFocusedGoalScope(
    focusedRootGoalId,
    goals,
    tasks,
    editingGoalId,
  );
  const placeDisplays = buildFarmPlaceDisplays(locations);
  const allPlaceOptions = toPlaceOptions(placeDisplays, "No place");
  const taskPlaceOptions = placeOptionsForTask(taskGoalId || focusedRootGoalId, goals, locations, placeDisplays);
  const goalPlaceOptions = placeOptionsForGoal(parentGoalId || (focusedRootGoal && !editingGoalId ? focusedRootGoal.id : ""), goals, locations, placeDisplays);
  const creationParentOptions = focusedRootGoal ? parentGoalOptions : [{ label: "No parent goal", value: "" }, ...parentGoalOptions];
  const parentOptionsForForm = !focusedRootGoal || editingGoalId === focusedRootGoal.id
    ? [{ label: "No parent goal", value: "" }, ...parentGoalOptions]
    : creationParentOptions;
  const parentValueForForm = focusedRootGoal && !editingGoalId ? parentGoalId || focusedRootGoal.id : parentGoalId;
  const goalEditForm = editingGoalId ? (
    <View style={styles.inlineEdit}>
      <FormField label="Goal title" onChangeText={setGoalTitle} placeholder="Prepare north field, build wash table, finish certification renewal" value={goalTitle} />
      <FormField label="Description" multiline onChangeText={setGoalDescription} placeholder="Why this matters or what done looks like" value={goalDescription} />
      <SelectField label="Category" onChange={(value) => setGoalCategory(value as PlanningGoalCategory)} options={PLANNING_GOAL_CATEGORIES.map((category) => ({ label: PLANNING_GOAL_CATEGORY_LABELS[category], value: category }))} value={goalCategory} />
      <SelectField label="Status" onChange={(value) => setGoalStatus(value as PlanningGoalStatus)} options={PLANNING_GOAL_STATUSES.map((status) => ({ label: PLANNING_GOAL_STATUS_LABELS[status], value: status }))} value={goalStatus} />
      <SelectField label="Parent goal" onChange={setParentGoalId} options={parentOptionsForForm} value={parentValueForForm} />
      <SearchableSelectField label="Farm place" onChange={setGoalPlaceId} options={goalPlaceOptions} placeholder="Search places" value={goalPlaceId} />
      <DateField label="Target date" onChangeText={setGoalTargetDate} placeholder="YYYY-MM-DD or leave blank" value={goalTargetDate} />
      <Button label="Save goal changes" onPress={handleSaveGoal} size="large" />
      <Button label="Cancel goal edit" onPress={resetGoalForm} size="large" variant="secondary" />
    </View>
  ) : null;
  const taskEditForm = editingTaskId ? (
    <View style={styles.inlineEdit}>
      <FormField label="Task title" onChangeText={setTaskTitle} placeholder="Call certifier, repair gate, seed carrots" value={taskTitle} />
      <FormField label="Notes" multiline onChangeText={setTaskNotes} placeholder="What needs doing?" value={taskNotes} />
      {mode === "createGoal" ? (
        <>
          <SelectField label="Goal" onChange={setTaskGoalId} options={taskGoalOptions} value={taskGoalId || focusedRootGoalId} />
          <SearchableSelectField label="Farm place" onChange={setTaskPlaceId} options={taskPlaceOptions} placeholder="Search places" value={taskPlaceId || defaultTaskPlaceId(taskGoalId || focusedRootGoalId, goals)} />
        </>
      ) : (
        <SearchableSelectField label="Farm place" onChange={setTaskPlaceId} options={allPlaceOptions} placeholder="Search places" value={taskPlaceId} />
      )}
      <TaskFields
        periods={periods}
        taskDueDate={taskDueDate}
        taskPeriodId={taskPeriodId}
        taskPriority={taskPriority}
        taskResponsiblePerson={taskResponsiblePerson}
        taskStatus={taskStatus}
        onDueDateChange={setTaskDueDate}
        onPeriodChange={setTaskPeriodId}
        onPriorityChange={(value) => setTaskPriority(value as PlanningTaskPriority)}
        onResponsiblePersonChange={setTaskResponsiblePerson}
        onStatusChange={(value) => setTaskStatus(value as PlanningTaskStatus)}
      />
      <Button label="Save task changes" onPress={handleSaveTask} size="large" />
      <Button label="Cancel task edit" onPress={() => resetTaskForm(focusedRootGoalId)} size="large" variant="secondary" />
    </View>
  ) : null;

  return (
    <Screen>
      <PageHeader
        eyebrow="Planning"
        supportingText="Turn bigger farm goals into work you can do this day, week, season, or year."
        title="Farm planning"
      />
      <Card>
        <View style={styles.modeActions}>
          <Button label="Create a goal with tasks" onPress={startCreateGoalWithTasks} size="large" variant={mode === "createGoal" ? "primary" : "secondary"} />
          <Button label="Create a single task" onPress={startSingleTask} size="large" variant={mode === "singleTask" ? "primary" : "secondary"} />
          <Button label="Review planned work" onPress={startReview} size="large" variant={mode === "review" ? "primary" : "secondary"} />
        </View>
      </Card>

      {mode === "createGoal" ? (
        <>
          <Card>
            <SectionHeading detail="Build one goal tree at a time. The hierarchy below is the preview." title="Goals and subgoals" />
            {focusedRootGoal ? (
              <GoalBlock
                editingGoalId={editingGoalId}
                editingTaskId={editingTaskId}
                goal={focusedRootGoal}
                goalEditForm={goalEditForm}
                goals={focusedGoals}
                onEditGoal={beginEditGoal}
                onEditTask={beginEditTask}
                taskEditForm={taskEditForm}
                tasks={focusedTasks}
              />
            ) : (
              <EmptyState text="Save a highest-level goal to start this plan." />
            )}
            {!editingGoalId ? (
              <>
                <FormField label={focusedRootGoal ? "Subgoal title" : "Highest-level goal title"} onChangeText={setGoalTitle} placeholder="Prepare north field, build wash table, finish certification renewal" value={goalTitle} />
                <FormField label="Description" multiline onChangeText={setGoalDescription} placeholder="Why this matters or what done looks like" value={goalDescription} />
                <SelectField label="Category" onChange={(value) => setGoalCategory(value as PlanningGoalCategory)} options={PLANNING_GOAL_CATEGORIES.map((category) => ({ label: PLANNING_GOAL_CATEGORY_LABELS[category], value: category }))} value={goalCategory} />
                <SelectField label="Status" onChange={(value) => setGoalStatus(value as PlanningGoalStatus)} options={PLANNING_GOAL_STATUSES.map((status) => ({ label: PLANNING_GOAL_STATUS_LABELS[status], value: status }))} value={goalStatus} />
                <SelectField label="Parent goal" onChange={setParentGoalId} options={creationParentOptions} value={parentValueForForm} />
                <SearchableSelectField label="Farm place" onChange={setGoalPlaceId} options={goalPlaceOptions} placeholder="Search places" value={goalPlaceId} />
                <DateField label="Target date" onChangeText={setGoalTargetDate} placeholder="YYYY-MM-DD or leave blank" value={goalTargetDate} />
                <Button label={focusedRootGoal ? "Save subgoal" : "Save goal"} onPress={handleSaveGoal} size="large" />
              </>
            ) : null}
          </Card>
          <Card>
            <SectionHeading detail="Tasks here can only attach to this goal and its subgoals." title="Tasks" />
            {focusedRootGoal ? (
              <>
                {!editingTaskId ? (
                  <>
                    <FormField label="Task title" onChangeText={setTaskTitle} placeholder="Call certifier, repair gate, seed carrots" value={taskTitle} />
                    <FormField label="Notes" multiline onChangeText={setTaskNotes} placeholder="What needs doing?" value={taskNotes} />
                    <SelectField label="Goal" onChange={setTaskGoalId} options={taskGoalOptions} value={taskGoalId || focusedRootGoal.id} />
                    <SearchableSelectField label="Farm place" onChange={setTaskPlaceId} options={taskPlaceOptions} placeholder="Search places" value={taskPlaceId || defaultTaskPlaceId(taskGoalId || focusedRootGoal.id, goals)} />
                    <TaskFields
                      periods={periods}
                      taskDueDate={taskDueDate}
                      taskPeriodId={taskPeriodId}
                      taskPriority={taskPriority}
                      taskResponsiblePerson={taskResponsiblePerson}
                      taskStatus={taskStatus}
                      onDueDateChange={setTaskDueDate}
                      onPeriodChange={setTaskPeriodId}
                      onPriorityChange={(value) => setTaskPriority(value as PlanningTaskPriority)}
                      onResponsiblePersonChange={setTaskResponsiblePerson}
                      onStatusChange={(value) => setTaskStatus(value as PlanningTaskStatus)}
                    />
                    <Button label="Save task" onPress={handleSaveTask} size="large" />
                  </>
                ) : null}
              </>
            ) : (
              <EmptyState text="Save a highest-level goal before adding tasks." />
            )}
          </Card>
        </>
      ) : null}

      {mode === "singleTask" ? (
        <Card>
          <SectionHeading detail="Create work that does not belong to a goal yet." title="Single task" />
          <FormField label="Task title" onChangeText={setTaskTitle} placeholder="Call certifier, repair gate, seed carrots" value={taskTitle} />
          <FormField label="Notes" multiline onChangeText={setTaskNotes} placeholder="What needs doing?" value={taskNotes} />
          <SearchableSelectField
            label="Farm place"
            onChange={setTaskPlaceId}
            options={allPlaceOptions}
            placeholder="Search places"
            value={taskPlaceId}
          />
          <TaskFields
            periods={periods}
            taskDueDate={taskDueDate}
            taskPeriodId={taskPeriodId}
            taskPriority={taskPriority}
            taskResponsiblePerson={taskResponsiblePerson}
            taskStatus={taskStatus}
            onDueDateChange={setTaskDueDate}
            onPeriodChange={setTaskPeriodId}
            onPriorityChange={(value) => setTaskPriority(value as PlanningTaskPriority)}
            onResponsiblePersonChange={setTaskResponsiblePerson}
            onStatusChange={(value) => setTaskStatus(value as PlanningTaskStatus)}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label={editingTaskId ? "Save task changes" : "Save task"} onPress={handleSaveTask} size="large" />
          {editingTaskId ? <Button label="Cancel task edit" onPress={resetTaskForm} size="large" variant="secondary" /> : null}
        </Card>
      ) : null}

      {mode === "review" ? (
        <>
          <Card>
            <SectionHeading detail="See planned work by status and record farm events from task cards." title="Work boards" />
            <Button label="Open farm work boards" onPress={() => pushRoute(router, "/planning/boards")} size="large" />
          </Card>
          <Card>
            <SectionHeading title="Goals" />
            {rootGoals.length ? rootGoals.map((goal) => (
              <ReviewRow
                detail={`${PLANNING_GOAL_STATUS_LABELS[goal.status]}${goal.targetDate ? ` - target ${goal.targetDate}` : ""}`}
                key={goal.id}
                onPress={() => beginEditGoal(goal)}
                title={goal.title}
              />
            )) : <EmptyState text="No goals yet." />}
          </Card>
          <Card>
            <SectionHeading title="Non-goal tasks" />
            {nonGoalTasks.length ? nonGoalTasks.map((task) => (
              <ReviewRow
                detail={`${PLANNING_TASK_STATUS_LABELS[task.status]} - ${PLANNING_TASK_PRIORITY_LABELS[task.priority]}${task.dueDate ? ` - due ${task.dueDate}` : ""}`}
                key={task.id}
                onPress={() => beginEditTask(task)}
                title={task.title}
              />
            )) : <EmptyState text="No non-goal tasks yet." />}
          </Card>
        </>
      ) : null}

      {mode !== "singleTask" && error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

function TaskFields({
  periods,
  taskDueDate,
  taskPeriodId,
  taskPriority,
  taskResponsiblePerson,
  taskStatus,
  onDueDateChange,
  onPeriodChange,
  onPriorityChange,
  onResponsiblePersonChange,
  onStatusChange,
}: {
  periods: PlanningPeriod[];
  taskDueDate: string;
  taskPeriodId: string;
  taskPriority: PlanningTaskPriority;
  taskResponsiblePerson: string;
  taskStatus: PlanningTaskStatus;
  onDueDateChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onResponsiblePersonChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  return (
    <>
      <SelectField label="Planning period" onChange={onPeriodChange} options={[{ label: "No period", value: "" }, ...periods.map((period) => ({ label: period.label, value: period.id }))]} value={taskPeriodId} />
      <SelectField label="Status" onChange={onStatusChange} options={PLANNING_TASK_STATUSES.map((status) => ({ label: PLANNING_TASK_STATUS_LABELS[status], value: status }))} value={taskStatus} />
      <SelectField label="Priority" onChange={onPriorityChange} options={PLANNING_TASK_PRIORITIES.map((priority) => ({ label: PLANNING_TASK_PRIORITY_LABELS[priority], value: priority }))} value={taskPriority} />
      <DateField label="Due date" onChangeText={onDueDateChange} placeholder="YYYY-MM-DD or leave blank" value={taskDueDate} />
      <FormField label="Responsible person" onChangeText={onResponsiblePersonChange} placeholder="Optional local name" value={taskResponsiblePerson} />
    </>
  );
}

function GoalBlock({
  editingGoalId,
  editingTaskId,
  goal,
  goalEditForm,
  goals,
  depth = 0,
  visitedGoalIds = new Set<string>(),
  taskEditForm,
  tasks,
  onEditGoal,
  onEditTask,
}: {
  editingGoalId: string;
  editingTaskId: string;
  goal: PlanningGoal;
  goalEditForm: ReactNode;
  goals: PlanningGoal[];
  depth?: number;
  visitedGoalIds?: Set<string>;
  taskEditForm: ReactNode;
  tasks: PlanningTask[];
  onEditGoal: (goal: PlanningGoal) => void;
  onEditTask: (task: PlanningTask) => void;
}) {
  if (visitedGoalIds.has(goal.id)) {
    return null;
  }
  const nextVisitedGoalIds = new Set(visitedGoalIds);
  nextVisitedGoalIds.add(goal.id);
  const children = goals.filter((candidate) => candidate.parentGoalId === goal.id);
  const goalTasks = tasks.filter((task) => task.goalId === goal.id);

  return (
    <View style={[styles.goalBlock, depth > 0 ? styles.nestedGoalBlock : null]}>
      {editingGoalId === goal.id ? goalEditForm : (
        <>
          <Text style={styles.title}>{goal.title}</Text>
          <Text style={styles.detail}>
            {PLANNING_GOAL_STATUS_LABELS[goal.status]} - {PLANNING_GOAL_CATEGORY_LABELS[goal.category]}
            {goal.targetDate ? ` - target ${goal.targetDate}` : ""}
          </Text>
          {children.length === 0 && goalTasks.length === 0 ? (
            <Text style={styles.warning}>Leaf goals should have at least one task.</Text>
          ) : null}
          <Button label={depth > 0 ? "Edit subgoal" : "Edit goal"} onPress={() => onEditGoal(goal)} size="large" variant="secondary" />
        </>
      )}
      {children.map((child) => (
        <GoalBlock
          depth={depth + 1}
          editingGoalId={editingGoalId}
          editingTaskId={editingTaskId}
          goal={child}
          goalEditForm={goalEditForm}
          goals={goals}
          key={child.id}
          onEditGoal={onEditGoal}
          onEditTask={onEditTask}
          taskEditForm={taskEditForm}
          tasks={tasks}
          visitedGoalIds={nextVisitedGoalIds}
        />
      ))}
      {goalTasks.map((task) => (
        <TaskRow
          editForm={editingTaskId === task.id ? taskEditForm : null}
          key={task.id}
          task={task}
          onEdit={() => onEditTask(task)}
        />
      ))}
    </View>
  );
}

function TaskRow({ editForm, task, onEdit }: { editForm: ReactNode; task: PlanningTask; onEdit: () => void }) {
  if (editForm) {
    return <View style={styles.taskRow}>{editForm}</View>;
  }

  return (
    <View style={styles.taskRow}>
      <View style={styles.textBlock}>
        <Text style={styles.body}>{task.title}</Text>
        <Text style={styles.detail}>
          {PLANNING_TASK_STATUS_LABELS[task.status]} - {PLANNING_TASK_PRIORITY_LABELS[task.priority]}
          {task.dueDate ? ` - due ${task.dueDate}` : ""}
          {task.responsiblePerson ? ` - ${task.responsiblePerson}` : ""}
        </Text>
      </View>
      <Button label="Edit task" onPress={onEdit} size="large" variant="secondary" />
    </View>
  );
}

function ReviewRow({ detail, onPress, title }: { detail: string; onPress: () => void; title: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.reviewRow}>
      <Text style={styles.body}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </Pressable>
  );
}

function toPlaceOptions(displays: FarmPlaceDisplay[], noPlaceLabel?: string): SearchableSelectOption[] {
  return [
    ...(noPlaceLabel ? [{ label: noPlaceLabel, value: "" }] : []),
    ...displays.map((display) => ({
      detail: display.typeLabel,
      label: display.path,
      value: display.place.id,
    })),
  ];
}

function placeOptionsForGoal(
  parentGoalId: string,
  goals: PlanningGoal[],
  locations: FarmLocation[],
  displays: FarmPlaceDisplay[],
): SearchableSelectOption[] {
  const parentGoal = goals.find((goal) => goal.id === parentGoalId);
  const parentPlaceId = parentGoal?.placeId;
  if (!parentPlaceId) {
    return toPlaceOptions(displays, "No place");
  }

  return toPlaceOptions(displays.filter((display) => isPlaceAtOrInside(display.place.id, parentPlaceId, locations)));
}

function placeOptionsForTask(
  goalId: string,
  goals: PlanningGoal[],
  locations: FarmLocation[],
  displays: FarmPlaceDisplay[],
): SearchableSelectOption[] {
  const goal = goals.find((candidate) => candidate.id === goalId);
  const goalPlaceId = goal?.placeId;
  if (!goalPlaceId) {
    return toPlaceOptions(displays, "No place");
  }

  return toPlaceOptions(displays.filter((display) => isPlaceAtOrInside(display.place.id, goalPlaceId, locations)));
}

function defaultTaskPlaceId(goalId: string, goals: PlanningGoal[]): string {
  return goals.find((goal) => goal.id === goalId)?.placeId ?? "";
}

function isPlaceAtOrInside(candidatePlaceId: string, rootPlaceId: string, locations: FarmLocation[]): boolean {
  if (candidatePlaceId === rootPlaceId) {
    return true;
  }

  let cursor = locations.find((location) => location.id === candidatePlaceId);
  const visited = new Set<string>();
  while (cursor?.parentId && !visited.has(cursor.id)) {
    visited.add(cursor.id);
    if (cursor.parentId === rootPlaceId) {
      return true;
    }
    cursor = locations.find((location) => location.id === cursor?.parentId);
  }

  return false;
}

const styles = StyleSheet.create({
  body: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  detail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  goalBlock: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  inlineEdit: {
    gap: theme.spacing.sm,
  },
  modeActions: {
    gap: theme.spacing.sm,
  },
  nestedGoalBlock: {
    backgroundColor: theme.colors.surfaceMuted,
    marginLeft: theme.spacing.sm,
  },
  reviewRow: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xs,
    justifyContent: "center",
    minHeight: theme.spacing.primaryTouchTarget,
    padding: theme.spacing.md,
  },
  taskRow: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  textBlock: {
    gap: 2,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.section,
    fontWeight: "800",
    lineHeight: 26,
  },
  warning: {
    color: theme.colors.warning,
    fontSize: theme.typography.small,
    fontWeight: "700",
    lineHeight: 20,
  },
});
