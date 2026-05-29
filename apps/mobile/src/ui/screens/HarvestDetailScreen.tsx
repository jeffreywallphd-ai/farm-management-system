import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import type { Farm } from "../../domain/farm/Farm";
import type { HarvestRecordView, LocalRecordRepository } from "../../application/ports/LocalRecordRepository";
import { getHarvestDetail } from "../../application/use-cases/get-harvest-detail/GetHarvestDetail";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { PrivateDataNotice } from "../components/PrivateDataNotice";
import { Screen } from "../components/Screen";
import { SectionHeading } from "../components/SectionHeading";
import { formatHarvestQuantity, formatRecordDate } from "../formatters";
import { theme } from "../theme/theme";
import { replaceRoute } from "../navigation";

export function HarvestDetailScreen({
  farm,
  harvestId,
  localRecordRepository,
}: {
  farm: Farm;
  harvestId: string;
  localRecordRepository: LocalRecordRepository;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<HarvestRecordView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      setIsLoading(true);
      setDetail(await getHarvestDetail({ farmId: farm.id, id: harvestId }, localRecordRepository));
      setIsLoading(false);
    }

    loadDetail();
  }, [farm.id, harvestId, localRecordRepository]);

  return (
    <Screen>
      <PageHeader eyebrow="Harvest" title="Harvest details" />
      <PrivateDataNotice text="This confirmed harvest is saved locally and remains private on this device." />
      <Card>
        {isLoading ? (
          <Text style={styles.muted}>Loading harvest...</Text>
        ) : detail ? (
          <>
            <SectionHeading title={detail.crop.name} />
            <DetailLine label="Amount" value={formatHarvestQuantity(detail)} />
            <DetailLine label="Location" value={detail.sourceLocation.name} />
            <DetailLine label="Date" value={formatRecordDate(detail.record.effectiveAt)} />
            <DetailLine label="Status" value="Saved on this device" />
            {detail.record.note ? <DetailLine label="Note" value={detail.record.note} /> : null}
          </>
        ) : (
          <EmptyState text="This harvest could not be found on this device." />
        )}
      </Card>
      <Button label="Back to harvest history" onPress={() => replaceRoute(router, "/harvest")} variant="secondary" />
    </Screen>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    fontWeight: "700",
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  muted: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
});
