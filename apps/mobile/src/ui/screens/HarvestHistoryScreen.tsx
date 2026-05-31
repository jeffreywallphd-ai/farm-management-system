import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import type { Farm } from "../../domain/farm/Farm";
import type { HarvestRecordView, LocalRecordRepository } from "../../application/ports/LocalRecordRepository";
import { listHarvestHistory } from "../../application/use-cases/list-harvest-history/ListHarvestHistory";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ListRow } from "../components/ListRow";
import { LocalSaveConfirmation } from "../components/LocalSaveConfirmation";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SectionHeading } from "../components/SectionHeading";
import { formatHarvestQuantity, formatRecordDate } from "../formatters";
import { theme } from "../theme/theme";
import { pushRoute } from "../navigation";

export function HarvestHistoryScreen({
  farm,
  localRecordRepository,
}: {
  farm: Farm;
  localRecordRepository: LocalRecordRepository;
}) {
  const router = useRouter();
  const params = useLocalSearchParams<{ saved?: string }>();
  const [records, setRecords] = useState<HarvestRecordView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      setRecords(await listHarvestHistory(farm.id, localRecordRepository));
      setIsLoading(false);
    }

    loadHistory();
  }, [farm.id, localRecordRepository]);

  return (
    <Screen>
      <PageHeader
        eyebrow="Local history"
        supportingText="Review harvest records saved privately on this device."
        title="Harvest history"
      />
      {params.saved === "1" ? <LocalSaveConfirmation message="Harvest saved on this device" /> : null}
      <Card>
        <SectionHeading title="Saved harvests" />
        {isLoading ? (
          <Text style={styles.muted}>Loading local harvests...</Text>
        ) : records.length === 0 ? (
          <EmptyState text="No harvests recorded yet. Record your first harvest to begin building your local history." />
        ) : (
          records.map((view) => (
            <ListRow
              detail={`${formatHarvestQuantity(view)} from ${view.sourceLocation.name} - ${formatRecordDate(
                view.record.effectiveAt,
              )}`}
              key={view.record.id}
              onPress={() => pushRoute(router, `/harvest/${view.record.id}`)}
              title={view.crop.name}
            />
          ))
        )}
      </Card>
      <Button label="Record harvest" onPress={() => pushRoute(router, "/harvest/new")} />
      <Button label="Create recovery copy" onPress={() => pushRoute(router, "/data-safety/export")} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
});
