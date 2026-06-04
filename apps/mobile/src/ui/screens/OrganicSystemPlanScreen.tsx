import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import { createOrganicSystemPlanReport } from "../../application/use-cases/manage-organic-certification/CreateOrganicSystemPlanReports";
import { saveOrganicSystemPlanSection } from "../../application/use-cases/manage-organic-certification/ManageOrganicSystemPlan";
import { ensureOrganicCertificationPlan } from "../../application/use-cases/manage-planning/CreateOrganicCertificationPlan";
import { savePlanningTask } from "../../application/use-cases/manage-planning/ManagePlanning";
import type { Farm } from "../../domain/farm/Farm";
import {
  ORGANIC_OSP_SECTION_TYPE_LABELS,
  ORGANIC_OSP_SECTION_TYPES,
  ORGANIC_READINESS_STATUS_LABELS,
  ORGANIC_READINESS_STATUSES,
  type OrganicOspSectionType,
  type OrganicReadinessStatus,
  type OrganicSystemPlanSection,
} from "../../domain/organic/OrganicSystemPlan";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import {
  PLANNING_TASK_STATUS_LABELS,
  PLANNING_TASK_STATUSES,
  type PlanningGoal,
  type PlanningTask,
  type PlanningTaskStatus,
} from "../../domain/planning/Planning";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DateField } from "../components/DateField";
import { FormField } from "../components/FormField";
import { OrganicDashboardButton } from "../components/OrganicDashboardButton";
import { OrganicEvidencePanel } from "../components/OrganicEvidencePanel";
import { OrganicFarmEventPrompt } from "../components/OrganicFarmEventPrompt";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";

export function OrganicSystemPlanScreen({
  farm,
  farmEventRepository,
  planningRepository,
  repository,
}: {
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  planningRepository: PlanningRepository;
  repository: OrganicCertificationRepository;
}) {
  const [sections, setSections] = useState<OrganicSystemPlanSection[]>([]);
  const [certificationGoals, setCertificationGoals] = useState<PlanningGoal[]>([]);
  const [certificationTasks, setCertificationTasks] = useState<PlanningTask[]>([]);
  const [editingSectionId, setEditingSectionId] = useState("");
  const [sectionType, setSectionType] = useState<OrganicOspSectionType>("practicesProcedures");
  const [title, setTitle] = useState("");
  const [narrative, setNarrative] = useState("");
  const [sectionReadinessStatus, setSectionReadinessStatus] = useState<OrganicReadinessStatus>("needsWork");
  const [evidenceText, setEvidenceText] = useState("");
  const [taskGoalId, setTaskGoalId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskStatus, setTaskStatus] = useState<PlanningTaskStatus>("notStarted");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [report, setReport] = useState<string | undefined>();

  async function loadSections() {
    setSections(await repository.listOrganicSystemPlanSections(farm.id));
    await ensureOrganicCertificationPlan(
      { farmId: farm.id },
      { clock: systemClock, idGenerator: localIdGenerator, repository: planningRepository },
    );
    const [goals, templateTasks, farmerCertificationTasks] = await Promise.all([
      planningRepository.listGoals(farm.id, { category: "organicCertification", source: "organicCertificationTemplate" }),
      planningRepository.listTasks(farm.id, { source: "organicCertificationTemplate" }),
      planningRepository.listTasks(farm.id, { source: "organicCertification" }),
    ]);
    setCertificationGoals(goals);
    setCertificationTasks(uniqueById([...templateTasks, ...farmerCertificationTasks]));
  }

  useEffect(() => {
    loadSections();
  }, [farm.id, planningRepository, repository]);

  function beginEdit(section: OrganicSystemPlanSection) {
    setEditingSectionId(section.id);
    setSectionType(section.sectionType);
    setTitle(section.title);
    setNarrative(section.narrative);
    setSectionReadinessStatus(section.readinessStatus);
    setEvidenceText(section.evidenceAttachmentIds.join("\n"));
  }

  function resetSectionForm() {
    setEditingSectionId("");
    setSectionType("practicesProcedures");
    setTitle("");
    setNarrative("");
    setSectionReadinessStatus("needsWork");
    setEvidenceText("");
  }

  function message(caught: unknown, fallback: string) {
    return caught instanceof z.ZodError ? caught.issues[0]?.message : fallback;
  }

  async function handleSaveSection() {
    setError(undefined);
    try {
      await saveOrganicSystemPlanSection(
        { farmId: farm.id, id: editingSectionId || undefined, sectionType, title, narrative, readinessStatus: sectionReadinessStatus, evidenceAttachmentIdsText: evidenceText },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      resetSectionForm();
      await loadSections();
    } catch (caught) {
      setError(message(caught, "OSP section could not be saved."));
    }
  }

  async function handleSaveCertificationTask() {
    setError(undefined);
    try {
      await savePlanningTask(
        {
          farmId: farm.id,
          goalId: taskGoalId,
          title: taskTitle,
          notes: taskNotes,
          status: taskStatus,
          priority: "normal",
          dueDate: taskDueDate,
          source: "organicCertification",
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository: planningRepository },
      );
      setTaskTitle("");
      setTaskNotes("");
      setTaskStatus("notStarted");
      setTaskDueDate("");
      await loadSections();
    } catch (caught) {
      setError(message(caught, "Certification task could not be saved."));
    }
  }

  async function handleReport(reportType: "ospDraft" | "inspectionReadiness") {
    setReport(await createOrganicSystemPlanReport({ farm, reportType }, { clock: systemClock, planningRepository, repository }));
  }

  return (
    <Screen>
      <PageHeader eyebrow="Organic Certification" supportingText="Draft local OSP notes and inspection-preparation tasks for certifier review." title="Organic system plan" />
      <OrganicDashboardButton />
      <OrganicEvidencePanel category="osp" farm={farm} farmEventRepository={farmEventRepository} repository={repository} />
      <Card>
        <SectionHeading detail="Use your certifier's forms for formal submission. These local notes help gather the pieces." title="OSP section" />
        <OrganicFarmEventPrompt category="osp" />
        {sections.map((section) => (
          <View key={section.id} style={styles.row}>
            <View style={styles.textBlock}>
              <Text style={styles.title}>{section.title}</Text>
              <Text style={styles.detail}>{ORGANIC_OSP_SECTION_TYPE_LABELS[section.sectionType]} - {ORGANIC_READINESS_STATUS_LABELS[section.readinessStatus]}</Text>
            </View>
            <Button label="Edit" onPress={() => beginEdit(section)} size="large" variant="secondary" />
            {editingSectionId === section.id ? (
              <OspSectionForm
                evidenceText={evidenceText}
                narrative={narrative}
                readinessStatus={sectionReadinessStatus}
                sectionType={sectionType}
                title={title}
                onCancel={resetSectionForm}
                onEvidenceTextChange={setEvidenceText}
                onNarrativeChange={setNarrative}
                onReadinessStatusChange={(value) => setSectionReadinessStatus(value as OrganicReadinessStatus)}
                onSave={handleSaveSection}
                onSectionTypeChange={(value) => setSectionType(value as OrganicOspSectionType)}
                onTitleChange={setTitle}
                saveLabel="Save OSP section changes"
              />
            ) : null}
          </View>
        ))}
        {!editingSectionId ? (
          <OspSectionForm
            evidenceText={evidenceText}
            narrative={narrative}
            readinessStatus={sectionReadinessStatus}
            sectionType={sectionType}
            title={title}
            onEvidenceTextChange={setEvidenceText}
            onNarrativeChange={setNarrative}
            onReadinessStatusChange={(value) => setSectionReadinessStatus(value as OrganicReadinessStatus)}
            onSave={handleSaveSection}
            onSectionTypeChange={(value) => setSectionType(value as OrganicOspSectionType)}
            onTitleChange={setTitle}
            saveLabel="Save OSP section"
          />
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>
      <Card>
        <SectionHeading
          detail="Certification tasks use the shared planning foundation, but stay here in the certification workflow."
          title="Certification task"
        />
        {certificationTasks.slice(0, 4).map((task) => (
          <Text key={task.id} style={styles.detail}>{task.title} - {PLANNING_TASK_STATUS_LABELS[task.status]}</Text>
        ))}
        <SelectField label="Certification subgoal" onChange={setTaskGoalId} options={[{ label: "Choose subgoal", value: "" }, ...certificationGoals.filter((goal) => goal.parentGoalId).map((goal) => ({ label: goal.title, value: goal.id }))]} value={taskGoalId} />
        <FormField label="Task" multiline onChangeText={setTaskTitle} placeholder="What should be ready before inspection?" value={taskTitle} />
        <SelectField label="Task status" onChange={(value) => setTaskStatus(value as PlanningTaskStatus)} options={PLANNING_TASK_STATUSES.map((status) => ({ label: PLANNING_TASK_STATUS_LABELS[status], value: status }))} value={taskStatus} />
        <DateField label="Due date" onChangeText={setTaskDueDate} placeholder="YYYY-MM-DD or leave blank" value={taskDueDate} />
        <FormField label="Notes" multiline onChangeText={setTaskNotes} placeholder="Documents to find, questions for certifier, missing records" value={taskNotes} />
        <Button label="Save certification task" onPress={handleSaveCertificationTask} size="large" variant="secondary" />
      </Card>
      <Card>
        <SectionHeading title="OSP and inspection reports" />
        <View style={styles.buttons}>
          <Button label="OSP Draft Summary" onPress={() => handleReport("ospDraft")} size="large" variant="secondary" />
          <Button label="Inspection Prep Report" onPress={() => handleReport("inspectionReadiness")} size="large" variant="secondary" />
        </View>
        {report ? <Text style={styles.report}>{report}</Text> : null}
      </Card>
    </Screen>
  );
}

function OspSectionForm({
  evidenceText,
  narrative,
  readinessStatus,
  saveLabel,
  sectionType,
  title,
  onCancel,
  onEvidenceTextChange,
  onNarrativeChange,
  onReadinessStatusChange,
  onSave,
  onSectionTypeChange,
  onTitleChange,
}: {
  evidenceText: string;
  narrative: string;
  readinessStatus: OrganicReadinessStatus;
  saveLabel: string;
  sectionType: OrganicOspSectionType;
  title: string;
  onCancel?: () => void;
  onEvidenceTextChange: (value: string) => void;
  onNarrativeChange: (value: string) => void;
  onReadinessStatusChange: (value: string) => void;
  onSave: () => void;
  onSectionTypeChange: (value: string) => void;
  onTitleChange: (value: string) => void;
}) {
  return (
    <View style={styles.inlineEdit}>
      <SelectField label="OSP section type" onChange={onSectionTypeChange} options={ORGANIC_OSP_SECTION_TYPES.map((type) => ({ label: ORGANIC_OSP_SECTION_TYPE_LABELS[type], value: type }))} value={sectionType} />
      <FormField label="Section title" onChangeText={onTitleChange} placeholder="Crop rotation monitoring, input review, recordkeeping" value={title} />
      <FormField label="Narrative" multiline onChangeText={onNarrativeChange} placeholder="Describe the practice, frequency, records, and monitoring notes." value={narrative} />
      <SelectField label="Readiness status" onChange={onReadinessStatusChange} options={ORGANIC_READINESS_STATUSES.map((status) => ({ label: ORGANIC_READINESS_STATUS_LABELS[status], value: status }))} value={readinessStatus} />
      <FormField label="Evidence IDs or local references" multiline onChangeText={onEvidenceTextChange} placeholder="Photos, notes, labels, logs, reports" value={evidenceText} />
      <Button label={saveLabel} onPress={onSave} size="large" />
      {onCancel ? <Button label="Cancel edit" onPress={onCancel} size="large" variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: theme.spacing.sm },
  detail: { color: theme.colors.textSecondary, fontSize: theme.typography.body, lineHeight: 22 },
  error: { color: theme.colors.error, fontSize: theme.typography.small, lineHeight: 20 },
  inlineEdit: { gap: theme.spacing.sm },
  report: { color: theme.colors.textPrimary, fontSize: theme.typography.small, lineHeight: 20 },
  row: { borderColor: theme.colors.border, borderRadius: theme.radius.sm, borderWidth: 1, gap: theme.spacing.sm, padding: theme.spacing.sm },
  textBlock: { gap: 2 },
  title: { color: theme.colors.textPrimary, fontSize: theme.typography.body, fontWeight: "700" },
});

function uniqueById<T extends { id: string }>(records: T[]): T[] {
  return [...new Map(records.map((record) => [record.id, record])).values()];
}
