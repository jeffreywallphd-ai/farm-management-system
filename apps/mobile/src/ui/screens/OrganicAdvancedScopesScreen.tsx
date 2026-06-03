import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import { createOrganicAdvancedScopeReport } from "../../application/use-cases/manage-organic-certification/CreateOrganicAdvancedScopeReports";
import { saveOrganicAdvancedScopeRecord } from "../../application/use-cases/manage-organic-certification/ManageOrganicAdvancedScopes";
import type { Farm } from "../../domain/farm/Farm";
import {
  ORGANIC_ADVANCED_SCOPE_TYPE_LABELS,
  ORGANIC_ADVANCED_SCOPE_TYPES,
  type OrganicAdvancedScopeRecord,
  type OrganicAdvancedScopeType,
} from "../../domain/organic/OrganicAdvancedScope";
import {
  ORGANIC_READINESS_STATUS_LABELS,
  ORGANIC_READINESS_STATUSES,
  type OrganicReadinessStatus,
} from "../../domain/organic/OrganicSystemPlan";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { OrganicDashboardButton } from "../components/OrganicDashboardButton";
import { OrganicEvidencePanel } from "../components/OrganicEvidencePanel";
import { OrganicFarmEventPrompt } from "../components/OrganicFarmEventPrompt";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";

export function OrganicAdvancedScopesScreen({
  farm,
  farmEventRepository,
  repository,
}: {
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  repository: OrganicCertificationRepository;
}) {
  const [records, setRecords] = useState<OrganicAdvancedScopeRecord[]>([]);
  const [editingId, setEditingId] = useState("");
  const [scopeType, setScopeType] = useState<OrganicAdvancedScopeType>("livestock");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [readinessStatus, setReadinessStatus] = useState<OrganicReadinessStatus>("needsWork");
  const [evidenceText, setEvidenceText] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [report, setReport] = useState<string | undefined>();

  async function loadRecords() {
    setRecords(await repository.listOrganicAdvancedScopeRecords(farm.id));
  }

  useEffect(() => {
    loadRecords();
  }, [farm.id, repository]);

  function beginEdit(record: OrganicAdvancedScopeRecord) {
    setEditingId(record.id);
    setScopeType(record.scopeType);
    setTopic(record.topic);
    setDescription(record.description);
    setReadinessStatus(record.readinessStatus);
    setEvidenceText(record.evidenceAttachmentIds.join("\n"));
    setNotes(record.notes ?? "");
  }

  function resetForm() {
    setEditingId("");
    setScopeType("livestock");
    setTopic("");
    setDescription("");
    setReadinessStatus("needsWork");
    setEvidenceText("");
    setNotes("");
  }

  async function handleSave() {
    setError(undefined);
    try {
      await saveOrganicAdvancedScopeRecord(
        { farmId: farm.id, id: editingId || undefined, scopeType, topic, description, readinessStatus, evidenceAttachmentIdsText: evidenceText, notes },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      resetForm();
      await loadRecords();
    } catch (caught) {
      setError(caught instanceof z.ZodError ? caught.issues[0]?.message : "Advanced scope record could not be saved.");
    }
  }

  async function handleReport() {
    setReport(await createOrganicAdvancedScopeReport({ farm }, { clock: systemClock, repository }));
  }

  return (
    <Screen>
      <PageHeader eyebrow="Organic Certification" supportingText="Keep specialty-scope readiness notes local for certifier review." title="Organic advanced scopes" />
      <OrganicDashboardButton />
      <OrganicEvidencePanel category="advancedScope" farm={farm} farmEventRepository={farmEventRepository} repository={repository} />
      <Card>
        <SectionHeading detail="Use this for livestock, wild crops, mushrooms, producer groups, imports, and labeling notes. It does not replace specialty OSP sections or certifier instructions." title="Advanced scope record" />
        <OrganicFarmEventPrompt category="advancedScope" />
        {records.map((record) => (
          <View key={record.id} style={styles.row}>
            <Text style={styles.title}>{ORGANIC_ADVANCED_SCOPE_TYPE_LABELS[record.scopeType]}: {record.topic}</Text>
            <Text style={styles.detail}>{ORGANIC_READINESS_STATUS_LABELS[record.readinessStatus]}</Text>
            <Button label="Edit" onPress={() => beginEdit(record)} size="large" variant="secondary" />
          </View>
        ))}
        <SelectField label="Scope" onChange={(value) => setScopeType(value as OrganicAdvancedScopeType)} options={ORGANIC_ADVANCED_SCOPE_TYPES.map((type) => ({ label: ORGANIC_ADVANCED_SCOPE_TYPE_LABELS[type], value: type }))} value={scopeType} />
        <FormField label="Topic" onChangeText={setTopic} placeholder="Origin records, wild harvest map, import certificate, label claim" value={topic} />
        <FormField label="Description" multiline onChangeText={setDescription} placeholder="What needs to be documented or reviewed?" value={description} />
        <SelectField label="Readiness status" onChange={(value) => setReadinessStatus(value as OrganicReadinessStatus)} options={ORGANIC_READINESS_STATUSES.map((status) => ({ label: ORGANIC_READINESS_STATUS_LABELS[status], value: status }))} value={readinessStatus} />
        <FormField label="Evidence IDs or local references" multiline onChangeText={setEvidenceText} value={evidenceText} />
        <FormField label="Notes" multiline onChangeText={setNotes} value={notes} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={editingId ? "Save advanced scope changes" : "Save advanced scope record"} onPress={handleSave} size="large" />
        {editingId ? <Button label="Cancel edit" onPress={resetForm} size="large" variant="secondary" /> : null}
      </Card>
      <Card>
        <SectionHeading title="Advanced scope report" />
        <Button label="Create advanced scope report" onPress={handleReport} size="large" variant="secondary" />
        {report ? <Text style={styles.report}>{report}</Text> : null}
      </Card>
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
