import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import type { Farm } from "../../domain/farm/Farm";
import type { LocalActivityRecordView, LocalRecordRepository } from "../../application/ports/LocalRecordRepository";
import { listLocalActivityHistory } from "../../application/use-cases/view-local-history/ListLocalActivityHistory";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ListRow } from "../components/ListRow";
import { LocalSaveConfirmation } from "../components/LocalSaveConfirmation";
import { PageHeader } from "../components/PageHeader";
import { PrivateDataNotice } from "../components/PrivateDataNotice";
import { Screen } from "../components/Screen";
import { SectionHeading } from "../components/SectionHeading";
import { getActivityDetail, getActivityTitle } from "../formatters";
import { theme } from "../theme/theme";
import { pushRoute } from "../navigation";

const savedMessages: Record<string, string> = {
  harvest: "Harvest saved on this device",
  "material-use": "Material use saved on this device",
  "inventory-count": "Inventory count saved on this device",
};

export function ActivityHistoryScreen({
  farm,
  localRecordRepository,
}: {
  farm: Farm;
  localRecordRepository: LocalRecordRepository;
}) {
  const router = useRouter();
  const params = useLocalSearchParams<{ saved?: string }>();
  const [records, setRecords] = useState<LocalActivityRecordView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      setRecords(await listLocalActivityHistory(farm.id, localRecordRepository));
      setIsLoading(false);
    }
    loadHistory();
  }, [farm.id, localRecordRepository]);

  return (
    <Screen>
      <PageHeader
        eyebrow="Local history"
        supportingText="Review harvests, material use, and inventory counts saved privately on this device."
        title="Activity history"
      />
      {params.saved && savedMessages[params.saved] ? (
        <LocalSaveConfirmation message={savedMessages[params.saved]} />
      ) : null}
      <PrivateDataNotice text="These records are not sent anywhere unless you create and share a recovery copy." />
      <Card>
        <SectionHeading title="Saved activity" />
        {isLoading ? (
          <Text style={styles.muted}>Loading local activity...</Text>
        ) : records.length === 0 ? (
          <EmptyState text="No farm activity recorded yet. Record a harvest, material use, or inventory count to begin building your local history." />
        ) : (
          records.map((view) => (
            <ListRow
              detail={getActivityDetail(view)}
              key={`${view.record.kind}:${view.record.id}`}
              onPress={() => pushRoute(router, `/activity/${view.record.kind}/${view.record.id}`)}
              title={getActivityTitle(view)}
            />
          ))
        )}
      </Card>
      <Button label="Record harvest" onPress={() => pushRoute(router, "/harvest/new")} />
      <Button label="Record material use" onPress={() => pushRoute(router, "/material-use/new")} variant="secondary" />
      <Button label="Record inventory count" onPress={() => pushRoute(router, "/inventory-count/new")} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
});
