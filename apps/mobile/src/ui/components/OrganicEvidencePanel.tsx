import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import { listOrganicEvidenceLinkViews, type OrganicEvidenceLinkView } from "../../application/use-cases/manage-organic-certification/ListOrganicEvidence";
import type { Farm } from "../../domain/farm/Farm";
import { ORGANIC_EVIDENCE_CATEGORY_LABELS, type OrganicEvidenceCategory } from "../../domain/organic/OrganicEvidenceLink";
import { formatRecordDate } from "../formatters";
import { pushRoute } from "../navigation";
import { theme } from "../theme/theme";
import { Button } from "./Button";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { SectionHeading } from "./SectionHeading";

export function OrganicEvidencePanel({
  category,
  farm,
  farmEventRepository,
  repository,
}: {
  category: OrganicEvidenceCategory;
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  repository: OrganicCertificationRepository;
}) {
  const router = useRouter();
  const [links, setLinks] = useState<OrganicEvidenceLinkView[]>([]);

  useEffect(() => {
    listOrganicEvidenceLinkViews({ farmId: farm.id, category }, { farmEventRepository, repository }).then(setLinks);
  }, [category, farm.id, farmEventRepository, repository]);

  return (
    <Card>
      <SectionHeading
        detail="Quick record a voice/photo farm event when this area needs support. Saved events appear here as local evidence links."
        title={`${ORGANIC_EVIDENCE_CATEGORY_LABELS[category]} evidence`}
      />
      <Button
        label="Record farm event for this requirement"
        onPress={() => pushRoute(router, `/farm-events/new?organicCategory=${encodeURIComponent(category)}`)}
        size="large"
      />
      {links.length ? (
        links.slice(0, 5).map((view) => (
          <View key={view.link.id} style={styles.row}>
            <Text style={styles.title}>{view.farmEvent ? formatRecordDate(view.farmEvent.event.capturedAt) : "Farm event missing"}</Text>
            {view.link.notes ? <Text style={styles.detail}>{view.link.notes}</Text> : null}
            {view.farmEvent ? (
              <Button label="Open farm event" onPress={() => pushRoute(router, `/farm-events/${view.farmEvent?.event.id}`)} size="large" variant="secondary" />
            ) : null}
          </View>
        ))
      ) : (
        <EmptyState text="No quick-recorded farm events are linked to this requirement yet." />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  detail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  row: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
});
