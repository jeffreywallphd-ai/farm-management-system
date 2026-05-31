import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import type { Farm } from "../../domain/farm/Farm";
import type {
  HarvestRecordView,
  InventoryCountRecordView,
  LocalActivityRecordView,
  LocalRecordRepository,
  MaterialUseRecordView,
} from "../../application/ports/LocalRecordRepository";
import type { OperationalRecordKind } from "../../domain/records/OperationalRecord";
import { getLocalActivityDetail } from "../../application/use-cases/view-local-history/GetLocalActivityDetail";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SectionHeading } from "../components/SectionHeading";
import { formatQuantity, formatRecordDate, getActivityKindLabel } from "../formatters";
import { theme } from "../theme/theme";
import { replaceRoute } from "../navigation";

export function ActivityDetailScreen({
  farm,
  kind,
  recordId,
  localRecordRepository,
}: {
  farm: Farm;
  kind: OperationalRecordKind;
  recordId: string;
  localRecordRepository: LocalRecordRepository;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<LocalActivityRecordView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      setIsLoading(true);
      setDetail(await getLocalActivityDetail({ farmId: farm.id, kind, id: recordId }, localRecordRepository));
      setIsLoading(false);
    }
    loadDetail();
  }, [farm.id, kind, recordId, localRecordRepository]);

  return (
    <Screen>
      <PageHeader eyebrow={getActivityKindLabel(kind)} title="Activity details" />
      <Card>
        {isLoading ? (
          <Text style={styles.muted}>Loading activity...</Text>
        ) : detail ? (
          <ActivityDetailContent detail={detail} />
        ) : (
          <EmptyState text="This activity could not be found on this device." />
        )}
      </Card>
      <Button label="Back to activity history" onPress={() => replaceRoute(router, "/activity")} variant="secondary" />
    </Screen>
  );
}

function ActivityDetailContent({ detail }: { detail: LocalActivityRecordView }) {
  if (detail.record.kind === "HarvestRecorded") {
    const harvest = detail as HarvestRecordView;
    return (
      <>
        <SectionHeading title={harvest.crop.name} />
        <DetailLine label="Record type" value="Harvest" />
        <DetailLine label="Amount" value={formatQuantity(harvest.record.quantity)} />
        <DetailLine label="Location" value={harvest.sourceLocation.name} />
        <DetailLine label="Date" value={formatRecordDate(harvest.record.effectiveAt)} />
        <DetailLine label="Status" value="Local record" />
        {harvest.record.note ? <DetailLine label="Note" value={harvest.record.note} /> : null}
      </>
    );
  }

  if (detail.record.kind === "MaterialUseRecorded") {
    const materialUse = detail as MaterialUseRecordView;
    return (
      <>
        <SectionHeading title={materialUse.material.name} />
        <DetailLine label="Record type" value="Material use" />
        <DetailLine label="Amount" value={formatQuantity(materialUse.record.quantity)} />
        <DetailLine label="Location" value={materialUse.useLocation?.name ?? "No location"} />
        <DetailLine label="Date" value={formatRecordDate(materialUse.record.effectiveAt)} />
        <DetailLine label="Status" value="Local record" />
        {materialUse.record.note ? <DetailLine label="Note" value={materialUse.record.note} /> : null}
      </>
    );
  }

  const inventoryCount = detail as InventoryCountRecordView;
  return (
    <>
      <SectionHeading title={inventoryCount.trackedItem.name} />
      <DetailLine label="Record type" value="Inventory count" />
      <DetailLine label="Observed count" value={formatQuantity(inventoryCount.record.observedQuantity)} />
      <DetailLine label="Location" value={inventoryCount.location?.name ?? "No location"} />
      <DetailLine label="Date" value={formatRecordDate(inventoryCount.record.effectiveAt)} />
      <DetailLine label="Status" value="Local record" />
      {inventoryCount.record.note ? <DetailLine label="Note" value={inventoryCount.record.note} /> : null}
    </>
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
