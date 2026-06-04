import type { Clock } from "../../ports/Clock";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { PlanningRepository } from "../../ports/PlanningRepository";
import type { FarmId } from "../../../domain/farm/Farm";
import type { PlanningGoal, PlanningTask } from "../../../domain/planning/Planning";
import { savePlanningGoal, savePlanningTask } from "./ManagePlanning";

interface TemplateTask {
  title: string;
  notes: string;
  priority?: "normal" | "high";
}

interface TemplateSubgoal {
  key: string;
  title: string;
  description: string;
  tasks: TemplateTask[];
}

const CERTIFICATION_GOAL_KEY = "organic-certification";

const CERTIFICATION_SUBGOALS: TemplateSubgoal[] = [
  {
    key: "profile",
    title: "Set up certification profile",
    description: "Keep certifier, certificate, renewal, inspection, and scope context current.",
    tasks: [
      { title: "Review certification profile", notes: "Check certifier, certificate number, status, and enabled scopes.", priority: "high" },
      { title: "Update annual renewal and inspection dates", notes: "Adjust dates or windows when the certifier confirms timing." },
    ],
  },
  {
    key: "land",
    title: "Document land and transition status",
    description: "Keep place status, transition dates, boundaries, buffers, and drift notes ready.",
    tasks: [
      { title: "Review organic place statuses", notes: "Check transition, certified, excluded, buffer, and nonorganic places." },
      { title: "Add or refresh boundary evidence", notes: "Link field notes, photos, or local references for boundaries and buffers." },
    ],
  },
  {
    key: "inputs",
    title: "Organize input and material records",
    description: "Keep input approval evidence and application logs ready for review.",
    tasks: [
      { title: "Review inputs marked unknown or needs review", notes: "Update approval status only from farmer/certifier-confirmed evidence.", priority: "high" },
      { title: "Check input application evidence", notes: "Link farm notes, labels, receipts, or local references where useful." },
    ],
  },
  {
    key: "seeds",
    title: "Organize seed and planting records",
    description: "Keep seed lots, commercial availability searches, invoices, labels, and planting events ready.",
    tasks: [
      { title: "Review seed lots and organic status", notes: "Check labels, invoices, treatments, and variety notes." },
      { title: "Review commercial availability searches", notes: "Add missing supplier/search evidence for nonorganic seed use." },
    ],
  },
  {
    key: "soil",
    title: "Document soil fertility, compost, manure, and rotations",
    description: "Keep soil-building, compost, manure interval, and crop rotation records ready.",
    tasks: [
      { title: "Review manure interval planning dates", notes: "Check 90/120-day planning warnings before harvest decisions." },
      { title: "Review compost and soil practice records", notes: "Check temperature logs, turns, rotations, and erosion-control notes." },
    ],
  },
  {
    key: "pest",
    title: "Document pest, weed, disease, and mulch practices",
    description: "Keep prevention hierarchy, actions, input escalation, and plastic mulch removal evidence ready.",
    tasks: [
      { title: "Review pest and disease action hierarchy", notes: "Check prevention, sanitation, cultural, mechanical, biological, and input escalation notes." },
      { title: "Check plastic mulch removal records", notes: "Add removal date and evidence references where needed." },
    ],
  },
  {
    key: "traceability",
    title: "Prepare traceability and mass balance records",
    description: "Keep lots, handling, storage, sales, and mass-balance review ready.",
    tasks: [
      { title: "Review organic lot traceability", notes: "Check lot code, harvest place, crop, quantity, handling, storage, and sales links.", priority: "high" },
      { title: "Run mass-balance review", notes: "Use the report as a review aid, not a legal determination." },
    ],
  },
  {
    key: "osp",
    title: "Draft or update Organic System Plan notes",
    description: "Keep local OSP narratives current before using certifier forms.",
    tasks: [
      { title: "Review OSP practice and procedure notes", notes: "Update local narratives for production, handling, monitoring, and records." },
      { title: "Review commingling and prohibited-substance prevention notes", notes: "Update prevention procedures before renewal or inspection." },
    ],
  },
  {
    key: "inspection-evidence",
    title: "Prepare inspection evidence",
    description: "Turn farm notes and records into inspection-ready evidence references.",
    tasks: [
      { title: "Connect farm events to certification requirements", notes: "Link relevant voice/photo farm events to organic categories or records.", priority: "high" },
      { title: "Check linked farm-note evidence", notes: "Make sure important certification evidence notes are linked and easy to find." },
    ],
  },
  {
    key: "reports",
    title: "Generate certification or renewal package",
    description: "Create local report packages for farmer review before certifier conversations.",
    tasks: [
      { title: "Generate organic report package", notes: "Create a local package for inspection, annual update, or archive review.", priority: "high" },
      { title: "Export recovery copy after major certification updates", notes: "Save a local recovery copy after important planning and record updates." },
    ],
  },
];

export async function ensureOrganicCertificationPlan(
  input: { farmId: FarmId; targetDate?: string },
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: PlanningRepository },
): Promise<{ goal: PlanningGoal; subgoals: PlanningGoal[]; tasks: PlanningTask[] }> {
  const existingGoals = await dependencies.repository.listGoals(input.farmId, {
    category: "organicCertification",
    source: "organicCertificationTemplate",
  });
  const existingTasks = await dependencies.repository.listTasks(input.farmId, {
    source: "organicCertificationTemplate",
  });

  const rootTemplateKey = templateKey("goal", CERTIFICATION_GOAL_KEY);
  const existingRoot = existingGoals.find((goal) => goal.templateKey === rootTemplateKey);
  const rootGoal = existingRoot ?? await savePlanningGoal(
    {
      farmId: input.farmId,
      title: "Complete organic certification readiness",
      description: "Plan the work needed for organic certification, renewal, and inspection preparation.",
      category: "organicCertification",
      status: "active",
      targetDate: input.targetDate,
      source: "organicCertificationTemplate",
      templateKey: rootTemplateKey,
      sortOrder: 0,
    },
    dependencies,
  );

  const subgoals: PlanningGoal[] = [];
  const tasks: PlanningTask[] = [];

  for (const [subgoalIndex, subgoalTemplate] of CERTIFICATION_SUBGOALS.entries()) {
    const subgoalKey = templateKey("subgoal", subgoalTemplate.key);
    const existingSubgoal = existingGoals.find((goal) => goal.templateKey === subgoalKey);
    const subgoal = existingSubgoal ?? await savePlanningGoal(
      {
        farmId: input.farmId,
        parentGoalId: rootGoal.id,
        title: subgoalTemplate.title,
        description: subgoalTemplate.description,
        category: "organicCertification",
        status: "planned",
        targetDate: input.targetDate,
        source: "organicCertificationTemplate",
        templateKey: subgoalKey,
        sortOrder: subgoalIndex + 1,
      },
      dependencies,
    );
    subgoals.push(subgoal);

    for (const [taskIndex, taskTemplate] of subgoalTemplate.tasks.entries()) {
      const taskKey = templateKey("task", `${subgoalTemplate.key}-${taskIndex + 1}`);
      const existingTask = existingTasks.find((task) => task.templateKey === taskKey);
      const task = existingTask ?? await savePlanningTask(
        {
          farmId: input.farmId,
          goalId: subgoal.id,
          title: taskTemplate.title,
          notes: taskTemplate.notes,
          status: "notStarted",
          priority: taskTemplate.priority ?? "normal",
          dueDate: input.targetDate,
          source: "organicCertificationTemplate",
          templateKey: taskKey,
          sortOrder: taskIndex + 1,
        },
        dependencies,
      );
      tasks.push(task);
    }
  }

  return { goal: rootGoal, subgoals, tasks };
}

function templateKey(kind: string, key: string): string {
  return `organicCertification:${kind}:${key}`;
}
