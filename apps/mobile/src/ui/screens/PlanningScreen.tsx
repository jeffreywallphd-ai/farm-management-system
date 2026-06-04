import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { z } from "zod";

import type { FarmhandRepository } from "../../application/ports/FarmhandRepository";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import { getPlanningOverview } from "../../application/use-cases/manage-planning/ListPlanning";
import { savePlanningGoal, savePlanningTask } from "../../application/use-cases/manage-planning/ManagePlanning";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { Farmhand } from "../../domain/farmhand/Farmhand";
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
  type PlanningTask,
  type PlanningTaskInstructionPhoto,
  type PlanningTaskInstructionVoiceMemo,
  type PlanningTaskPriority,
  type PlanningTaskStatus,
} from "../../domain/planning/Planning";
import { ExpoPhotoAttachmentStorageRepository } from "../../infrastructure/media/ExpoPhotoAttachmentStorageRepository";
import { ExpoVoiceMemoStorageRepository } from "../../infrastructure/media/ExpoVoiceMemoStorageRepository";
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
  getPlanningEditScrollY,
  selectFocusedGoalScope,
  selectPlanningReviewLists,
  type PlanningMode,
} from "./PlanningScreenModel";

interface TaskInstructionVoiceMemoDraft extends PlanningTaskInstructionVoiceMemo {
  isPersisted: boolean;
}

interface TaskInstructionPhotoDraft extends PlanningTaskInstructionPhoto {
  originalFileName?: string;
  isPersisted: boolean;
}

export function PlanningScreen({
  farm,
  farmhandRepository,
  farmhands,
  locations,
  repository,
}: {
  farm: Farm;
  farmhandRepository?: FarmhandRepository;
  farmhands: Farmhand[];
  locations: FarmLocation[];
  repository: PlanningRepository;
}) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollContentRef = useRef<View | null>(null);
  const taskRowRefs = useRef<Record<string, View | null>>({});
  const [mode, setMode] = useState<PlanningMode>("review");
  const [goals, setGoals] = useState<PlanningGoal[]>([]);
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
  const [taskPlaceId, setTaskPlaceId] = useState("");
  const [taskStatus, setTaskStatus] = useState<PlanningTaskStatus>("notStarted");
  const [taskPriority, setTaskPriority] = useState<PlanningTaskPriority>("normal");
  const [taskPlannedStartDate, setTaskPlannedStartDate] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssignedFarmhandId, setTaskAssignedFarmhandId] = useState("");
  const [taskInstructionVoiceMemo, setTaskInstructionVoiceMemo] = useState<TaskInstructionVoiceMemoDraft | undefined>();
  const [taskInstructionPhotos, setTaskInstructionPhotos] = useState<TaskInstructionPhotoDraft[]>([]);
  const [pendingScrollTaskId, setPendingScrollTaskId] = useState("");
  const [taskEditReturnGoalId, setTaskEditReturnGoalId] = useState("");
  const photoAttachmentStorageRepository = useMemo(() => new ExpoPhotoAttachmentStorageRepository(), []);
  const voiceMemoStorageRepository = useMemo(() => new ExpoVoiceMemoStorageRepository(), []);

  async function loadPlanning() {
    const overview = await getPlanningOverview({ farmId: farm.id }, { repository });
    setGoals(overview.goals);
    setTasks(overview.tasks);
  }

  useEffect(() => {
    loadPlanning().catch(() => setError("Planning records could not be loaded from this device."));
  }, [farm.id, repository]);

  useEffect(() => {
    if (!pendingScrollTaskId || editingTaskId !== pendingScrollTaskId) {
      return undefined;
    }

    const timeout = setTimeout(() => scrollTaskRowToTop(pendingScrollTaskId), 80);
    return () => clearTimeout(timeout);
  }, [editingTaskId, pendingScrollTaskId]);

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
    setTaskPlaceId("");
    setTaskStatus("notStarted");
    setTaskPriority("normal");
    setTaskPlannedStartDate("");
    setTaskDueDate("");
    setTaskAssignedFarmhandId("");
    setTaskInstructionVoiceMemo(undefined);
    setTaskInstructionPhotos([]);
    setPendingScrollTaskId("");
    setTaskEditReturnGoalId("");
  }

  function restoreGoalEdit(goalId: string, nextMode: PlanningMode) {
    const goal = goals.find((candidate) => candidate.id === goalId);
    if (!goal) return;
    beginEditGoal(goal, nextMode);
  }

  function cancelTaskEdit(nextGoalId = "") {
    const returnGoalId = taskEditReturnGoalId;
    const returnMode = mode;
    resetTaskForm(nextGoalId);
    if (returnGoalId) {
      restoreGoalEdit(returnGoalId, returnMode);
    }
  }

  function scrollTaskRowToTop(taskId: string) {
    const taskRow = taskRowRefs.current[taskId];
    const scrollContent = scrollContentRef.current;
    const scrollView = scrollViewRef.current;
    if (!taskRow || !scrollContent || !scrollView) return;

    taskRow.measureLayout(
      scrollContent,
      (_x, y) => {
        scrollView.scrollTo({ animated: true, y: getPlanningEditScrollY(y, theme.spacing.sm) });
      },
      () => undefined,
    );
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

  function beginEditGoal(goal: PlanningGoal, nextMode: PlanningMode = "createGoal") {
    setMode(nextMode);
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

  function beginEditTask(task: PlanningTask, preserveMode = false) {
    setError(undefined);
    setTaskEditReturnGoalId(preserveMode && editingGoalId ? editingGoalId : "");
    if (preserveMode) {
      setFocusedRootGoalId(task.goalId ? findRootGoalId(goals.find((candidate) => candidate.id === task.goalId) ?? { ...task, category: "general", source: "farmer", sortOrder: 0 } as unknown as PlanningGoal, goals) : "");
    } else if (task.goalId) {
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
    setTaskPlaceId(task.placeId ?? "");
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskPlannedStartDate(task.plannedStartDate ?? "");
    setTaskDueDate(task.dueDate ?? "");
    setTaskAssignedFarmhandId(task.assignedFarmhandId ?? "");
    setTaskInstructionVoiceMemo(task.instructionVoiceMemo ? { ...task.instructionVoiceMemo, isPersisted: true } : undefined);
    setTaskInstructionPhotos((task.instructionPhotos ?? []).map((photo) => ({ ...photo, isPersisted: true })));
    setPendingScrollTaskId(task.id);
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
      const isGoalScopedTaskSave = mode === "createGoal" || Boolean(mode === "review" && focusedRootGoalId && taskGoalId);
      const goalIdForMode = mode === "singleTask" ? "" : isGoalScopedTaskSave ? taskGoalId || focusedRootGoalId : "";
      const placeIdForMode = isGoalScopedTaskSave ? taskPlaceId || defaultTaskPlaceId(goalIdForMode, goals) : taskPlaceId;
      const instructionVoiceMemo = await persistTaskInstructionVoiceMemo(taskInstructionVoiceMemo, voiceMemoStorageRepository);
      const instructionPhotos = await persistTaskInstructionPhotos(taskInstructionPhotos, photoAttachmentStorageRepository);
      await savePlanningTask(
        {
          farmId: farm.id,
          id: editingTaskId || undefined,
          goalId: goalIdForMode,
          placeId: placeIdForMode,
          title: taskTitle,
          notes: taskNotes,
          status: taskStatus,
          priority: taskPriority,
          plannedStartDate: taskPlannedStartDate,
          dueDate: taskDueDate,
          assignedFarmhandId: taskAssignedFarmhandId,
          instructionVoiceMemo,
          instructionPhotos,
        },
        { clock: systemClock, farmhandRepository, idGenerator: localIdGenerator, repository },
      );
      resetTaskForm(isGoalScopedTaskSave ? goalIdForMode : "");
      setTaskPlaceId(isGoalScopedTaskSave ? placeIdForMode : "");
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
  const isGoalScopedTaskForm = mode === "createGoal" || Boolean(mode === "review" && focusedRootGoalId && taskGoalId);
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
    </View>
  ) : null;
  const taskEditForm = editingTaskId ? (
    <View style={styles.inlineEdit}>
      <FormField label="Task title" onChangeText={setTaskTitle} placeholder="Call certifier, repair gate, seed carrots" value={taskTitle} />
      <FormField label="Notes" multiline onChangeText={setTaskNotes} placeholder="What needs doing?" value={taskNotes} />
      {isGoalScopedTaskForm ? (
        <>
          <SelectField label="Goal" onChange={setTaskGoalId} options={taskGoalOptions} value={taskGoalId || focusedRootGoalId} />
          <SearchableSelectField label="Farm place" onChange={setTaskPlaceId} options={taskPlaceOptions} placeholder="Search places" value={taskPlaceId || defaultTaskPlaceId(taskGoalId || focusedRootGoalId, goals)} />
        </>
      ) : (
        <SearchableSelectField label="Farm place" onChange={setTaskPlaceId} options={allPlaceOptions} placeholder="Search places" value={taskPlaceId} />
      )}
      <TaskFields
        farmhands={farmhands}
        onAssignedFarmhandChange={setTaskAssignedFarmhandId}
        taskAssignedFarmhandId={taskAssignedFarmhandId}
        taskDueDate={taskDueDate}
        taskPlannedStartDate={taskPlannedStartDate}
        taskPriority={taskPriority}
        taskStatus={taskStatus}
        onDueDateChange={setTaskDueDate}
        onPlannedStartDateChange={setTaskPlannedStartDate}
        onPriorityChange={(value) => setTaskPriority(value as PlanningTaskPriority)}
        onStatusChange={(value) => setTaskStatus(value as PlanningTaskStatus)}
      />
      <TaskInstructionMediaFields
        error={error}
        photos={taskInstructionPhotos}
        voiceMemo={taskInstructionVoiceMemo}
        onError={setError}
        onPhotosChange={setTaskInstructionPhotos}
        onVoiceMemoChange={setTaskInstructionVoiceMemo}
      />
      <Button label="Save task changes" onPress={handleSaveTask} size="large" />
    </View>
  ) : null;

  return (
    <Screen contentRef={scrollContentRef} scrollViewRef={scrollViewRef}>
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
                farmhands={farmhands}
                goal={focusedRootGoal}
                goalEditForm={goalEditForm}
                goals={focusedGoals}
                onEditGoal={beginEditGoal}
                onEditTask={beginEditTask}
                onCancelGoalEdit={resetGoalForm}
                onCancelTaskEdit={() => cancelTaskEdit(focusedRootGoalId)}
                onTaskRowRef={(taskId, node) => {
                  taskRowRefs.current[taskId] = node;
                }}
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
                      farmhands={farmhands}
                      onAssignedFarmhandChange={setTaskAssignedFarmhandId}
                      taskAssignedFarmhandId={taskAssignedFarmhandId}
                      taskDueDate={taskDueDate}
                      taskPlannedStartDate={taskPlannedStartDate}
                      taskPriority={taskPriority}
                      taskStatus={taskStatus}
                      onDueDateChange={setTaskDueDate}
                      onPlannedStartDateChange={setTaskPlannedStartDate}
                      onPriorityChange={(value) => setTaskPriority(value as PlanningTaskPriority)}
                      onStatusChange={(value) => setTaskStatus(value as PlanningTaskStatus)}
                    />
                    <TaskInstructionMediaFields
                      error={error}
                      photos={taskInstructionPhotos}
                      voiceMemo={taskInstructionVoiceMemo}
                      onError={setError}
                      onPhotosChange={setTaskInstructionPhotos}
                      onVoiceMemoChange={setTaskInstructionVoiceMemo}
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
            farmhands={farmhands}
            onAssignedFarmhandChange={setTaskAssignedFarmhandId}
            taskAssignedFarmhandId={taskAssignedFarmhandId}
            taskDueDate={taskDueDate}
            taskPlannedStartDate={taskPlannedStartDate}
            taskPriority={taskPriority}
            taskStatus={taskStatus}
            onDueDateChange={setTaskDueDate}
            onPlannedStartDateChange={setTaskPlannedStartDate}
            onPriorityChange={(value) => setTaskPriority(value as PlanningTaskPriority)}
            onStatusChange={(value) => setTaskStatus(value as PlanningTaskStatus)}
          />
          <TaskInstructionMediaFields
            error={error}
            photos={taskInstructionPhotos}
            voiceMemo={taskInstructionVoiceMemo}
            onError={setError}
            onPhotosChange={setTaskInstructionPhotos}
            onVoiceMemoChange={setTaskInstructionVoiceMemo}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label={editingTaskId ? "Save task changes" : "Save task"} onPress={handleSaveTask} size="large" />
          {editingTaskId ? <Button label="Cancel edit" onPress={() => cancelTaskEdit()} size="large" variant="secondary" /> : null}
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
            {rootGoals.length ? rootGoals.map((goal) => {
              const isFocusedGoalTree = focusedRootGoalId === goal.id && Boolean(editingGoalId || editingTaskId);
              const isEditingRootGoal = editingGoalId === goal.id;
              return (
                <ReviewRow
                  detail={`${PLANNING_GOAL_STATUS_LABELS[goal.status]}${goal.targetDate ? ` - target ${goal.targetDate}` : ""}`}
                  editForm={isFocusedGoalTree ? (
                    <View style={styles.reviewEditScope}>
                      {isEditingRootGoal ? goalEditForm : null}
                      <GoalChildrenAndTasks
                        editingGoalId={editingGoalId}
                        editingTaskId={editingTaskId}
                        farmhands={farmhands}
                        goal={goal}
                        goalEditForm={goalEditForm}
                        goals={focusedGoals}
                        onEditGoal={(selectedGoal) => beginEditGoal(selectedGoal, "review")}
                        onEditTask={(selectedTask) => beginEditTask(selectedTask, true)}
                        onCancelGoalEdit={resetGoalForm}
                        onCancelTaskEdit={() => cancelTaskEdit(focusedRootGoalId)}
                        taskEditForm={taskEditForm}
                        tasks={focusedTasks}
                        onTaskRowRef={(taskId, node) => {
                          taskRowRefs.current[taskId] = node;
                        }}
                      />
                    </View>
                  ) : null}
                  editLabel={isEditingRootGoal ? "Cancel edit" : "Edit goal"}
                  key={goal.id}
                  onEdit={() => isEditingRootGoal ? resetGoalForm() : beginEditGoal(goal, "review")}
                  title={goal.title}
                />
              );
            }) : <EmptyState text="No goals yet." />}
          </Card>
          <Card>
            <SectionHeading title="Non-goal tasks" />
            {nonGoalTasks.length ? nonGoalTasks.map((task) => {
              const isEditingThisTask = editingTaskId === task.id;
              return (
                <ReviewRow
                  detail={`${PLANNING_TASK_STATUS_LABELS[task.status]} - ${PLANNING_TASK_PRIORITY_LABELS[task.priority]}${task.dueDate ? ` - due ${task.dueDate}` : ""}${task.assignedFarmhandId ? ` - ${farmhandName(task.assignedFarmhandId, farmhands)}` : ""}`}
                  editForm={isEditingThisTask ? taskEditForm : null}
                  editLabel={isEditingThisTask ? "Cancel edit" : "Edit task"}
                  key={task.id}
                  onEdit={() => isEditingThisTask ? cancelTaskEdit() : beginEditTask(task, true)}
                  rowRef={(node) => {
                    taskRowRefs.current[task.id] = node;
                  }}
                  title={task.title}
                />
              );
            }) : <EmptyState text="No non-goal tasks yet." />}
          </Card>
        </>
      ) : null}

      {mode !== "singleTask" && error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

function TaskFields({
  farmhands,
  onAssignedFarmhandChange,
  taskAssignedFarmhandId,
  taskDueDate,
  taskPlannedStartDate,
  taskPriority,
  taskStatus,
  onDueDateChange,
  onPlannedStartDateChange,
  onPriorityChange,
  onStatusChange,
}: {
  farmhands: Farmhand[];
  onAssignedFarmhandChange: (value: string) => void;
  taskAssignedFarmhandId: string;
  taskDueDate: string;
  taskPlannedStartDate: string;
  taskPriority: PlanningTaskPriority;
  taskStatus: PlanningTaskStatus;
  onDueDateChange: (value: string) => void;
  onPlannedStartDateChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  return (
    <>
      <SelectField label="Status" onChange={onStatusChange} options={PLANNING_TASK_STATUSES.map((status) => ({ label: PLANNING_TASK_STATUS_LABELS[status], value: status }))} value={taskStatus} />
      <SelectField label="Priority" onChange={onPriorityChange} options={PLANNING_TASK_PRIORITIES.map((priority) => ({ label: PLANNING_TASK_PRIORITY_LABELS[priority], value: priority }))} value={taskPriority} />
      <DateField label="Desired start date" onChangeText={onPlannedStartDateChange} placeholder="YYYY-MM-DD or leave blank" value={taskPlannedStartDate} />
      <DateField label="Due date" onChangeText={onDueDateChange} placeholder="YYYY-MM-DD or leave blank" value={taskDueDate} />
      <SelectField
        label="Assigned farmhand"
        onChange={onAssignedFarmhandChange}
        options={[
          { label: "No assigned farmhand", value: "" },
          ...farmhands.map((farmhand) => ({
            label: farmhand.status === "inactive" ? `${farmhand.name} (inactive)` : farmhand.name,
            value: farmhand.id,
          })),
        ]}
        value={taskAssignedFarmhandId}
      />
    </>
  );
}

function TaskInstructionMediaFields({
  error,
  photos,
  voiceMemo,
  onError,
  onPhotosChange,
  onVoiceMemoChange,
}: {
  error?: string;
  photos: TaskInstructionPhotoDraft[];
  voiceMemo?: TaskInstructionVoiceMemoDraft;
  onError: (message: string | undefined) => void;
  onPhotosChange: (photos: TaskInstructionPhotoDraft[]) => void;
  onVoiceMemoChange: (voiceMemo: TaskInstructionVoiceMemoDraft | undefined) => void;
}) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(voiceMemo?.localUri);
  const playerStatus = useAudioPlayerStatus(player);

  async function handleStartRecording() {
    onError(undefined);
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      onError("Microphone permission is needed to record task instructions.");
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function handleStopRecording() {
    await recorder.stop();
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    });

    if (!recorder.uri) {
      onError("The task instruction recording could not be saved. Try recording again.");
      return;
    }

    onVoiceMemoChange({
      localUri: recorder.uri,
      durationMs: recorderState.durationMillis,
      isPersisted: false,
    });
  }

  function handlePlayPause() {
    if (!voiceMemo) return;
    if (playerStatus.playing) {
      player.pause();
      return;
    }

    player.seekTo(0);
    player.play();
  }

  async function handleTakePhoto() {
    onError(undefined);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      onError("Camera permission is needed to add an instruction photo.");
      return;
    }

    addPickedPhotos(await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 }));
  }

  async function handleChoosePhotos() {
    onError(undefined);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      onError("Photo permission is needed to add instruction photos.");
      return;
    }

    addPickedPhotos(await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, mediaTypes: ["images"], quality: 0.8 }));
  }

  function addPickedPhotos(result: ImagePicker.ImagePickerResult) {
    if (result.canceled) return;
    onPhotosChange([
      ...photos,
      ...result.assets.map((asset) => ({
        localUri: asset.uri,
        originalFileName: asset.fileName ?? undefined,
        width: asset.width,
        height: asset.height,
        mimeType: asset.mimeType,
        isPersisted: false,
      })),
    ]);
  }

  return (
    <View style={styles.mediaBlock}>
      <SectionHeading detail="Optional voice or photo instructions stay on this device and appear on the task board." title="Task instructions" />
      {recorderState.isRecording ? (
        <Button label="Stop recording instructions" onPress={handleStopRecording} size="large" />
      ) : (
        <Button label={voiceMemo ? "Record new instructions" : "Record instructions"} onPress={handleStartRecording} size="large" variant="secondary" />
      )}
      {voiceMemo ? (
        <View style={styles.mediaActions}>
          <Button label={playerStatus.playing ? "Pause instructions" : "Play instructions"} onPress={handlePlayPause} size="large" variant="secondary" />
          <Button label="Remove recording" onPress={() => onVoiceMemoChange(undefined)} size="large" variant="secondary" />
        </View>
      ) : null}
      <View style={styles.mediaActions}>
        <Button label="Take instruction photo" onPress={handleTakePhoto} size="large" variant="secondary" />
        <Button label="Choose instruction photos" onPress={handleChoosePhotos} size="large" variant="secondary" />
      </View>
      {photos.length ? (
        <View style={styles.photoGrid}>
          {photos.map((photo) => (
            <View key={photo.localUri} style={styles.photoTile}>
              <Image source={{ uri: photo.localUri }} style={styles.photoPreview} />
              <Button label="Remove photo" onPress={() => onPhotosChange(photos.filter((candidate) => candidate.localUri !== photo.localUri))} size="large" variant="secondary" />
            </View>
          ))}
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function GoalBlock({
  editingGoalId,
  editingTaskId,
  farmhands,
  goal,
  goalEditForm,
  goals,
  depth = 0,
  visitedGoalIds = new Set<string>(),
  taskEditForm,
  tasks,
  onEditGoal,
  onEditTask,
  onCancelGoalEdit,
  onCancelTaskEdit,
  onTaskRowRef,
}: {
  editingGoalId: string;
  editingTaskId: string;
  farmhands: Farmhand[];
  goal: PlanningGoal;
  goalEditForm: ReactNode;
  goals: PlanningGoal[];
  depth?: number;
  visitedGoalIds?: Set<string>;
  taskEditForm: ReactNode;
  tasks: PlanningTask[];
  onEditGoal: (goal: PlanningGoal) => void;
  onEditTask: (task: PlanningTask) => void;
  onCancelGoalEdit: () => void;
  onCancelTaskEdit: () => void;
  onTaskRowRef: (taskId: string, node: View | null) => void;
}) {
  if (visitedGoalIds.has(goal.id)) {
    return null;
  }
  const nextVisitedGoalIds = new Set(visitedGoalIds);
  nextVisitedGoalIds.add(goal.id);
  const children = goals.filter((candidate) => candidate.parentGoalId === goal.id);
  const goalTasks = tasks.filter((task) => task.goalId === goal.id);
  const isEditingThisGoal = editingGoalId === goal.id;

  return (
    <View style={[styles.goalBlock, depth > 0 ? styles.nestedGoalBlock : null]}>
      {!isEditingThisGoal ? (
        <>
          <Text style={styles.title}>{goal.title}</Text>
          <Text style={styles.detail}>
            {PLANNING_GOAL_STATUS_LABELS[goal.status]} - {PLANNING_GOAL_CATEGORY_LABELS[goal.category]}
            {goal.targetDate ? ` - target ${goal.targetDate}` : ""}
          </Text>
        </>
      ) : null}
      {children.length === 0 && goalTasks.length === 0 ? (
        <Text style={styles.warning}>Leaf goals should have at least one task.</Text>
      ) : null}
      <Button
        label={isEditingThisGoal ? "Cancel edit" : depth > 0 ? "Edit subgoal" : "Edit goal"}
        onPress={() => isEditingThisGoal ? onCancelGoalEdit() : onEditGoal(goal)}
        size="large"
        variant="secondary"
      />
      {isEditingThisGoal ? goalEditForm : null}
      <GoalChildrenAndTasks
        depth={depth}
        editingGoalId={editingGoalId}
        editingTaskId={editingTaskId}
        farmhands={farmhands}
        goal={goal}
        goalEditForm={goalEditForm}
        goals={goals}
        onCancelGoalEdit={onCancelGoalEdit}
        onCancelTaskEdit={onCancelTaskEdit}
        onEditGoal={onEditGoal}
        onEditTask={onEditTask}
        onTaskRowRef={onTaskRowRef}
        taskEditForm={taskEditForm}
        tasks={tasks}
        visitedGoalIds={nextVisitedGoalIds}
      />
    </View>
  );
}

function GoalChildrenAndTasks({
  editingGoalId,
  editingTaskId,
  farmhands,
  goal,
  goalEditForm,
  goals,
  depth = 0,
  visitedGoalIds = new Set<string>(),
  taskEditForm,
  tasks,
  onEditGoal,
  onEditTask,
  onCancelGoalEdit,
  onCancelTaskEdit,
  onTaskRowRef,
}: {
  editingGoalId: string;
  editingTaskId: string;
  farmhands: Farmhand[];
  goal: PlanningGoal;
  goalEditForm: ReactNode;
  goals: PlanningGoal[];
  depth?: number;
  visitedGoalIds?: Set<string>;
  taskEditForm: ReactNode;
  tasks: PlanningTask[];
  onEditGoal: (goal: PlanningGoal) => void;
  onEditTask: (task: PlanningTask) => void;
  onCancelGoalEdit: () => void;
  onCancelTaskEdit: () => void;
  onTaskRowRef: (taskId: string, node: View | null) => void;
}) {
  const children = goals.filter((candidate) => candidate.parentGoalId === goal.id);
  const goalTasks = tasks.filter((task) => task.goalId === goal.id);

  return (
    <>
      {children.length ? <Text style={styles.subheading}>Subgoals</Text> : null}
      {children.map((child) => (
        <GoalBlock
          depth={depth + 1}
          editingGoalId={editingGoalId}
          editingTaskId={editingTaskId}
          farmhands={farmhands}
          goal={child}
          goalEditForm={goalEditForm}
          goals={goals}
          key={child.id}
          onCancelGoalEdit={onCancelGoalEdit}
          onCancelTaskEdit={onCancelTaskEdit}
          onEditGoal={onEditGoal}
          onEditTask={onEditTask}
          onTaskRowRef={onTaskRowRef}
          taskEditForm={taskEditForm}
          tasks={tasks}
          visitedGoalIds={visitedGoalIds}
        />
      ))}
      {goalTasks.length ? <Text style={styles.subheading}>Goal Tasks</Text> : null}
      {goalTasks.map((task) => {
        const isEditingThisTask = editingTaskId === task.id;
        return (
          <TaskRow
            editForm={isEditingThisTask ? taskEditForm : null}
            farmhands={farmhands}
            isEditing={isEditingThisTask}
            key={task.id}
            onEdit={() => isEditingThisTask ? onCancelTaskEdit() : onEditTask(task)}
            rowRef={(node) => onTaskRowRef(task.id, node)}
            task={task}
          />
        );
      })}
    </>
  );
}

function TaskRow({
  editForm,
  farmhands,
  isEditing,
  rowRef,
  task,
  onEdit,
}: {
  editForm: ReactNode;
  farmhands: Farmhand[];
  isEditing: boolean;
  rowRef?: (node: View | null) => void;
  task: PlanningTask;
  onEdit: () => void;
}) {
  return (
    <View collapsable={false} ref={rowRef} style={styles.taskRow}>
      <View style={styles.textBlock}>
        <Text style={styles.body}>{task.title}</Text>
        <Text style={styles.detail}>
          {PLANNING_TASK_STATUS_LABELS[task.status]} - {PLANNING_TASK_PRIORITY_LABELS[task.priority]}
          {task.plannedStartDate ? ` - start ${task.plannedStartDate}` : ""}
          {task.dueDate ? ` - due ${task.dueDate}` : ""}
          {task.assignedFarmhandId ? ` - ${farmhandName(task.assignedFarmhandId, farmhands)}` : ""}
        </Text>
      </View>
      <Button label={isEditing ? "Cancel edit" : "Edit task"} onPress={onEdit} size="large" variant="secondary" />
      {editForm}
    </View>
  );
}

function ReviewRow({
  detail,
  editForm,
  editLabel,
  onEdit,
  rowRef,
  title,
}: {
  detail: string;
  editForm: ReactNode;
  editLabel: string;
  onEdit: () => void;
  rowRef?: (node: View | null) => void;
  title: string;
}) {
  return (
    <View collapsable={false} ref={rowRef} style={styles.reviewRow}>
      <Text style={styles.body}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
      <Button label={editLabel} onPress={onEdit} size="large" variant="secondary" />
      {editForm}
    </View>
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

async function persistTaskInstructionVoiceMemo(
  voiceMemo: TaskInstructionVoiceMemoDraft | undefined,
  repository: ExpoVoiceMemoStorageRepository,
): Promise<PlanningTaskInstructionVoiceMemo | undefined> {
  if (!voiceMemo) return undefined;
  if (voiceMemo.isPersisted) {
    return {
      localUri: voiceMemo.localUri,
      durationMs: voiceMemo.durationMs,
      fileSizeBytes: voiceMemo.fileSizeBytes,
    };
  }

  const persisted = await repository.persistVoiceMemoFile({
    temporaryUri: voiceMemo.localUri,
    fileName: `planning-task-instructions-${Date.now()}`,
  });
  return {
    localUri: persisted.localUri,
    durationMs: voiceMemo.durationMs,
    fileSizeBytes: persisted.fileSizeBytes,
  };
}

async function persistTaskInstructionPhotos(
  photos: TaskInstructionPhotoDraft[],
  repository: ExpoPhotoAttachmentStorageRepository,
): Promise<PlanningTaskInstructionPhoto[]> {
  return Promise.all(photos.map(async (photo, index) => {
    if (photo.isPersisted) {
      return {
        localUri: photo.localUri,
        width: photo.width,
        height: photo.height,
        mimeType: photo.mimeType,
        fileSizeBytes: photo.fileSizeBytes,
      };
    }

    return repository.persistPhotoAttachment({
      temporaryUri: photo.localUri,
      originalFileName: photo.originalFileName,
      width: photo.width,
      height: photo.height,
      mimeType: photo.mimeType,
      fileName: `planning-task-instruction-photo-${Date.now()}-${index + 1}`,
    });
  }));
}

function farmhandName(farmhandId: string, farmhands: Farmhand[]): string {
  return farmhands.find((farmhand) => farmhand.id === farmhandId)?.name ?? "Assigned farmhand";
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
  mediaActions: {
    gap: theme.spacing.sm,
  },
  mediaBlock: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
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
  reviewEditScope: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  photoGrid: {
    gap: theme.spacing.sm,
  },
  photoPreview: {
    aspectRatio: 4 / 3,
    borderRadius: theme.radius.sm,
    width: "100%",
  },
  photoTile: {
    gap: theme.spacing.xs,
  },
  subheading: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.headingFontWeight,
    lineHeight: 24,
    marginTop: theme.spacing.xs,
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
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.section,
    fontWeight: theme.typography.headingFontWeight,
    lineHeight: 26,
  },
  warning: {
    color: theme.colors.warning,
    fontSize: theme.typography.small,
    fontWeight: "700",
    lineHeight: 20,
  },
});
