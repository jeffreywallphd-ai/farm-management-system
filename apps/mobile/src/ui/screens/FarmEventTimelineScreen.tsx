import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { FARM_EVENT_TYPE_LABELS, FARM_EVENT_TYPES, type FarmEventType } from "../../domain/events/FarmEvent";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { FarmEventView } from "../../application/ports/FarmEventRepository";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ListRow } from "../components/ListRow";
import { LocalDataNotice } from "../components/LocalDataNotice";
import { PageHeader } from "../components/PageHeader";
import { PrivateDataNotice } from "../components/PrivateDataNotice";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { buildFarmPlaceOptions, buildFarmPlacePath } from "../farmPlaceDisplay";
import { formatRecordDate } from "../formatters";
import { pushRoute } from "../navigation";
import { theme } from "../theme/theme";

type DateFilter = "all" | "today" | "week";

export function FarmEventTimelineScreen({
  events,
  isLoading,
  locations,
}: {
  events: FarmEventView[];
  isLoading: boolean;
  locations: FarmLocation[];
}) {
  const router = useRouter();
  const [eventType, setEventType] = useState<FarmEventType | "all">("all");
  const [placeId, setPlaceId] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const placeOptions = [
    { label: "All places", value: "" },
    ...buildFarmPlaceOptions(locations),
  ];
  const filteredEvents = useMemo(
    () =>
      events.filter((view) => {
        if (eventType !== "all" && view.event.eventType !== eventType) {
          return false;
        }

        if (placeId && view.event.placeId !== placeId) {
          return false;
        }

        return isWithinDateFilter(view.event.capturedAt, dateFilter);
      }),
    [dateFilter, eventType, events, placeId],
  );

  return (
    <Screen>
      <PageHeader
        eyebrow="Farm notes"
        supportingText="Review voice and photo notes saved privately on this device."
        title="Farm note timeline"
      />
      <LocalDataNotice />
      <PrivateDataNotice text="Farm notes stay on this device unless you choose to create and share a media recovery package." />
      <Card>
        <SectionHeading detail="Filter your saved notes without needing reception." title="Find notes" />
        <SelectField
          label="Type"
          onChange={(value) => setEventType(value as FarmEventType | "all")}
          options={[
            { label: "All types", value: "all" },
            ...FARM_EVENT_TYPES.map((type) => ({ label: FARM_EVENT_TYPE_LABELS[type], value: type })),
          ]}
          value={eventType}
        />
        <SelectField label="Farm place" onChange={setPlaceId} options={placeOptions} value={placeId} />
        <SelectField
          label="Date"
          onChange={(value) => setDateFilter(value as DateFilter)}
          options={[
            { label: "Any time", value: "all" },
            { label: "Today", value: "today" },
            { label: "Last 7 days", value: "week" },
          ]}
          value={dateFilter}
        />
      </Card>
      <Card>
        <SectionHeading title="Saved farm notes" />
        {isLoading ? (
          <Text style={styles.muted}>Loading saved farm notes...</Text>
        ) : filteredEvents.length === 0 ? (
          <EmptyState text="No farm notes found. Record a voice note with optional photos to start a local timeline." />
        ) : (
          <View style={styles.list}>
            {filteredEvents.map((view) => (
              <ListRow
                detail={`${attachmentSummary(view)} - ${
                  buildFarmPlacePath(locations, view.event.placeId) ?? "No place"
                } - ${formatRecordDate(
                  view.event.capturedAt,
                )}`}
                key={view.event.id}
                onPress={() => pushRoute(router, `/farm-events/${view.event.id}`)}
                title={`${FARM_EVENT_TYPE_LABELS[view.event.eventType]}${view.event.note ? `: ${view.event.note}` : ""}`}
              />
            ))}
          </View>
        )}
      </Card>
      <Button label="Record farm note" onPress={() => pushRoute(router, "/farm-events/new")} />
    </Screen>
  );
}

function isWithinDateFilter(value: string, filter: DateFilter): boolean {
  if (filter === "all") {
    return true;
  }

  const capturedAt = new Date(value);
  if (Number.isNaN(capturedAt.getTime())) {
    return true;
  }

  const now = new Date();
  if (filter === "today") {
    return capturedAt.toDateString() === now.toDateString();
  }

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  return capturedAt >= sevenDaysAgo;
}

function attachmentSummary(view: FarmEventView): string {
  const voiceCount = view.attachments.filter((attachment) => attachment.kind === "voiceMemo").length;
  const photoCount = view.attachments.filter((attachment) => attachment.kind === "photo").length;
  const parts = [];

  if (voiceCount) {
    parts.push(`${voiceCount} voice memo${voiceCount === 1 ? "" : "s"}`);
  }

  if (photoCount) {
    parts.push(`${photoCount} photo${photoCount === 1 ? "" : "s"}`);
  }

  return parts.join(", ");
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.sm,
  },
  muted: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
});
