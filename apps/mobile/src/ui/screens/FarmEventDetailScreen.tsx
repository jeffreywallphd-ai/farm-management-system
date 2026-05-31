import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { FARM_EVENT_TYPE_LABELS } from "../../domain/events/FarmEvent";
import type { FarmNoteTranscript } from "../../domain/events/FarmNoteTranscript";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { FarmEventRepository, FarmEventView } from "../../application/ports/FarmEventRepository";
import type { FarmNoteTranscriptRepository } from "../../application/ports/FarmNoteTranscriptRepository";
import type { IdGenerator } from "../../application/ports/IdGenerator";
import type {
  TranscriptionModelRepository,
  TranscriptionModelStatus,
} from "../../application/ports/TranscriptionModelRepository";
import type { VoiceMemoTranscriptionService } from "../../application/ports/VoiceMemoTranscriptionService";
import { transcribeFarmNoteVoiceMemo } from "../../application/use-cases/transcribe-farm-note/TranscribeFarmNoteVoiceMemo";
import { systemClock } from "../../infrastructure/system/clock";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FarmNotePhotoPreview } from "../components/FarmNotePhotoPreview";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SectionHeading } from "../components/SectionHeading";
import { buildFarmPlacePath } from "../farmPlaceDisplay";
import { formatRecordDate } from "../formatters";
import { theme } from "../theme/theme";

export function FarmEventDetailScreen({
  event,
  farmEventRepository,
  idGenerator,
  isLoading,
  locations,
  onTranscriptChanged,
  transcript,
  transcriptionModelRepository,
  transcriptionRepository,
  transcriptionService,
}: {
  event: FarmEventView | null;
  farmEventRepository: FarmEventRepository;
  idGenerator: IdGenerator;
  isLoading: boolean;
  locations: FarmLocation[];
  onTranscriptChanged: (transcript: FarmNoteTranscript) => void;
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
          <Card>
            <SectionHeading title="Details" />
            <DetailRow label="Type" value={FARM_EVENT_TYPE_LABELS[event.event.eventType]} />
            <DetailRow label="Farm place" value={placePath ?? "No place"} />
            <DetailRow label="Captured" value={formatRecordDate(event.event.capturedAt)} />
            <DetailRow label="Saved" value="Local note" />
            {event.event.note ? <DetailRow label="Text note" value={event.event.note} /> : null}
          </Card>
          <Card>
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
            <Card>
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
          <Card>
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
          <Card>
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
