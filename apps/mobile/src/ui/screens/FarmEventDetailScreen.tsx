import { Image, StyleSheet, Text, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { FARM_EVENT_TYPE_LABELS } from "../../domain/events/FarmEvent";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { FarmEventView } from "../../application/ports/FarmEventRepository";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LocalDataNotice } from "../components/LocalDataNotice";
import { PageHeader } from "../components/PageHeader";
import { PrivateDataNotice } from "../components/PrivateDataNotice";
import { Screen } from "../components/Screen";
import { SectionHeading } from "../components/SectionHeading";
import { buildFarmPlacePath } from "../farmPlaceDisplay";
import { formatRecordDate } from "../formatters";
import { theme } from "../theme/theme";

export function FarmEventDetailScreen({
  event,
  isLoading,
  locations,
}: {
  event: FarmEventView | null;
  isLoading: boolean;
  locations: FarmLocation[];
}) {
  const voiceMemo = event?.attachments.find((attachment) => attachment.kind === "voiceMemo");
  const photos = event?.attachments.filter((attachment) => attachment.kind === "photo") ?? [];
  const placePath = buildFarmPlacePath(locations, event?.event.placeId);
  const player = useAudioPlayer(voiceMemo?.localUri);
  const playerStatus = useAudioPlayerStatus(player);

  function handlePlayPause() {
    if (playerStatus.playing) {
      player.pause();
      return;
    }

    player.seekTo(0);
    player.play();
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Farm note"
        supportingText="Read-only local note details saved on this device."
        title={event ? FARM_EVENT_TYPE_LABELS[event.event.eventType] : "Farm note"}
      />
      <LocalDataNotice />
      <PrivateDataNotice text="This farm note is private to this device. The app does not transcribe, upload, or share it automatically." />
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
            <DetailRow label="Saved" value="Saved on this device" />
            {event.event.note ? <DetailRow label="Text note" value={event.event.note} /> : null}
          </Card>
          <Card>
            <SectionHeading detail="Playback stays on this device." title="Voice memo" />
            {voiceMemo ? (
              <>
                <Text style={styles.muted}>{formatDuration(voiceMemo.durationMs)}</Text>
                <Button label={playerStatus.playing ? "Pause playback" : "Play memo"} onPress={handlePlayPause} />
              </>
            ) : (
              <EmptyState text="No voice memo is attached to this farm note." />
            )}
          </Card>
          <Card>
            <SectionHeading detail="Photos are local attachments for review." title="Photos" />
            {photos.length ? (
              <View style={styles.photoGrid}>
                {photos.map((photo) => (
                  <Image
                    accessibilityLabel="Saved farm note photo"
                    key={photo.id}
                    source={{ uri: photo.localUri }}
                    style={styles.photo}
                  />
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
  photo: {
    aspectRatio: 1,
    borderRadius: theme.radius.sm,
    width: 132,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
});
