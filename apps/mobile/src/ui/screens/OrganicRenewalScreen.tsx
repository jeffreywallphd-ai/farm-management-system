import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import { listOrganicEvidenceLinkViews, type OrganicEvidenceLinkView } from "../../application/use-cases/manage-organic-certification/ListOrganicEvidence";
import type { Farm } from "../../domain/farm/Farm";
import type { OrganicOperationProfile } from "../../domain/organic/OrganicCertification";
import { ORGANIC_EVIDENCE_CATEGORY_LABELS } from "../../domain/organic/OrganicEvidenceLink";
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

const renewalCategories = ["inputs", "seeds", "soil", "pest", "traceability", "osp", "inspection"] as const;

export function OrganicRenewalScreen({
  farm,
  farmEventRepository,
  repository,
}: {
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  repository: OrganicCertificationRepository;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<OrganicOperationProfile | null>(null);
  const [links, setLinks] = useState<OrganicEvidenceLinkView[]>([]);

  useEffect(() => {
    Promise.all([
      repository.getProfile(farm.id),
      listOrganicEvidenceLinkViews({ farmId: farm.id }, { farmEventRepository, repository }),
    ]).then(([nextProfile, nextLinks]) => {
      setProfile(nextProfile);
      setLinks(nextLinks);
    });
  }, [farm.id, farmEventRepository, repository]);

  return (
    <Screen>
      <PageHeader
        eyebrow="Organic Certification"
        supportingText="Review annual-update evidence from the farm notes and organic records already saved locally."
        title="Annual renewal"
      />
      <OrganicDashboardButton />
      <Card>
        <SectionHeading title="Renewal dates" />
        <Text style={styles.body}>Annual update: {profile?.annualUpdateDueDate ?? "Not recorded"}</Text>
        <Text style={styles.body}>Inspection window: {profile?.inspectionDueWindow ?? "Not recorded"}</Text>
      </Card>
      <Card>
        <SectionHeading title="Evidence by renewal area" />
        {renewalCategories.map((category) => {
          const count = links.filter((view) => view.link.category === category).length;
          return (
            <View key={category} style={styles.row}>
              <Text style={styles.title}>{ORGANIC_EVIDENCE_CATEGORY_LABELS[category]}</Text>
              <Text style={styles.body}>{count ? `${count} linked farm note${count === 1 ? "" : "s"}` : "No linked farm notes yet"}</Text>
            </View>
          );
        })}
      </Card>
      <Card>
        <SectionHeading title="Recent linked farm notes" />
        {links.length ? (
          links.slice(0, 8).map((view) => (
            <View key={view.link.id} style={styles.row}>
              <Text style={styles.title}>{ORGANIC_EVIDENCE_CATEGORY_LABELS[view.link.category]}</Text>
              <Text style={styles.body}>{view.farmEvent ? formatRecordDate(view.farmEvent.event.capturedAt) : "Farm note missing"}</Text>
              {view.link.notes ? <Text style={styles.body}>{view.link.notes}</Text> : null}
              {view.farmEvent ? (
                <Button label="Open note" onPress={() => pushRoute(router, `/farm-events/${view.farmEvent?.event.id}`)} size="large" variant="secondary" />
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState text="Link farm notes as organic evidence before annual renewal review." />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: theme.colors.textSecondary, fontSize: theme.typography.body, lineHeight: 22 },
  row: { borderColor: theme.colors.border, borderRadius: theme.radius.sm, borderWidth: 1, gap: theme.spacing.sm, padding: theme.spacing.sm },
  title: { color: theme.colors.textPrimary, fontSize: theme.typography.body, fontWeight: "700" },
});
