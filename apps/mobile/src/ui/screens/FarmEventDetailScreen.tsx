import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { FARM_EVENT_TYPE_LABELS } from "../../domain/events/FarmEvent";
import type { FarmNoteTranscript } from "../../domain/events/FarmNoteTranscript";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { FarmEventRepository, FarmEventView } from "../../application/ports/FarmEventRepository";
import type { FarmNoteTranscriptRepository } from "../../application/ports/FarmNoteTranscriptRepository";
import type { IdGenerator } from "../../application/ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import type {
  TranscriptionModelRepository,
  TranscriptionModelStatus,
} from "../../application/ports/TranscriptionModelRepository";
import type { VoiceMemoTranscriptionService } from "../../application/ports/VoiceMemoTranscriptionService";
import { saveOrganicEvidenceLink } from "../../application/use-cases/manage-organic-certification/ManageOrganicEvidenceLinks";
import { savePlanningLink, savePlanningTask } from "../../application/use-cases/manage-planning/ManagePlanning";
import { transcribeFarmNoteVoiceMemo } from "../../application/use-cases/transcribe-farm-note/TranscribeFarmNoteVoiceMemo";
import {
  ORGANIC_EVIDENCE_CATEGORIES,
  ORGANIC_EVIDENCE_CATEGORY_LABELS,
  ORGANIC_EVIDENCE_RECORD_TYPES,
  ORGANIC_EVIDENCE_RECORD_TYPE_LABELS,
  ORGANIC_EVIDENCE_ROLES,
  ORGANIC_EVIDENCE_ROLE_LABELS,
  type OrganicEvidenceCategory,
  type OrganicEvidenceLink,
  type OrganicEvidenceRecordType,
  type OrganicEvidenceRole,
} from "../../domain/organic/OrganicEvidenceLink";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DateField } from "../components/DateField";
import { EmptyState } from "../components/EmptyState";
import { FarmNotePhotoPreview } from "../components/FarmNotePhotoPreview";
import { FormField } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { buildFarmPlacePath } from "../farmPlaceDisplay";
import { formatRecordDate } from "../formatters";
import { theme } from "../theme/theme";

export function FarmEventDetailScreen({
  event,
  evidenceLinks,
  farmEventRepository,
  idGenerator,
  isLoading,
  locations,
  onEvidenceLinksChanged,
  onTranscriptChanged,
  organicCertificationRepository,
  planningRepository,
  transcript,
  transcriptionModelRepository,
  transcriptionRepository,
  transcriptionService,
}: {
  event: FarmEventView | null;
  evidenceLinks: OrganicEvidenceLink[];
  farmEventRepository: FarmEventRepository;
  idGenerator: IdGenerator;
  isLoading: boolean;
  locations: FarmLocation[];
  onEvidenceLinksChanged: (links: OrganicEvidenceLink[]) => void;
  onTranscriptChanged: (transcript: FarmNoteTranscript) => void;
  organicCertificationRepository: OrganicCertificationRepository;
  planningRepository: PlanningRepository;
  transcript: FarmNoteTranscript | null;
  transcriptionModelRepository: TranscriptionModelRepository;
  transcriptionRepository: FarmNoteTranscriptRepository;
  transcriptionService: VoiceMemoTranscriptionService;
}) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [modelStatus, setModelStatus] = useState<TranscriptionModelStatus | null>(null);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [evidenceCategory, setEvidenceCategory] = useState<OrganicEvidenceCategory>("general");
  const [evidenceRole, setEvidenceRole] = useState<OrganicEvidenceRole>("supportingNote");
  const [linkedRecordType, setLinkedRecordType] = useState("");
  const [linkedRecordId, setLinkedRecordId] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [evidenceError, setEvidenceError] = useState<string | undefined>();
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskError, setTaskError] = useState<string | undefined>();
  const [taskSavedMessage, setTaskSavedMessage] = useState<string | undefined>();
  const voiceMemo = event?.attachments.find((attachment) => attachment.kind === "voiceMemo");
  const photos = event?.attachments.filter((attachment) => attachment.kind === "photo") ?? [];
  const placePath = buildFarmPlacePath(locations, event?.event.placeId);
  const player = useAudioPlayer(voiceMemo?.localUri);
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    let isMounted = true;

    async function loadModelStatus() {
      if (!voiceMemo) {
        setModelStatus(null);
        return;
      }

      const nextStatus = await transcriptionModelRepository.getModelStatus();
      if (isMounted) {
        setModelStatus(nextStatus);
      }
    }

    loadModelStatus().catch(() => {
      if (isMounted) {
        setModelError("Transcription model status could not be checked on this device.");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [transcriptionModelRepository, voiceMemo]);

  function handlePlayPause() {
    if (playerStatus.playing) {
      player.pause();
      return;
    }

    player.seekTo(0);
    player.play();
  }

  async function handleTranscribe() {
    if (!event || !voiceMemo || modelStatus?.status !== "installed") {
      return;
    }

    setIsTranscribing(true);
    try {
      const nextTranscript = await transcribeFarmNoteVoiceMemo(
        { farmId: event.event.farmId, farmEventId: event.event.id },
        {
          clock: systemClock,
          farmEventRepository,
          idGenerator,
          transcriptionRepository,
          transcriptionService,
        },
      );
      onTranscriptChanged(nextTranscript);
    } finally {
      setIsTranscribing(false);
    }
  }

  async function handleDownloadModel() {
    setIsDownloadingModel(true);
    setDownloadProgress(0);
    setModelError(null);

    try {
      const nextStatus = await transcriptionModelRepository.downloadModel((progress) => {
        setDownloadProgress(progress);
      });
      setModelStatus(nextStatus);
    } catch {
      setModelError("The transcription model could not be downloaded. Check your connection and try again.");
    } finally {
      setIsDownloadingModel(false);
    }
  }

  async function handleSaveEvidenceLink() {
    if (!event) return;

    setEvidenceError(undefined);
    try {
      const link = await saveOrganicEvidenceLink(
        {
          farmId: event.event.farmId,
          farmEventId: event.event.id,
          category: evidenceCategory,
          evidenceRole,
          linkedRecordType: linkedRecordType ? (linkedRecordType as OrganicEvidenceRecordType) : undefined,
          linkedRecordId,
          notes: evidenceNotes,
        },
        {
          clock: systemClock,
          farmEventRepository,
          idGenerator,
          repository: organicCertificationRepository,
        },
      );
      onEvidenceLinksChanged([link, ...evidenceLinks]);
      setLinkedRecordType("");
      setLinkedRecordId("");
      setEvidenceNotes("");
    } catch (caught) {
      setEvidenceError(caught instanceof z.ZodError ? caught.issues[0]?.message : "Organic evidence link could not be saved.");
    }
  }

  async function handleCreateTaskFromNote() {
    if (!event) return;

    setTaskError(undefined);
    setTaskSavedMessage(undefined);
    try {
      const task = await savePlanningTask(
        {
          farmId: event.event.farmId,
          title: taskTitle,
          notes: `Follow up from farm note ${event.event.id}.`,
          status: "notStarted",
          priority: "normal",
          dueDate: taskDueDate,
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository: planningRepository },
      );
      await savePlanningLink(
        {
          farmId: event.event.farmId,
          taskId: task.id,
          linkedRecordType: "farmNote",
          linkedRecordId: event.event.id,
          notes: "Task created from farm note detail.",
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository: planningRepository },
      );
      setTaskTitle("");
      setTaskDueDate("");
      setTaskSavedMessage("Planning task linked to this farm note.");
    } catch (caught) {
      setTaskError(caught instanceof z.ZodError ? caught.issues[0]?.message : "Planning task could not be created.");
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Farm note"
        supportingText="Read-only local note details saved on this device."
        title={event ? FARM_EVENT_TYPE_LABELS[event.event.eventType] : "Farm note"}
      />
      {isLoading ? (
        <Card>
          <Text style={styles.muted}>Loading farm note...</Text>
        </Card>
      ) : !event ? (
        <Card>
          <EmptyState text="This farm note could not be found on this device." />
        </Card>
      ) : (
        <>
          <Card rootLevelHeader>
            <SectionHeading detail="Review the saved farm note context and local status." title="Details" />
            <DetailRow label="Type" value={FARM_EVENT_TYPE_LABELS[event.event.eventType]} />
            <DetailRow label="Farm place" value={placePath ?? "No place"} />
            <DetailRow label="Captured" value={formatRecordDate(event.event.capturedAt)} />
            <DetailRow label="Saved" value="Local note" />
            {event.event.note ? <DetailRow label="Text note" value={event.event.note} /> : null}
            {event.event.needsOrganicReview && evidenceLinks.length === 0 ? (
              <DetailRow label="Organic review" value="Marked for review" />
            ) : null}
          </Card>
          <Card rootLevelHeader>
            <SectionHeading
              detail="Link this saved note to organic categories or records. The audio and photos stay with the farm note."
              title="Organic evidence"
            />
            {evidenceLinks.length ? (
              evidenceLinks.map((link) => (
                <View key={link.id} style={styles.evidenceRow}>
                  <Text style={styles.detailValue}>{ORGANIC_EVIDENCE_CATEGORY_LABELS[link.category]}</Text>
                  <Text style={styles.muted}>
                    {ORGANIC_EVIDENCE_ROLE_LABELS[link.evidenceRole]}
                    {link.linkedRecordType ? ` - ${ORGANIC_EVIDENCE_RECORD_TYPE_LABELS[link.linkedRecordType]}` : ""}
                    {link.linkedRecordId ? ` (${link.linkedRecordId})` : ""}
                  </Text>
                  {link.notes ? <Text style={styles.muted}>{link.notes}</Text> : null}
                </View>
              ))
            ) : (
              <EmptyState text="This farm note is not linked to organic evidence yet." />
            )}
            <SelectField
              label="Organic category"
              onChange={(value) => setEvidenceCategory(value as OrganicEvidenceCategory)}
              options={ORGANIC_EVIDENCE_CATEGORIES.map((category) => ({
                label: ORGANIC_EVIDENCE_CATEGORY_LABELS[category],
                value: category,
              }))}
              value={evidenceCategory}
            />
            <SelectField
              label="Evidence role"
              onChange={(value) => setEvidenceRole(value as OrganicEvidenceRole)}
              options={ORGANIC_EVIDENCE_ROLES.map((role) => ({
                label: ORGANIC_EVIDENCE_ROLE_LABELS[role],
                value: role,
              }))}
              value={evidenceRole}
            />
            <SelectField
              label="Linked organic record type"
              onChange={setLinkedRecordType}
              options={[
                { label: "No specific organic record", value: "" },
                ...ORGANIC_EVIDENCE_RECORD_TYPES.map((type) => ({
                  label: ORGANIC_EVIDENCE_RECORD_TYPE_LABELS[type],
                  value: type,
                })),
              ]}
              value={linkedRecordType}
            />
            <FormField
              label="Linked record ID"
              onChangeText={setLinkedRecordId}
              placeholder="Optional saved organic record ID"
              value={linkedRecordId}
            />
            <FormField
              label="Evidence note"
              multiline
              onChangeText={setEvidenceNotes}
              placeholder="Why this note helps certification review"
              value={evidenceNotes}
            />
            {evidenceError ? <Text style={styles.error}>{evidenceError}</Text> : null}
            <Button label="Link note as organic evidence" onPress={handleSaveEvidenceLink} size="large" variant="secondary" />
          </Card>
          <Card rootLevelHeader>
            <SectionHeading
              detail="Create follow-up work from this note without turning the note itself into a completed record."
              title="Planning follow-up"
            />
            <FormField label="Task" onChangeText={setTaskTitle} placeholder="Follow up on this farm note" value={taskTitle} />
            <DateField label="Due date" onChangeText={setTaskDueDate} placeholder="YYYY-MM-DD or leave blank" value={taskDueDate} />
            {taskSavedMessage ? <Text style={styles.muted}>{taskSavedMessage}</Text> : null}
            {taskError ? <Text style={styles.error}>{taskError}</Text> : null}
            <Button label="Create linked planning task" onPress={handleCreateTaskFromNote} size="large" variant="secondary" />
          </Card>
          <Card rootLevelHeader>
            <SectionHeading detail="Playback stays on this device." title="Voice memo" />
            {voiceMemo ? (
              <>
                <Text style={styles.muted}>{formatDuration(voiceMemo.durationMs)}</Text>
                <Button label={playerStatus.playing ? "Pause playback" : "Play memo"} onPress={handlePlayPause} />
                <Button
                  disabled={isTranscribing || modelStatus?.status !== "installed"}
                  label={isTranscribing ? "Transcribing..." : transcript ? "Retry transcription" : "Transcribe voice memo"}
                  onPress={handleTranscribe}
                  variant="secondary"
                />
                <Text style={styles.muted}>Audio stays on this device for this transcription.</Text>
              </>
            ) : (
              <EmptyState text="No voice memo is attached to this farm note." />
            )}
          </Card>
          {voiceMemo ? (
            <Card rootLevelHeader>
              <SectionHeading
                detail="Download once, then use offline. Audio is not uploaded."
                title="Local transcription model"
              />
              <TranscriptionModelStatusView
                downloadProgress={downloadProgress}
                error={modelError}
                isDownloading={isDownloadingModel}
                onDownload={handleDownloadModel}
                status={modelStatus}
              />
            </Card>
          ) : null}
          <Card rootLevelHeader>
            <SectionHeading
              detail="Generated on this device from the saved voice memo. Check the audio if accuracy matters."
              title="Transcript draft"
            />
            {!voiceMemo ? (
              <EmptyState text="No voice memo is available to transcribe." />
            ) : !transcript ? (
              <EmptyState text="No transcript draft yet." />
            ) : transcript.status === "completed" ? (
              <Text style={styles.transcriptText}>{transcript.text}</Text>
            ) : (
              <Text style={styles.error}>
                {transcript.errorSummary ?? "Transcript could not be generated on this device."}
              </Text>
            )}
          </Card>
          <Card rootLevelHeader>
            <SectionHeading
              detail="Photos are local attachments for review. If a saved file is missing, this screen shows which photo is unavailable."
              title={photos.length === 0 ? "Photos" : photos.length === 1 ? "1 photo" : `${photos.length} photos`}
            />
            {photos.length ? (
              <View style={styles.photoGrid}>
                {photos.map((photo) => (
                  <FarmNotePhotoPreview key={photo.id} uri={photo.localUri} />
                ))}
              </View>
            ) : (
              <EmptyState text="No photos are attached to this farm note." />
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatDuration(value?: number): string {
  if (!value) {
    return "Voice memo ready";
  }

  return `Voice memo ${Math.round(value / 1000)} seconds`;
}

const styles = StyleSheet.create({
  detailLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  detailRow: {
    gap: 2,
  },
  evidenceRow: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
  },
  detailValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
    lineHeight: 22,
  },
  muted: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  transcriptText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
});

function TranscriptionModelStatusView({
  downloadProgress,
  error,
  isDownloading,
  onDownload,
  status,
}: {
  downloadProgress: number | null;
  error: string | null;
  isDownloading: boolean;
  onDownload: () => void;
  status: TranscriptionModelStatus | null;
}) {
  if (!status) {
    return <Text style={styles.muted}>Checking local transcription model...</Text>;
  }

  if (status.status === "installed") {
    return (
      <>
        <Text style={styles.muted}>Transcription is available on this phone and works offline.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </>
    );
  }

  return (
    <>
      <Text style={styles.muted}>
        This downloads a small speech model to this phone so voice memos can be transcribed without sending audio to a server.
      </Text>
      <Text style={styles.muted}>Approximate download size: 78 MB.</Text>
      {status.status === "invalid" ? <Text style={styles.error}>{status.reason}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isDownloading ? (
        <Text style={styles.muted}>
          Downloading{downloadProgress !== null ? ` ${Math.round(downloadProgress * 100)}%` : "..."}
        </Text>
      ) : null}
      <Button
        disabled={isDownloading}
        label={status.status === "invalid" ? "Repair transcription model" : "Download transcription model"}
        onPress={onDownload}
        variant="secondary"
      />
    </>
  );
}
