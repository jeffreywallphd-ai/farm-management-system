import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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
import { z } from "zod";

import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import { FARM_EVENT_TYPE_LABELS, FARM_EVENT_TYPES, type FarmEventType } from "../../domain/events/FarmEvent";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import { recordVoiceMemoFarmEvent } from "../../application/use-cases/record-voice-memo-farm-event/RecordVoiceMemoFarmEvent";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { ExpoPhotoAttachmentStorageRepository } from "../../infrastructure/media/ExpoPhotoAttachmentStorageRepository";
import { ExpoVoiceMemoStorageRepository } from "../../infrastructure/media/ExpoVoiceMemoStorageRepository";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { LocalDataNotice } from "../components/LocalDataNotice";
import { PageHeader } from "../components/PageHeader";
import { PrivateDataNotice } from "../components/PrivateDataNotice";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { buildFarmPlaceOptions } from "../farmPlaceDisplay";
import { theme } from "../theme/theme";

interface FormErrors {
  eventType?: string;
  placeId?: string;
  note?: string;
  attachments?: string;
  form?: string;
}

interface SelectedPhoto {
  uri: string;
  originalFileName?: string;
  width?: number;
  height?: number;
  mimeType?: string;
}

export function RecordFarmEventScreen({
  farm,
  farmEventRepository,
  farmReferenceRepository,
  locations,
}: {
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  farmReferenceRepository: FarmReferenceRepository;
  locations: FarmLocation[];
}) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [eventType, setEventType] = useState<FarmEventType>("general");
  const [placeId, setPlaceId] = useState("");
  const [note, setNote] = useState("");
  const [recordedUri, setRecordedUri] = useState<string | undefined>();
  const [recordedDurationMs, setRecordedDurationMs] = useState<number | undefined>();
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | undefined>();
  const player = useAudioPlayer(recordedUri);
  const playerStatus = useAudioPlayerStatus(player);
  const placeOptions = [
    { label: "No place", value: "" },
    ...buildFarmPlaceOptions(locations),
  ];
  const photoAttachmentStorageRepository = useMemo(() => new ExpoPhotoAttachmentStorageRepository(), []);
  const voiceMemoStorageRepository = useMemo(() => new ExpoVoiceMemoStorageRepository(), []);

  useEffect(() => {
    return () => {
      if (recordedUri) {
        voiceMemoStorageRepository.deleteLocalFileIfExists(recordedUri);
      }
    };
  }, [recordedUri, voiceMemoStorageRepository]);

  async function handleStartRecording() {
    setErrors({});
    setSavedMessage(undefined);
    if (recordedUri) {
      player.pause();
      await voiceMemoStorageRepository.deleteLocalFileIfExists(recordedUri);
      setRecordedUri(undefined);
      setRecordedDurationMs(undefined);
    }

    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setErrors({ form: "Microphone permission is needed to record a farm note." });
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
      setErrors({ form: "The voice memo could not be saved. Try recording again." });
      return;
    }

    setRecordedUri(recorder.uri);
    setRecordedDurationMs(recorderState.durationMillis);
  }

  function handlePlayPause() {
    if (playerStatus.playing) {
      player.pause();
      return;
    }

    player.seekTo(0);
    player.play();
  }

  async function handleTakePhoto() {
    setErrors({});
    setSavedMessage(undefined);
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setErrors({ form: "Camera permission is needed to take a farm photo." });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    addPickedPhotos(result);
  }

  async function handleChoosePhotos() {
    setErrors({});
    setSavedMessage(undefined);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setErrors({ form: "Photo permission is needed to add farm photos." });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ["images"],
      quality: 0.8,
    });

    addPickedPhotos(result);
  }

  function addPickedPhotos(result: ImagePicker.ImagePickerResult) {
    if (result.canceled) {
      return;
    }

    setSelectedPhotos((current) => [
      ...current,
      ...result.assets.map((asset) => ({
        uri: asset.uri,
        originalFileName: asset.fileName ?? undefined,
        width: asset.width,
        height: asset.height,
        mimeType: asset.mimeType,
      })),
    ]);
  }

  function handleRemovePhoto(uri: string) {
    setSelectedPhotos((current) => current.filter((photo) => photo.uri !== uri));
  }

  async function handleSave() {
    setIsSaving(true);
    setErrors({});
    setSavedMessage(undefined);

    try {
      if (!recordedUri) {
        throw new z.ZodError([
          {
            code: "custom",
            message: "Add a voice memo before saving.",
            path: ["attachments"],
            input: recordedUri,
          },
        ]);
      }

      await recordVoiceMemoFarmEvent(
        {
          farmId: farm.id,
          eventType,
          placeId,
          note,
          temporaryVoiceMemoUri: recordedUri,
          durationMs: recordedDurationMs,
          temporaryPhotoAttachments: selectedPhotos.map((photo) => ({
            temporaryUri: photo.uri,
            originalFileName: photo.originalFileName,
            width: photo.width,
            height: photo.height,
            mimeType: photo.mimeType,
          })),
        },
        {
          clock: systemClock,
          farmEventRepository,
          farmReferenceRepository,
          idGenerator: localIdGenerator,
          photoAttachmentStorageRepository,
          voiceMemoStorageRepository,
        },
      );
      setRecordedUri(undefined);
      setRecordedDurationMs(undefined);
      setSelectedPhotos([]);
      setNote("");
      setPlaceId("");
      setEventType("general");
      setSavedMessage("Farm note saved on this device.");
    } catch (caughtError) {
      if (caughtError instanceof z.ZodError) {
        setErrors(mapZodErrors(caughtError));
      } else {
        setErrors({ form: "This farm note could not be saved on this device." });
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Farm note"
        supportingText="Record a quick voice memo while the work is fresh. Add photos when a picture helps."
        title="Record farm note"
      />
      <LocalDataNotice />
      <PrivateDataNotice text="Voice memos and photos are saved on this device. The app does not transcribe, upload, or share them automatically." />
      <Card>
        <SectionHeading detail="Speak what happened. You can add place and type context if it helps." title="Voice memo" />
        <View style={styles.recorderPanel}>
          <Text style={styles.recorderStatus}>
            {recorderState.isRecording
              ? `Recording ${Math.round(recorderState.durationMillis / 1000)}s`
              : recordedUri
                ? `Memo ready (${Math.round((recordedDurationMs ?? 0) / 1000)}s)`
                : "No memo recorded yet"}
          </Text>
          {recorderState.isRecording ? (
            <Button label="Stop recording" onPress={handleStopRecording} />
          ) : (
            <Button label={recordedUri ? "Record again" : "Start recording"} onPress={handleStartRecording} />
          )}
          {recordedUri ? (
            <Button
              label={playerStatus.playing ? "Pause playback" : "Play memo"}
              onPress={handlePlayPause}
              variant="secondary"
            />
          ) : null}
        </View>
        <SelectField
          error={errors.eventType}
          label="Type"
          onChange={(value) => setEventType(value as FarmEventType)}
          options={FARM_EVENT_TYPES.map((type) => ({
            label: FARM_EVENT_TYPE_LABELS[type],
            value: type,
          }))}
          value={eventType}
        />
        <SelectField
          error={errors.placeId}
          label="Farm place"
          onChange={setPlaceId}
          options={placeOptions}
          value={placeId}
        />
        <FormField
          error={errors.note}
          label="Text note"
          multiline
          onChangeText={setNote}
          placeholder="Optional"
          value={note}
        />
        <SectionHeading detail="Optional photos stay local with this farm note." title="Photos" />
        <View style={styles.photoActions}>
          <Button label="Take photo" onPress={handleTakePhoto} variant="secondary" />
          <Button label="Choose photos" onPress={handleChoosePhotos} variant="secondary" />
        </View>
        {selectedPhotos.length ? (
          <View style={styles.photoGrid}>
            {selectedPhotos.map((photo) => (
              <View key={photo.uri} style={styles.photoTile}>
                <Image accessibilityLabel="Selected farm photo" source={{ uri: photo.uri }} style={styles.photoPreview} />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleRemovePhoto(photo.uri)}
                  style={styles.removePhotoButton}
                >
                  <Text style={styles.removePhotoText}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.photoHint}>No photos added.</Text>
        )}
        {errors.attachments ? <Text style={styles.error}>{errors.attachments}</Text> : null}
        {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
        {savedMessage ? <Text style={styles.success}>{savedMessage}</Text> : null}
        <Button disabled={isSaving || recorderState.isRecording} label={isSaving ? "Saving..." : "Save farm note"} onPress={handleSave} />
      </Card>
    </Screen>
  );
}

function mapZodErrors(error: z.ZodError): FormErrors {
  const nextErrors: FormErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (field === "eventType") {
      nextErrors.eventType = issue.message;
    } else if (field === "placeId") {
      nextErrors.placeId = issue.message;
    } else if (field === "note") {
      nextErrors.note = issue.message;
    } else if (field === "attachments") {
      nextErrors.attachments = issue.message;
    } else {
      nextErrors.form = issue.message;
    }
  }

  return nextErrors;
}

const styles = StyleSheet.create({
  recorderPanel: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  recorderStatus: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  success: {
    color: theme.colors.success,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  photoActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  photoHint: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
  },
  photoPreview: {
    aspectRatio: 1,
    borderRadius: theme.radius.sm,
    width: 96,
  },
  photoTile: {
    gap: theme.spacing.xs,
    width: 96,
  },
  removePhotoButton: {
    alignItems: "center",
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
  },
  removePhotoText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small,
    fontWeight: "700",
  },
});
