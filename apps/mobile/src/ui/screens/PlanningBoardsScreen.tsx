import { useEffect, useMemo, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import type { FarmEventRepository, FarmEventView } from "../../application/ports/FarmEventRepository";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { FarmhandRepository } from "../../application/ports/FarmhandRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import type { Farmhand } from "../../domain/farmhand/Farmhand";
import { ensureDefaultPlanningBoards, movePlanningTaskStatus } from "../../application/use-cases/manage-planning/ManagePlanning";
import { FARM_EVENT_TYPE_LABELS } from "../../domain/events/FarmEvent";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import {
  PLANNING_TASK_PRIORITY_LABELS,
  PLANNING_TASK_STATUS_LABELS,
  type PlanningBoard,
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
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";
import { formatRecordDate } from "../formatters";
import { RecordFarmEventForm } from "./RecordFarmEventScreen";
import {
  BOARD_COLUMN_FILTER_LABELS,
  BOARD_COLUMN_FILTERS,
  BOARD_COLUMN_STATUSES,
  type BoardColumnFilter,
  countFarmNoteLinksByTask,
  describeBoardTask,
  isWipLimitExceeded,
  selectBoardColumnTasks,
  selectBoardsForFarmhand,
  selectBoardTasksForFarmhand,
} from "./PlanningBoardsScreenModel";

export function PlanningBoardsScreen({
  farm,
  farmEventRepository,
  farmReferenceRepository,
  farmhandRepository,
  initialGoalId,
  locations,
  organicCertificationRepository,
  repository,
}: {
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  farmReferenceRepository: FarmReferenceRepository;
  farmhandRepository?: FarmhandRepository;
  initialGoalId?: string;
  locations: FarmLocation[];
  organicCertificationRepository: OrganicCertificationRepository;
  repository: PlanningRepository;
}) {
  const [boards, setBoards] = useState<PlanningBoard[]>([]);
  const [farmhands, setFarmhands] = useState<Farmhand[]>([]);
  const [goals, setGoals] = useState<PlanningGoal[]>([]);
  const [tasks, setTasks] = useState<PlanningTask[]>([]);
  const [links, setLinks] = useState<PlanningLink[]>([]);
  const [linkedFarmEventsByTask, setLinkedFarmEventsByTask] = useState<Record<string, FarmEventView[]>>({});
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [selectedFarmhandId, setSelectedFarmhandId] = useState<"all" | string>("all");
  const [selectedColumnFilter, setSelectedColumnFilter] = useState<BoardColumnFilter>("notStarted");
  const [recordingTaskId, setRecordingTaskId] = useState("");
  const [openTaskId, setOpenTaskId] = useState("");
  const [openEventId, setOpenEventId] = useState("");
  const [fullScreenPhotoUri, setFullScreenPhotoUri] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  async function loadBoards(preferredBoardId = selectedBoardId) {
    const [ensuredBoards, nextGoals, nextTasks, nextLinks, nextFarmhands] = await Promise.all([
      ensureDefaultPlanningBoards(
        { farmId: farm.id },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      ),
      repository.listGoals(farm.id),
      repository.listTasks(farm.id),
      repository.listLinks(farm.id),
      farmhandRepository ? farmhandRepository.listFarmhands(farm.id) : Promise.resolve([]),
    ]);
    const linkedEventsByTask = await loadLinkedFarmEvents(farm.id, nextLinks, farmEventRepository);
    const visibleBoards = selectBoardsForFarmhand(ensuredBoards, nextGoals, nextTasks, selectedFarmhandId);
    const nextSelectedBoardId =
      (preferredBoardId && visibleBoards.some((board) => board.id === preferredBoardId) ? preferredBoardId : "") ||
      (initialGoalId ? visibleBoards.find((board) => board.goalId === initialGoalId)?.id : "") ||
      visibleBoards[0]?.id ||
      "";
    setBoards(ensuredBoards);
    setFarmhands(nextFarmhands);
    setGoals(nextGoals);
    setTasks(nextTasks);
    setLinks(nextLinks);
    setLinkedFarmEventsByTask(linkedEventsByTask);
    setSelectedBoardId(nextSelectedBoardId);
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

  async function handleSelectFarmhand(farmhandId: string) {
    setError(undefined);
    setSelectedFarmhandId(farmhandId);
    const visibleBoards = selectBoardsForFarmhand(boards, goals, tasks, farmhandId);
    const nextSelectedBoardId = visibleBoards.some((board) => board.id === selectedBoardId) ? selectedBoardId : visibleBoards[0]?.id ?? "";
    setSelectedBoardId(nextSelectedBoardId);
  }

  async function handleMoveTask(task: PlanningTask, status: PlanningTaskStatus) {
    setError(undefined);
    try {
      await movePlanningTaskStatus(
        { farmId: farm.id, taskId: task.id, status },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      await loadBoards(selectedBoardId);
    } catch {
      setError("Task status could not be updated.");
    }
  }

  const visibleBoards = selectBoardsForFarmhand(boards, goals, tasks, selectedFarmhandId);
  const selectedBoard = visibleBoards.find((board) => board.id === selectedBoardId);
  const boardTasks = selectedBoard ? selectBoardTasksForFarmhand(selectedBoard, goals, tasks, selectedFarmhandId) : [];
  const boardOptions = visibleBoards.map((board) => ({ label: board.title, value: board.id }));
  const farmhandOptions = [
    { label: "All farmhands", value: "all" },
    ...farmhands.map((farmhand) => ({
      label: farmhand.status === "inactive" ? `${farmhand.name} (inactive)` : farmhand.name,
      value: farmhand.id,
    })),
  ];
  const columnTasks = selectBoardColumnTasks(boardTasks, selectedColumnFilter);
  const farmNoteCounts = useMemo(() => countFarmNoteLinksByTask(links), [links]);
  const wipExceeded = selectedBoard ? isWipLimitExceeded(boardTasks, selectedColumnFilter, selectedBoard.wipLimit) : false;

  return (
    <Screen>
      <PageHeader
        eyebrow="Farm planning"
        supportingText="Move planned work through simple columns. Farm events stay connected to the task as the evidence of what happened."
        title="Farm work boards"
      />

      <Card>
        <SectionHeading
          detail={selectedBoard?.wipLimit ? `WIP limit: ${selectedBoard.wipLimit}` : "Choose a board and a work view. Default boards are created for each highest-level goal and for tasks without a goal."}
          title="Board"
        />
        {farmhands.length ? (
          <SelectField label="Show work for" onChange={handleSelectFarmhand} options={farmhandOptions} value={selectedFarmhandId} />
        ) : null}
        {visibleBoards.length ? (
          <SelectField label="Board" onChange={handleSelectBoard} options={boardOptions} value={selectedBoardId} />
        ) : (
          <EmptyState text={selectedFarmhandId === "all" ? "Create a goal or task to start a board." : "No boards contain work for this farmhand yet."} />
        )}
        <SelectField
          label={selectedBoard ? `${selectedBoard.title} work view` : "Work view"}
          onChange={(value) => setSelectedColumnFilter(value as BoardColumnFilter)}
          options={BOARD_COLUMN_FILTERS.map((filter) => ({ label: `${BOARD_COLUMN_FILTER_LABELS[filter]} (${selectBoardColumnTasks(boardTasks, filter).length})`, value: filter }))}
          value={selectedColumnFilter}
        />
        {wipExceeded ? <Text style={styles.warning}>This column is over its work-in-progress limit. Finish or move work before adding more here.</Text> : null}
        {columnTasks.length ? columnTasks.map((task) => (
          <TaskBoardCard
            farmNoteCount={farmNoteCounts[task.id] ?? 0}
            farm={farm}
            farmEventRepository={farmEventRepository}
            farmReferenceRepository={farmReferenceRepository}
            isRecordingEvent={recordingTaskId === task.id}
            isOpen={openTaskId === task.id}
            key={task.id}
            linkedEvents={linkedFarmEventsByTask[task.id] ?? []}
            onMove={(status) => handleMoveTask(task, status)}
            onOpenPhoto={setFullScreenPhotoUri}
            onRecordEvent={() => setRecordingTaskId(task.id)}
            onSavedEvent={async () => {
              setRecordingTaskId("");
              await loadBoards(selectedBoardId);
            }}
            locations={locations}
            organicCertificationRepository={organicCertificationRepository}
            planningRepository={repository}
            planningTasks={tasks}
            openEventId={openEventId}
            onToggleEvent={(eventId) => setOpenEventId((current) => current === eventId ? "" : eventId)}
            onToggleOpen={() => {
              setOpenTaskId((current) => current === task.id ? "" : task.id);
              setOpenEventId("");
            }}
            task={task}
          />
        )) : <EmptyState text="No tasks in this column." />}
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FullScreenPhoto uri={fullScreenPhotoUri} onClose={() => setFullScreenPhotoUri(undefined)} />
    </Screen>
  );
}

function TaskBoardCard({
  farmNoteCount,
  farm,
  farmEventRepository,
  farmReferenceRepository,
  isOpen,
  isRecordingEvent,
  linkedEvents,
  locations,
  organicCertificationRepository,
  onMove,
  onOpenPhoto,
  onRecordEvent,
  onSavedEvent,
  openEventId,
  onToggleEvent,
  onToggleOpen,
  planningRepository,
  planningTasks,
  task,
}: {
  farmNoteCount: number;
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  farmReferenceRepository: FarmReferenceRepository;
  isOpen: boolean;
  isRecordingEvent: boolean;
  linkedEvents: FarmEventView[];
  locations: FarmLocation[];
  organicCertificationRepository: OrganicCertificationRepository;
  onMove: (status: PlanningTaskStatus) => void;
  onOpenPhoto: (uri: string) => void;
  onRecordEvent: () => void;
  onSavedEvent: () => void | Promise<void>;
  openEventId: string;
  onToggleEvent: (eventId: string) => void;
  onToggleOpen: () => void;
  planningRepository: PlanningRepository;
  planningTasks: PlanningTask[];
  task: PlanningTask;
}) {
  const taskDetails = describeBoardTask(task, locations);
  return (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{task.title} - {PLANNING_TASK_STATUS_LABELS[task.status]}</Text>
      <Text style={styles.taskDetail}>
        {PLANNING_TASK_PRIORITY_LABELS[task.priority]}
        {task.assignedFarmhandId ? " - assigned" : ""}
        {farmNoteCount ? ` - ${farmNoteCount} linked farm event${farmNoteCount === 1 ? "" : "s"}` : ""}
      </Text>
      <Button label={isOpen ? "Close task" : "Open task"} onPress={onToggleOpen} size="large" variant="secondary" />
      {isOpen ? (
        <>
          <Text style={styles.taskDetail}><Text style={styles.detailLabel}>Description: </Text>{taskDetails.description}</Text>
          <Text style={styles.taskDetail}><Text style={styles.detailLabel}>Place: </Text>{taskDetails.place}</Text>
          <Text style={styles.taskDetail}><Text style={styles.detailLabel}>Desired start: </Text>{task.plannedStartDate ?? "No desired start date set"}</Text>
          <Text style={styles.taskDetail}><Text style={styles.detailLabel}>Target completion: </Text>{taskDetails.targetCompletionDate}</Text>
          <TaskInstructionMediaPreview task={task} onOpenPhoto={onOpenPhoto} />
          <Text style={styles.taskDetail}>{farmNoteCount ? `${farmNoteCount} farm event${farmNoteCount === 1 ? "" : "s"} linked` : "No farm events linked yet"}</Text>
          <Button label="Record event for this task" onPress={onRecordEvent} size="large" />
          {isRecordingEvent ? (
            <View style={styles.inlineEventForm}>
              <RecordFarmEventForm
                farm={farm}
                farmEventRepository={farmEventRepository}
                farmReferenceRepository={farmReferenceRepository}
                initialPlanningTaskId={task.id}
                locations={locations}
                onSaved={onSavedEvent}
                organicCertificationRepository={organicCertificationRepository}
                planningRepository={planningRepository}
                planningTasks={planningTasks}
                showCertificationRequirementField={false}
                showPlaceField={false}
                showTaskField={false}
              />
            </View>
          ) : null}
          <SelectField
            label="Task status"
            onChange={(value) => onMove(value as PlanningTaskStatus)}
            options={BOARD_COLUMN_STATUSES.map((status) => ({ label: PLANNING_TASK_STATUS_LABELS[status], value: status }))}
            value={task.status}
          />
          <View style={styles.linkedEventsBlock}>
            <Text style={styles.detailLabel}>Linked farm events</Text>
            {linkedEvents.length ? linkedEvents.map((event) => (
              <LinkedFarmEventCard
                eventView={event}
                isOpen={openEventId === event.event.id}
                key={event.event.id}
                onOpenPhoto={onOpenPhoto}
                onToggle={() => onToggleEvent(event.event.id)}
              />
            )) : <Text style={styles.taskDetail}>No linked farm events yet.</Text>}
          </View>
        </>
      ) : null}
    </View>
  );
}

function TaskInstructionMediaPreview({ task, onOpenPhoto }: { task: PlanningTask; onOpenPhoto: (uri: string) => void }) {
  const player = useAudioPlayer(task.instructionVoiceMemo?.localUri);
  const playerStatus = useAudioPlayerStatus(player);

  const photos = task.instructionPhotos ?? [];

  if (!task.instructionVoiceMemo && photos.length === 0) {
    return null;
  }

  function handlePlayPause() {
    if (!task.instructionVoiceMemo) return;
    if (playerStatus.playing) {
      player.pause();
      return;
    }

    player.seekTo(0);
    player.play();
  }

  return (
    <View style={styles.instructionsBlock}>
      <Text style={styles.detailLabel}>Task instructions</Text>
      {task.instructionVoiceMemo ? (
        <Button label={playerStatus.playing ? "Pause recorded instructions" : "Play recorded instructions"} onPress={handlePlayPause} size="large" variant="secondary" />
      ) : null}
      {photos.length ? (
        <View style={styles.photoGrid}>
          {photos.map((photo) => (
            <Pressable accessibilityRole="button" key={photo.localUri} onPress={() => onOpenPhoto(photo.localUri)}>
              <Image source={{ uri: photo.localUri }} style={styles.photoPreview} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function LinkedFarmEventCard({
  eventView,
  isOpen,
  onOpenPhoto,
  onToggle,
}: {
  eventView: FarmEventView;
  isOpen: boolean;
  onOpenPhoto: (uri: string) => void;
  onToggle: () => void;
}) {
  const voiceMemo = eventView.attachments.find((attachment) => attachment.kind === "voiceMemo");
  const photos = eventView.attachments.filter((attachment) => attachment.kind === "photo");
  const player = useAudioPlayer(voiceMemo?.localUri);
  const playerStatus = useAudioPlayerStatus(player);

  function handlePlayPause() {
    if (!voiceMemo) return;
    if (playerStatus.playing) {
      player.pause();
      return;
    }

    player.seekTo(0);
    player.play();
  }

  return (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{FARM_EVENT_TYPE_LABELS[eventView.event.eventType]} - {formatRecordDate(eventView.event.capturedAt)}</Text>
      <Text style={styles.taskDetail}>{eventView.place?.name ?? "No place set"}</Text>
      <Button label={isOpen ? "Close event" : "Open event"} onPress={onToggle} size="large" variant="secondary" />
      {isOpen ? (
        <>
          <Text style={styles.taskDetail}><Text style={styles.detailLabel}>Note: </Text>{eventView.event.note?.trim() || "No text note"}</Text>
          <Text style={styles.taskDetail}><Text style={styles.detailLabel}>Organic review: </Text>{eventView.event.needsOrganicReview ? "Marked for review" : "Not marked"}</Text>
          {voiceMemo ? (
            <Button label={playerStatus.playing ? "Pause farm event audio" : "Play farm event audio"} onPress={handlePlayPause} size="large" variant="secondary" />
          ) : null}
          {photos.length ? (
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <Pressable accessibilityRole="button" key={photo.id} onPress={() => onOpenPhoto(photo.localUri)}>
                  <Image source={{ uri: photo.localUri }} style={styles.photoPreview} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function FullScreenPhoto({ uri, onClose }: { uri?: string; onClose: () => void }) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape", "landscape-left", "landscape-right"]}
      transparent={false}
      visible={Boolean(uri)}
    >
      <View style={styles.fullScreenPhoto}>
        <Pressable accessibilityLabel="Close photo" accessibilityRole="button" onPress={onClose} style={styles.fullScreenClose}>
          <Text style={styles.fullScreenCloseText}>x</Text>
        </Pressable>
        {uri ? (
          <Image resizeMode="contain" source={{ uri }} style={styles.fullScreenImage} />
        ) : null}
      </View>
    </Modal>
  );
}

async function loadLinkedFarmEvents(
  farmId: string,
  links: PlanningLink[],
  repository: FarmEventRepository,
): Promise<Record<string, FarmEventView[]>> {
  const farmNoteLinks = links.filter((link) => link.taskId && link.linkedRecordType === "farmNote");
  const entries = await Promise.all(farmNoteLinks.map(async (link) => {
    const event = await repository.getFarmEventDetail(farmId, link.linkedRecordId);
    return event && link.taskId ? { taskId: link.taskId, event } : null;
  }));

  return entries.reduce<Record<string, FarmEventView[]>>((grouped, entry) => {
    if (!entry) return grouped;
    grouped[entry.taskId] = [...(grouped[entry.taskId] ?? []), entry.event];
    return grouped;
  }, {});
}

const styles = StyleSheet.create({
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  eventTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "800",
    lineHeight: 24,
  },
  fullScreenClose: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: theme.spacing.md,
    top: theme.spacing.lg,
    width: 36,
    zIndex: 2,
  },
  fullScreenCloseText: {
    color: theme.colors.surface,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 28,
  },
  fullScreenImage: {
    height: "100%",
    width: "100%",
  },
  fullScreenPhoto: {
    backgroundColor: "#000000",
    flex: 1,
  },
  inlineEventForm: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  detailLabel: {
    color: theme.colors.textPrimary,
    fontWeight: "800",
  },
  instructionsBlock: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  linkedEventsBlock: {
    gap: theme.spacing.sm,
  },
  photoGrid: {
    gap: theme.spacing.sm,
  },
  photoPreview: {
    aspectRatio: 4 / 3,
    borderRadius: theme.radius.sm,
    width: "100%",
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
