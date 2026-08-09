import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import type { ExportRepository } from "../../application/ports/ExportRepository";
import { createOrganicReportPackage } from "../../application/use-cases/manage-organic-certification/CreateOrganicReportPackage";
import { createOrganicReportPackagePdf } from "../../application/use-cases/manage-organic-certification/CreateOrganicReportPackagePdf";
import { listOrganicEvidenceLinkViews, type OrganicEvidenceLinkView } from "../../application/use-cases/manage-organic-certification/ListOrganicEvidence";
import type { Farm } from "../../domain/farm/Farm";
import type { OrganicOperationProfile } from "../../domain/organic/OrganicCertification";
import { ORGANIC_EVIDENCE_CATEGORIES, ORGANIC_EVIDENCE_CATEGORY_LABELS } from "../../domain/organic/OrganicEvidenceLink";
import {
  ORGANIC_REPORT_PACKAGE_TYPE_LABELS,
  ORGANIC_REPORT_PACKAGE_TYPES,
  type OrganicReportPackage,
  type OrganicReportPackageType,
} from "../../domain/organic/OrganicReportPackage";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { OrganicDashboardButton } from "../components/OrganicDashboardButton";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";

export function OrganicReportPackagesScreen({
  farm,
  farmEventRepository,
  farmReferenceRepository,
  exportRepository,
  planningRepository,
  repository,
}: {
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  farmReferenceRepository: FarmReferenceRepository;
  exportRepository: ExportRepository;
  planningRepository: PlanningRepository;
  repository: OrganicCertificationRepository;
}) {
  const [packages, setPackages] = useState<OrganicReportPackage[]>([]);
  const [profile, setProfile] = useState<OrganicOperationProfile | null>(null);
  const [links, setLinks] = useState<OrganicEvidenceLinkView[]>([]);
  const [packageType, setPackageType] = useState<OrganicReportPackageType>("inspectionPrep");
  const [title, setTitle] = useState("Organic inspection package");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [preview, setPreview] = useState<string | undefined>();

  async function loadPackages() {
    const [nextPackages, nextProfile, nextLinks] = await Promise.all([
      repository.listOrganicReportPackages(farm.id),
      repository.getProfile(farm.id),
      listOrganicEvidenceLinkViews({ farmId: farm.id }, { farmEventRepository, repository }),
    ]);
    setPackages(nextPackages);
    setProfile(nextProfile);
    setLinks(nextLinks);
  }

  useEffect(() => {
    loadPackages();
  }, [farm.id, repository]);

  async function handleCreatePackage() {
    setError(undefined);
    try {
      const created = await createOrganicReportPackage(
        { farm, farmId: farm.id, packageType, title, notes },
        { clock: systemClock, farmEventRepository, farmReferenceRepository, idGenerator: localIdGenerator, planningRepository, repository },
      );
      setPreview(created.packageText);
      await loadPackages();
    } catch (caught) {
      setError(caught instanceof z.ZodError ? caught.issues[0]?.message : "Organic report package could not be created.");
    }
  }

  async function handleExportPdf(reportPackage: OrganicReportPackage) {
    setError(undefined);
    try {
      const pdf = createOrganicReportPackagePdf(reportPackage);
      const file = await exportRepository.writePdf({ fileName: pdf.fileName, bytes: pdf.bytes });
      await exportRepository.shareRecoveryCopy(file);
    } catch {
      setError("Organic report package PDF could not be exported.");
    }
  }

  return (
    <Screen>
      <PageHeader eyebrow="Organic Certification" supportingText="Review renewal and inspection evidence, then generate local report packages from records saved on this device." title="Certification reporting" />
      <OrganicDashboardButton />
      <Card rootLevelHeader>
        <SectionHeading detail="Preview the local annual renewal report before adding it to a package." title="Annual renewal report" />
        <Text style={styles.detail}>Annual update: {profile?.annualUpdateDueDate ?? "Not recorded"}</Text>
        <Text style={styles.detail}>Inspection window: {profile?.inspectionDueWindow ?? "Not recorded"}</Text>
        <Text style={styles.detail}>{links.length} linked farm event{links.length === 1 ? "" : "s"} available for renewal review.</Text>
      </Card>
      <Card rootLevelHeader>
        <SectionHeading detail="Preview the local inspection-day report before adding it to a package." title="Inspection day report" />
        {ORGANIC_EVIDENCE_CATEGORIES.map((category) => {
          const count = links.filter((view) => view.link.category === category).length;
          return (
            <View key={category} style={styles.row}>
              <Text style={styles.title}>{ORGANIC_EVIDENCE_CATEGORY_LABELS[category]}</Text>
              <Text style={styles.detail}>{count} linked farm event{count === 1 ? "" : "s"}</Text>
            </View>
          );
        })}
      </Card>
      <Card rootLevelHeader>
        <SectionHeading detail="This creates a local package record and report text. Use your certifier's instructions for formal submission." title="Create package" />
        <SelectField label="Package type" onChange={(value) => setPackageType(value as OrganicReportPackageType)} options={ORGANIC_REPORT_PACKAGE_TYPES.map((type) => ({ label: ORGANIC_REPORT_PACKAGE_TYPE_LABELS[type], value: type }))} value={packageType} />
        <FormField label="Package title" onChangeText={setTitle} value={title} />
        <FormField label="Notes" multiline onChangeText={setNotes} placeholder="Optional context for this package" value={notes} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Create organic report package" onPress={handleCreatePackage} size="large" />
      </Card>
      <Card rootLevelHeader>
        <SectionHeading detail="Review report packages generated and saved on this device." title="Saved packages" />
        {packages.length === 0 ? (
          <Text style={styles.detail}>No report packages yet.</Text>
        ) : (
          packages.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.detail}>{ORGANIC_REPORT_PACKAGE_TYPE_LABELS[item.packageType]} - {item.generatedAt}</Text>
              <Text style={styles.detail}>{item.reportNames.length} reports</Text>
              <Button label="Preview" onPress={() => setPreview(item.packageText)} size="large" variant="secondary" />
              <Button label="Export PDF" onPress={() => handleExportPdf(item)} size="large" variant="secondary" />
            </View>
          ))
        )}
      </Card>
      {preview ? (
        <Card>
          <SectionHeading title="Package preview" />
          <Text style={styles.report}>{preview}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  detail: { color: theme.colors.textSecondary, fontSize: theme.typography.body, lineHeight: 22 },
  error: { color: theme.colors.error, fontSize: theme.typography.small, lineHeight: 20 },
  report: { color: theme.colors.textPrimary, fontSize: theme.typography.small, lineHeight: 20 },
  row: { borderColor: theme.colors.border, borderRadius: theme.radius.sm, borderWidth: 1, gap: theme.spacing.sm, padding: theme.spacing.sm },
  title: { color: theme.colors.textPrimary, fontSize: theme.typography.body, fontWeight: "700" },
});
