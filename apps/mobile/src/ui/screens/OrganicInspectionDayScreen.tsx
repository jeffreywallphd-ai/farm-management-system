import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import { listOrganicEvidenceLinkViews, type OrganicEvidenceLinkView } from "../../application/use-cases/manage-organic-certification/ListOrganicEvidence";
import type { Farm } from "../../domain/farm/Farm";
import { ORGANIC_EVIDENCE_CATEGORY_LABELS, ORGANIC_EVIDENCE_CATEGORIES } from "../../domain/organic/OrganicEvidenceLink";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { OrganicDashboardButton } from "../components/OrganicDashboardButton";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SectionHeading } from "../components/SectionHeading";
import { formatRecordDate } from "../formatters";
import { pushRoute } from "../navigation";
import { theme } from "../theme/theme";

export function OrganicInspectionDayScreen({
  farm,
  farmEventRepository,
  repository,
}: {
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  repository: OrganicCertificationRepository;
}) {
  const router = useRouter();
  const [links, setLinks] = useState<OrganicEvidenceLinkView[]>([]);

  useEffect(() => {
    listOrganicEvidenceLinkViews({ farmId: farm.id }, { farmEventRepository, repository }).then(setLinks);
  }, [farm.id, farmEventRepository, repository]);

  return (
    <Screen>
      <PageHeader
        eyebrow="Organic Certification"
        supportingText="Fast offline access to linked farm-note evidence during inspection conversations."
        title="Inspection day"
      />
      <OrganicDashboardButton />
      <Card rootLevelHeader>
        <SectionHeading detail="Open the main evidence areas that help prepare for inspection review." title="Evidence shortcuts" />
        <View style={styles.shortcutGrid}>
          {ORGANIC_EVIDENCE_CATEGORIES.map((category) => {
            const count = links.filter((view) => view.link.category === category).length;
            return (
              <View key={category} style={styles.shortcut}>
                <Text style={styles.title}>{ORGANIC_EVIDENCE_CATEGORY_LABELS[category]}</Text>
                <Text style={styles.body}>{count} linked</Text>
              </View>
            );
          })}
        </View>
      </Card>
      <Card rootLevelHeader>
        <SectionHeading detail="Review recent farm notes linked as inspection evidence." title="Linked note evidence" />
        {links.length ? (
          links.map((view) => (
            <View key={view.link.id} style={styles.row}>
              <Text style={styles.title}>{ORGANIC_EVIDENCE_CATEGORY_LABELS[view.link.category]}</Text>
              <Text style={styles.body}>{view.farmEvent ? formatRecordDate(view.farmEvent.event.capturedAt) : "Farm note missing"}</Text>
              {view.link.notes ? <Text style={styles.body}>{view.link.notes}</Text> : null}
              {view.farmEvent ? (
                <Button label="Open farm note" onPress={() => pushRoute(router, `/farm-events/${view.farmEvent?.event.id}`)} size="large" variant="secondary" />
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState text="No linked farm-note evidence is ready for inspection day yet." />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: theme.colors.textSecondary, fontSize: theme.typography.body, lineHeight: 22 },
  row: { borderColor: theme.colors.border, borderRadius: theme.radius.sm, borderWidth: 1, gap: theme.spacing.sm, padding: theme.spacing.sm },
  shortcut: { borderColor: theme.colors.border, borderRadius: theme.radius.sm, borderWidth: 1, minWidth: 140, padding: theme.spacing.sm },
  shortcutGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  title: { color: theme.colors.textPrimary, fontSize: theme.typography.body, fontWeight: "700" },
});
