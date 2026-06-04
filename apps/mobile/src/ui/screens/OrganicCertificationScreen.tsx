import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { useRouter } from "expo-router";

import { createOrganicProfileReport } from "../../application/use-cases/manage-organic-certification/CreateOrganicProfileReport";
import { getOrganicCertificationDashboard } from "../../application/use-cases/manage-organic-certification/GetOrganicCertificationDashboard";
import { saveOrganicOperationProfile } from "../../application/use-cases/manage-organic-certification/SaveOrganicOperationProfile";
import { ensureOrganicCertificationPlan } from "../../application/use-cases/manage-planning/CreateOrganicCertificationPlan";
import { savePlanningGoal, savePlanningTask } from "../../application/use-cases/manage-planning/ManagePlanning";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import type { Farm } from "../../domain/farm/Farm";
import {
  ORGANIC_CERTIFICATION_SCOPE_LABELS,
  ORGANIC_CERTIFICATION_SCOPE_TYPES,
  ORGANIC_OPERATION_STATUS_LABELS,
  ORGANIC_OPERATION_STATUSES,
  type OrganicCertificationScope,
  type OrganicCertificationScopeType,
  type OrganicOperationProfile,
  type OrganicOperationStatus,
} from "../../domain/organic/OrganicCertification";
import {
  PLANNING_GOAL_STATUS_LABELS,
  PLANNING_GOAL_STATUSES,
  PLANNING_TASK_PRIORITY_LABELS,
  PLANNING_TASK_STATUS_LABELS,
  PLANNING_TASK_STATUSES,
  type PlanningGoal,
  type PlanningGoalStatus,
  type PlanningTask,
  type PlanningTaskStatus,
} from "../../domain/planning/Planning";
import { defaultRecordRetentionYearsForStatus } from "../../domain/validation/organicCertificationValidation";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CollapsibleCard } from "../components/CollapsibleCard";
import { DateField } from "../components/DateField";
import { FormField } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";
import { replaceRoute } from "../navigation";

export function OrganicCertificationScreen({
  farm,
  planningRepository,
  repository,
}: {
  farm: Farm;
  planningRepository: PlanningRepository;
  repository: OrganicCertificationRepository;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<OrganicOperationProfile | null>(null);
  const [enabledScopes, setEnabledScopes] = useState<OrganicCertificationScope[]>([]);
  const [missingSetupItems, setMissingSetupItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [report, setReport] = useState<string | undefined>();
  const [certificationGoals, setCertificationGoals] = useState<PlanningGoal[]>([]);
  const [certificationTasks, setCertificationTasks] = useState<PlanningTask[]>([]);
  const [editingGoalId, setEditingGoalId] = useState("");
  const [editingGoalTargetDate, setEditingGoalTargetDate] = useState("");
  const [editingGoalStatus, setEditingGoalStatus] = useState<PlanningGoalStatus>("planned");
  const [editingTaskId, setEditingTaskId] = useState("");
  const [editingTaskDueDate, setEditingTaskDueDate] = useState("");
  const [editingTaskStatus, setEditingTaskStatus] = useState<PlanningTaskStatus>("notStarted");
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  const [organicStatus, setOrganicStatus] = useState<OrganicOperationStatus>("transitioning");
  const [selectedScopes, setSelectedScopes] = useState<Set<OrganicCertificationScopeType>>(new Set(["crops"]));
  const [certifierName, setCertifierName] = useState("");
  const [certifierContact, setCertifierContact] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [certificateEffectiveDate, setCertificateEffectiveDate] = useState("");
  const [annualUpdateDueDate, setAnnualUpdateDueDate] = useState("");
  const [inspectionDueWindow, setInspectionDueWindow] = useState("");
  const [recordRetentionYears, setRecordRetentionYears] = useState("5");
  const [notes, setNotes] = useState("");

  async function loadDashboard() {
    setIsLoading(true);
    const dashboard = await getOrganicCertificationDashboard({ farmId: farm.id }, { repository });
    setProfile(dashboard.profile);
    setEnabledScopes(dashboard.enabledScopes);
    setMissingSetupItems(dashboard.missingSetupItems);

    if (dashboard.profile) {
      setOrganicStatus(dashboard.profile.organicStatus);
      setSelectedScopes(new Set(dashboard.enabledScopes.map((scope) => scope.scopeType)));
      setCertifierName(dashboard.profile.certifierName ?? "");
      setCertifierContact(dashboard.profile.certifierContact ?? "");
      setCertificateNumber(dashboard.profile.certificateNumber ?? "");
      setCertificateEffectiveDate(dashboard.profile.certificateEffectiveDate ?? "");
      setAnnualUpdateDueDate(dashboard.profile.annualUpdateDueDate ?? "");
      setInspectionDueWindow(dashboard.profile.inspectionDueWindow ?? "");
      setRecordRetentionYears(String(dashboard.profile.recordRetentionYears));
      setNotes(dashboard.profile.notes ?? "");
      await ensureOrganicCertificationPlan(
        { farmId: farm.id, targetDate: dashboard.profile.annualUpdateDueDate },
        { clock: systemClock, idGenerator: localIdGenerator, repository: planningRepository },
      );
      await loadCertificationPlanning();
    }

    setIsLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, [farm.id, planningRepository, repository]);

  async function loadCertificationPlanning() {
    const [goals, templateTasks, farmerCertificationTasks] = await Promise.all([
      planningRepository.listGoals(farm.id, { category: "organicCertification", source: "organicCertificationTemplate" }),
      planningRepository.listTasks(farm.id, { source: "organicCertificationTemplate" }),
      planningRepository.listTasks(farm.id, { source: "organicCertification" }),
    ]);
    setCertificationGoals(goals);
    setCertificationTasks(uniqueById([...templateTasks, ...farmerCertificationTasks]));
  }

  async function handleSave() {
    setIsSaving(true);
    setError(undefined);
    setReport(undefined);

    try {
      await saveOrganicOperationProfile(
        {
          farmId: farm.id,
          organicStatus,
          certifierName,
          certifierContact,
          certificateNumber,
          certificateEffectiveDate,
          annualUpdateDueDate,
          inspectionDueWindow,
          recordRetentionYears,
          notes,
          enabledScopes: [...selectedScopes],
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      await loadDashboard();
    } catch (caughtError) {
      setError(
        caughtError instanceof z.ZodError
          ? caughtError.issues[0]?.message
          : "Organic certification profile could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function beginEditCertificationGoal(goal: PlanningGoal) {
    setEditingGoalId(goal.id);
    setEditingGoalTargetDate(goal.targetDate ?? "");
    setEditingGoalStatus(goal.status);
  }

  async function handleSaveCertificationGoalTimeline() {
    const goal = certificationGoals.find((candidate) => candidate.id === editingGoalId);
    if (!goal) return;
    await savePlanningGoal(
      { ...goal, targetDate: editingGoalTargetDate, status: editingGoalStatus },
      { clock: systemClock, idGenerator: localIdGenerator, repository: planningRepository },
    );
    setEditingGoalId("");
    await loadCertificationPlanning();
  }

  function beginEditCertificationTask(task: PlanningTask) {
    setEditingTaskId(task.id);
    setEditingTaskDueDate(task.dueDate ?? "");
    setEditingTaskStatus(task.status);
  }

  async function handleSaveCertificationTaskTimeline() {
    const task = certificationTasks.find((candidate) => candidate.id === editingTaskId);
    if (!task) return;
    await savePlanningTask(
      { ...task, dueDate: editingTaskDueDate, status: editingTaskStatus },
      { clock: systemClock, idGenerator: localIdGenerator, repository: planningRepository },
    );
    setEditingTaskId("");
    await loadCertificationPlanning();
  }

  async function handleCreateReport() {
    setError(undefined);

    try {
      setReport(await createOrganicProfileReport({ farm }, { clock: systemClock, repository }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Organic Profile Report could not be created.");
    }
  }

  function handleStatusChange(value: string) {
    const nextStatus = value as OrganicOperationStatus;
    setOrganicStatus(nextStatus);
    setRecordRetentionYears(String(defaultRecordRetentionYearsForStatus(nextStatus)));
  }

  function toggleScope(scopeType: OrganicCertificationScopeType) {
    setSelectedScopes((current) => {
      const next = new Set(current);
      if (next.has(scopeType)) {
        next.delete(scopeType);
      } else {
        next.add(scopeType);
      }
      return next;
    });
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Organic Certification"
        supportingText="Organize USDA organic readiness records locally for certifier review."
        title={profile ? "Organic dashboard" : "Set up organic tracking"}
      />
      {profile ? (
        <CollapsibleCard
          detail="Certifier, scope, renewal, and record-retention setup."
          isExpanded={isProfileExpanded}
          onToggle={() => setIsProfileExpanded((current) => !current)}
          title="Certification profile"
        >
          <OrganicProfileContent
            annualUpdateDueDate={annualUpdateDueDate}
            certificateEffectiveDate={certificateEffectiveDate}
            certificateNumber={certificateNumber}
            certifierContact={certifierContact}
            certifierName={certifierName}
            error={error}
            inspectionDueWindow={inspectionDueWindow}
            isLoading={isLoading}
            isSaving={isSaving}
            notes={notes}
            onAnnualUpdateDueDateChange={setAnnualUpdateDueDate}
            onCertificateEffectiveDateChange={setCertificateEffectiveDate}
            onCertificateNumberChange={setCertificateNumber}
            onCertifierContactChange={setCertifierContact}
            onCertifierNameChange={setCertifierName}
            onInspectionDueWindowChange={setInspectionDueWindow}
            onNotesChange={setNotes}
            onRecordRetentionYearsChange={setRecordRetentionYears}
            onSave={handleSave}
            onStatusChange={handleStatusChange}
            onToggleScope={toggleScope}
            organicStatus={organicStatus}
            profileExists={Boolean(profile)}
            recordRetentionYears={recordRetentionYears}
            selectedScopes={selectedScopes}
          />
        </CollapsibleCard>
      ) : (
        <Card>
          <OrganicProfileContent
            annualUpdateDueDate={annualUpdateDueDate}
            certificateEffectiveDate={certificateEffectiveDate}
            certificateNumber={certificateNumber}
            certifierContact={certifierContact}
            certifierName={certifierName}
            error={error}
            inspectionDueWindow={inspectionDueWindow}
            isLoading={isLoading}
            isSaving={isSaving}
            notes={notes}
            onAnnualUpdateDueDateChange={setAnnualUpdateDueDate}
            onCertificateEffectiveDateChange={setCertificateEffectiveDate}
            onCertificateNumberChange={setCertificateNumber}
            onCertifierContactChange={setCertifierContact}
            onCertifierNameChange={setCertifierName}
            onInspectionDueWindowChange={setInspectionDueWindow}
            onNotesChange={setNotes}
            onRecordRetentionYearsChange={setRecordRetentionYears}
            onSave={handleSave}
            onStatusChange={handleStatusChange}
            onToggleScope={toggleScope}
            organicStatus={organicStatus}
            profileExists={Boolean(profile)}
            recordRetentionYears={recordRetentionYears}
            selectedScopes={selectedScopes}
          />
        </Card>
      )}
      {profile ? (
        <>
          <Card>
            <SectionHeading title="Enabled scopes" />
            {enabledScopes.length > 0 ? (
              enabledScopes.map((scope) => (
                <Text key={scope.scopeType} style={styles.body}>
                  {ORGANIC_CERTIFICATION_SCOPE_LABELS[scope.scopeType]}
                </Text>
              ))
            ) : (
              <Text style={styles.body}>No scopes selected yet.</Text>
            )}
          </Card>
          <Card>
            <SectionHeading title="Upcoming annual update" />
            <Text style={styles.body}>{profile.annualUpdateDueDate ?? "Add the annual update due date when you know it."}</Text>
          </Card>
          <Card>
            <SectionHeading detail="Review annual renewal notes, inspection-day evidence, and saved organic report packages in one place." title="Certification reporting" />
            <Button label="Open certification reporting" onPress={() => replaceRoute(router, "/organic/reports")} size="large" variant="secondary" />
          </Card>
          {organicWorkAreas.map((area) => (
            <Card key={area.route}>
              <SectionHeading detail={area.description} title={area.title} />
              <Button label={area.buttonLabel} onPress={() => replaceRoute(router, area.route)} size="large" variant="secondary" />
            </Card>
          ))}
          <CertificationPlanningCard
            editingGoalId={editingGoalId}
            editingGoalStatus={editingGoalStatus}
            editingGoalTargetDate={editingGoalTargetDate}
            editingTaskDueDate={editingTaskDueDate}
            editingTaskId={editingTaskId}
            editingTaskStatus={editingTaskStatus}
            goals={certificationGoals}
            onEditGoal={beginEditCertificationGoal}
            onEditTask={beginEditCertificationTask}
            onGoalStatusChange={(value) => setEditingGoalStatus(value as PlanningGoalStatus)}
            onGoalTargetDateChange={setEditingGoalTargetDate}
            onOpenBoard={(goalId) => replaceRoute(router, `/planning/boards?goalId=${encodeURIComponent(goalId)}`)}
            onSaveGoal={handleSaveCertificationGoalTimeline}
            onSaveTask={handleSaveCertificationTaskTimeline}
            onTaskDueDateChange={setEditingTaskDueDate}
            onTaskStatusChange={(value) => setEditingTaskStatus(value as PlanningTaskStatus)}
            tasks={certificationTasks}
          />
          <Card>
            <SectionHeading title="Missing setup items" />
            {missingSetupItems.length > 0 ? (
              missingSetupItems.map((item) => (
                <Text key={item} style={styles.warning}>
                  {item}
                </Text>
              ))
            ) : (
              <Text style={styles.body}>Phase 1 profile setup looks complete.</Text>
            )}
          </Card>
          <Card>
            <SectionHeading title="Organic Profile Report" />
            <Button label="Create Organic Profile Report" onPress={handleCreateReport} size="large" variant="secondary" />
            {report ? <Text style={styles.report}>{report}</Text> : null}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

function OrganicProfileContent({
  organicStatus,
  selectedScopes,
  certifierName,
  certifierContact,
  certificateNumber,
  certificateEffectiveDate,
  annualUpdateDueDate,
  inspectionDueWindow,
  recordRetentionYears,
  notes,
  error,
  isLoading,
  isSaving,
  profileExists,
  onStatusChange,
  onToggleScope,
  onCertifierNameChange,
  onCertifierContactChange,
  onCertificateNumberChange,
  onCertificateEffectiveDateChange,
  onAnnualUpdateDueDateChange,
  onInspectionDueWindowChange,
  onRecordRetentionYearsChange,
  onNotesChange,
  onSave,
}: {
  organicStatus: OrganicOperationStatus;
  selectedScopes: Set<OrganicCertificationScopeType>;
  certifierName: string;
  certifierContact: string;
  certificateNumber: string;
  certificateEffectiveDate: string;
  annualUpdateDueDate: string;
  inspectionDueWindow: string;
  recordRetentionYears: string;
  notes: string;
  error?: string;
  isLoading: boolean;
  isSaving: boolean;
  profileExists: boolean;
  onStatusChange: (value: string) => void;
  onToggleScope: (scopeType: OrganicCertificationScopeType) => void;
  onCertifierNameChange: (value: string) => void;
  onCertifierContactChange: (value: string) => void;
  onCertificateNumberChange: (value: string) => void;
  onCertificateEffectiveDateChange: (value: string) => void;
  onAnnualUpdateDueDateChange: (value: string) => void;
  onInspectionDueWindowChange: (value: string) => void;
  onRecordRetentionYearsChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.form}>
      <SectionHeading
        detail="This helps organize records for your certifier. It does not replace certification or provide a legal determination."
        title={profileExists ? "Certification profile" : "Turn on organic tracking"}
      />
      {isLoading ? <Text style={styles.body}>Opening organic profile...</Text> : null}
      <OrganicProfileForm
        annualUpdateDueDate={annualUpdateDueDate}
        certificateEffectiveDate={certificateEffectiveDate}
        certificateNumber={certificateNumber}
        certifierContact={certifierContact}
        certifierName={certifierName}
        error={error}
        inspectionDueWindow={inspectionDueWindow}
        notes={notes}
        onAnnualUpdateDueDateChange={onAnnualUpdateDueDateChange}
        onCertificateEffectiveDateChange={onCertificateEffectiveDateChange}
        onCertificateNumberChange={onCertificateNumberChange}
        onCertifierContactChange={onCertifierContactChange}
        onCertifierNameChange={onCertifierNameChange}
        onInspectionDueWindowChange={onInspectionDueWindowChange}
        onNotesChange={onNotesChange}
        onRecordRetentionYearsChange={onRecordRetentionYearsChange}
        onStatusChange={onStatusChange}
        onToggleScope={onToggleScope}
        organicStatus={organicStatus}
        recordRetentionYears={recordRetentionYears}
        selectedScopes={selectedScopes}
      />
      <Button disabled={isSaving} label={isSaving ? "Saving..." : profileExists ? "Save organic profile" : "Enable organic tracking"} onPress={onSave} size="large" />
    </View>
  );
}

function CertificationPlanningCard({
  editingGoalId,
  editingGoalStatus,
  editingGoalTargetDate,
  editingTaskDueDate,
  editingTaskId,
  editingTaskStatus,
  goals,
  onEditGoal,
  onEditTask,
  onGoalStatusChange,
  onGoalTargetDateChange,
  onOpenBoard,
  onSaveGoal,
  onSaveTask,
  onTaskDueDateChange,
  onTaskStatusChange,
  tasks,
}: {
  editingGoalId: string;
  editingGoalStatus: PlanningGoalStatus;
  editingGoalTargetDate: string;
  editingTaskDueDate: string;
  editingTaskId: string;
  editingTaskStatus: PlanningTaskStatus;
  goals: PlanningGoal[];
  onEditGoal: (goal: PlanningGoal) => void;
  onEditTask: (task: PlanningTask) => void;
  onGoalStatusChange: (value: string) => void;
  onGoalTargetDateChange: (value: string) => void;
  onOpenBoard: (goalId: string) => void;
  onSaveGoal: () => void;
  onSaveTask: () => void;
  onTaskDueDateChange: (value: string) => void;
  onTaskStatusChange: (value: string) => void;
  tasks: PlanningTask[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rootGoal = goals.find((goal) => !goal.parentGoalId);
  const subgoals = rootGoal ? goals.filter((goal) => goal.parentGoalId === rootGoal.id) : [];
  const openTasks = tasks.filter((task) => task.status !== "done" && task.status !== "canceled");

  return (
    <CollapsibleCard
      detail="Certification has its own plan here, built from the shared local planning foundation."
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded((current) => !current)}
      title="Certification plan"
    >
      {rootGoal ? (
        <View style={styles.planBlock}>
          <Text style={styles.planTitle}>{rootGoal.title}</Text>
          <Text style={styles.body}>
            {PLANNING_GOAL_STATUS_LABELS[rootGoal.status]}
            {rootGoal.targetDate ? ` - target ${rootGoal.targetDate}` : ""}
          </Text>
          <Button label="Adjust overall timeline" onPress={() => onEditGoal(rootGoal)} size="large" variant="secondary" />
          {editingGoalId === rootGoal.id ? (
            <CertificationGoalEditForm
              editingGoalStatus={editingGoalStatus}
              editingGoalTargetDate={editingGoalTargetDate}
              onGoalStatusChange={onGoalStatusChange}
              onGoalTargetDateChange={onGoalTargetDateChange}
              onSaveGoal={onSaveGoal}
            />
          ) : null}
          <Button label="Open certification work board" onPress={() => onOpenBoard(rootGoal.id)} size="large" />
        </View>
      ) : (
        <Text style={styles.body}>Certification planning will be created after organic tracking is enabled.</Text>
      )}
      {subgoals.map((goal) => (
        <View key={goal.id} style={styles.planBlock}>
          <Text style={styles.planTitle}>{goal.title}</Text>
          <Text style={styles.body}>
            {PLANNING_GOAL_STATUS_LABELS[goal.status]}
            {goal.targetDate ? ` - target ${goal.targetDate}` : ""}
          </Text>
          <Button label="Adjust subgoal timeline" onPress={() => onEditGoal(goal)} size="large" variant="secondary" />
          {editingGoalId === goal.id ? (
            <CertificationGoalEditForm
              editingGoalStatus={editingGoalStatus}
              editingGoalTargetDate={editingGoalTargetDate}
              onGoalStatusChange={onGoalStatusChange}
              onGoalTargetDateChange={onGoalTargetDateChange}
              onSaveGoal={onSaveGoal}
            />
          ) : null}
          {tasks.filter((task) => task.goalId === goal.id).slice(0, 3).map((task) => (
            <View key={task.id} style={styles.taskBlock}>
              <Text style={styles.body}>{task.title}</Text>
              <Text style={styles.detail}>
                {PLANNING_TASK_STATUS_LABELS[task.status]} - {PLANNING_TASK_PRIORITY_LABELS[task.priority]}
                {task.dueDate ? ` - due ${task.dueDate}` : ""}
              </Text>
              <Button label="Adjust task" onPress={() => onEditTask(task)} size="large" variant="secondary" />
              {editingTaskId === task.id ? (
                <CertificationTaskEditForm
                  editingTaskDueDate={editingTaskDueDate}
                  editingTaskStatus={editingTaskStatus}
                  onSaveTask={onSaveTask}
                  onTaskDueDateChange={onTaskDueDateChange}
                  onTaskStatusChange={onTaskStatusChange}
                />
              ) : null}
            </View>
          ))}
        </View>
      ))}
      <Text style={styles.body}>{openTasks.length} certification task{openTasks.length === 1 ? "" : "s"} still open.</Text>
    </CollapsibleCard>
  );
}

function CertificationGoalEditForm({
  editingGoalStatus,
  editingGoalTargetDate,
  onGoalStatusChange,
  onGoalTargetDateChange,
  onSaveGoal,
}: {
  editingGoalStatus: PlanningGoalStatus;
  editingGoalTargetDate: string;
  onGoalStatusChange: (value: string) => void;
  onGoalTargetDateChange: (value: string) => void;
  onSaveGoal: () => void;
}) {
  return (
    <View style={styles.planEditBlock}>
      <SectionHeading title="Adjust certification goal" />
      <SelectField label="Goal status" onChange={onGoalStatusChange} options={PLANNING_GOAL_STATUSES.map((status) => ({ label: PLANNING_GOAL_STATUS_LABELS[status], value: status }))} value={editingGoalStatus} />
      <DateField label="Target date" onChangeText={onGoalTargetDateChange} placeholder="YYYY-MM-DD or leave blank" value={editingGoalTargetDate} />
      <Button label="Save certification goal timeline" onPress={onSaveGoal} size="large" />
    </View>
  );
}

function CertificationTaskEditForm({
  editingTaskDueDate,
  editingTaskStatus,
  onSaveTask,
  onTaskDueDateChange,
  onTaskStatusChange,
}: {
  editingTaskDueDate: string;
  editingTaskStatus: PlanningTaskStatus;
  onSaveTask: () => void;
  onTaskDueDateChange: (value: string) => void;
  onTaskStatusChange: (value: string) => void;
}) {
  return (
    <View style={styles.planEditBlock}>
      <SectionHeading title="Adjust certification task" />
      <SelectField label="Task status" onChange={onTaskStatusChange} options={PLANNING_TASK_STATUSES.map((status) => ({ label: PLANNING_TASK_STATUS_LABELS[status], value: status }))} value={editingTaskStatus} />
      <DateField label="Due date" onChangeText={onTaskDueDateChange} placeholder="YYYY-MM-DD or leave blank" value={editingTaskDueDate} />
      <Button label="Save certification task timeline" onPress={onSaveTask} size="large" />
    </View>
  );
}

function OrganicProfileForm({
  organicStatus,
  selectedScopes,
  certifierName,
  certifierContact,
  certificateNumber,
  certificateEffectiveDate,
  annualUpdateDueDate,
  inspectionDueWindow,
  recordRetentionYears,
  notes,
  error,
  onStatusChange,
  onToggleScope,
  onCertifierNameChange,
  onCertifierContactChange,
  onCertificateNumberChange,
  onCertificateEffectiveDateChange,
  onAnnualUpdateDueDateChange,
  onInspectionDueWindowChange,
  onRecordRetentionYearsChange,
  onNotesChange,
}: {
  organicStatus: OrganicOperationStatus;
  selectedScopes: Set<OrganicCertificationScopeType>;
  certifierName: string;
  certifierContact: string;
  certificateNumber: string;
  certificateEffectiveDate: string;
  annualUpdateDueDate: string;
  inspectionDueWindow: string;
  recordRetentionYears: string;
  notes: string;
  error?: string;
  onStatusChange: (value: string) => void;
  onToggleScope: (scopeType: OrganicCertificationScopeType) => void;
  onCertifierNameChange: (value: string) => void;
  onCertifierContactChange: (value: string) => void;
  onCertificateNumberChange: (value: string) => void;
  onCertificateEffectiveDateChange: (value: string) => void;
  onAnnualUpdateDueDateChange: (value: string) => void;
  onInspectionDueWindowChange: (value: string) => void;
  onRecordRetentionYearsChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}) {
  return (
    <View style={styles.form}>
      <SelectField
        label="Organic status"
        onChange={onStatusChange}
        options={ORGANIC_OPERATION_STATUSES.map((status) => ({
          label: ORGANIC_OPERATION_STATUS_LABELS[status],
          value: status,
        }))}
        value={organicStatus}
      />
      <View style={styles.form}>
        <Text style={styles.label}>Certification scopes</Text>
        <View style={styles.scopeGrid}>
          {ORGANIC_CERTIFICATION_SCOPE_TYPES.map((scopeType) => {
            const isSelected = selectedScopes.has(scopeType);
            return (
              <Pressable
                accessibilityRole="button"
                key={scopeType}
                onPress={() => onToggleScope(scopeType)}
                style={[styles.scopeButton, isSelected ? styles.scopeButtonSelected : null]}
              >
                <Text style={[styles.scopeButtonText, isSelected ? styles.scopeButtonTextSelected : null]}>
                  {ORGANIC_CERTIFICATION_SCOPE_LABELS[scopeType]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <FormField label="Certifier name" onChangeText={onCertifierNameChange} placeholder="Accredited certifier" value={certifierName} />
      <FormField label="Certifier contact" onChangeText={onCertifierContactChange} placeholder="Email or phone" value={certifierContact} />
      <FormField label="Certificate number" onChangeText={onCertificateNumberChange} placeholder="Optional" value={certificateNumber} />
      <DateField label="Certificate effective date" onChangeText={onCertificateEffectiveDateChange} placeholder="YYYY-MM-DD" value={certificateEffectiveDate} />
      <DateField label="Annual update due date" onChangeText={onAnnualUpdateDueDateChange} placeholder="YYYY-MM-DD" value={annualUpdateDueDate} />
      <FormField label="Inspection due window" onChangeText={onInspectionDueWindowChange} placeholder="For example: July-August" value={inspectionDueWindow} />
      <FormField label="Record retention years" keyboardType="decimal-pad" onChangeText={onRecordRetentionYearsChange} value={recordRetentionYears} />
      <FormField label="Notes" multiline onChangeText={onNotesChange} placeholder="Certifier notes, transition context, or setup reminders" value={notes} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const organicWorkAreas = [
  {
    title: "Organic places",
    description: "Document organic place status, transition timing, boundaries, buffers, and boundary evidence.",
    buttonLabel: "Open organic places",
    route: "/organic/places",
  },
  {
    title: "Organic inputs",
    description: "Track input materials, approval evidence, and input application records.",
    buttonLabel: "Open organic inputs",
    route: "/organic/inputs",
  },
  {
    title: "Organic seeds",
    description: "Track seed lots, commercial availability searches, and planting events.",
    buttonLabel: "Open organic seeds",
    route: "/organic/seeds",
  },
  {
    title: "Organic soil",
    description: "Track soil fertility practices, compost batches, manure timing, and crop rotations.",
    buttonLabel: "Open organic soil",
    route: "/organic/soil",
  },
  {
    title: "Organic pest, weed, and disease",
    description: "Record observations, prevention steps, actions, and plastic mulch removal.",
    buttonLabel: "Open pest records",
    route: "/organic/pest",
  },
  {
    title: "Organic traceability",
    description: "Track lots, handling, storage, sales, and mass-balance preparation.",
    buttonLabel: "Open traceability",
    route: "/organic/traceability",
  },
  {
    title: "Organic system plan",
    description: "Draft and update Organic System Plan notes and inspection-preparation tasks.",
    buttonLabel: "Open system plan",
    route: "/organic/system-plan",
  },
  {
    title: "Organic report package",
    description: "Create local report packages for farmer-owned review and export.",
    buttonLabel: "Open report package",
    route: "/organic/reports",
  },
  {
    title: "Advanced organic scopes",
    description: "Organize readiness notes for specialty scopes such as livestock, wild crops, mushrooms, imports, and labels.",
    buttonLabel: "Open advanced scopes",
    route: "/organic/advanced-scopes",
  },
] as const;

const styles = StyleSheet.create({
  body: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  detail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  warning: {
    color: theme.colors.warning,
    fontSize: theme.typography.body,
    fontWeight: "700",
    lineHeight: 24,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  form: {
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small,
    fontWeight: "700",
  },
  planBlock: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  planEditBlock: {
    gap: theme.spacing.sm,
  },
  planTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.section,
    fontWeight: theme.typography.headingFontWeight,
    lineHeight: 26,
  },
  scopeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  scopeButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: theme.spacing.touchTarget,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  scopeButtonSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentPressed,
  },
  scopeButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  scopeButtonTextSelected: {
    color: theme.colors.onAccent,
  },
  taskBlock: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.sm,
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
  },
  report: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});

function uniqueById<T extends { id: string }>(records: T[]): T[] {
  return [...new Map(records.map((record) => [record.id, record])).values()];
}
