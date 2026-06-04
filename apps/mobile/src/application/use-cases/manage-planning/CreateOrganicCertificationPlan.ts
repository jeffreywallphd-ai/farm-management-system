import type { Clock } from "../../ports/Clock";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { PlanningRepository } from "../../ports/PlanningRepository";
import type { FarmId } from "../../../domain/farm/Farm";
import type { PlanningGoal, PlanningTask } from "../../../domain/planning/Planning";
import { savePlanningGoal, savePlanningTask } from "./ManagePlanning";

interface TemplateTask {
  key: string;
  templateKey?: string;
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
const RETIRED_TEMPLATE_SUBGOAL_KEYS = ["inspection-evidence", "reports"];

const CERTIFICATION_SUBGOALS: TemplateSubgoal[] = [
  {
    key: "profile",
    title: "Set up certification profile",
    description: "Keep certifier, certificate, renewal, inspection, and scope context current.",
    tasks: [
      {
        key: "1",
        title: "Review certification profile",
        notes: "Expected evidence: current certifier name/contact, certificate number when certified, organic status, enabled scopes, and notes from the latest certifier instructions.",
        priority: "high",
      },
      {
        key: "2",
        title: "Update annual renewal and inspection dates",
        notes: "Expected evidence: annual update due date, inspection window, and any certifier email or letter confirming timing.",
      },
      {
        key: "recordkeeping-retention",
        title: "Confirm record retention and audit trail setup",
        notes: "Expected evidence: retention years, where records are kept, and a note that records can trace purchase or acquisition through production, harvest, handling, sale, or transport for certifier review.",
        priority: "high",
      },
      {
        key: "exemption-posture",
        title: "Check exemption or split-operation posture",
        notes: "Expected evidence: farmer-entered status, exempt-sales context if used, split organic/nonorganic areas or products, and any certifier guidance about what still needs records.",
      },
      {
        key: "certifier-forms",
        title: "Collect certifier forms and current OSP template",
        notes: "Expected evidence: local note or reference naming the certifier's required forms, Common OSP sections if used, and any special instructions the app does not replace.",
      },
    ],
  },
  {
    key: "land",
    title: "Document land and transition status",
    description: "Keep place status, transition dates, boundaries, buffers, and drift notes ready.",
    tasks: [
      {
        key: "1",
        title: "Review organic place statuses",
        notes: "Expected evidence: each farm place marked transitioning, certified organic, eligible, buffer, excluded, or nonorganic with current place paths.",
      },
      {
        key: "2",
        title: "Add or refresh boundary evidence",
        notes: "Expected evidence: field photos, map notes, written boundary descriptions, buffer descriptions, runoff/diversion notes, or local references linked to each relevant place.",
      },
      {
        key: "prohibited-substance-history",
        title: "Verify three-year prohibited-substance history",
        notes: "Expected evidence: last prohibited substance date for each organic or transitioning place, source notes from prior managers or applicator records, and transition eligibility date for certifier review.",
        priority: "high",
      },
      {
        key: "adjacent-land-risk",
        title: "Document adjacent land and drift risk",
        notes: "Expected evidence: adjacent land-use notes, contamination/drift risk notes, buffer width or barrier descriptions, and any incident farm notes linked as organic evidence.",
      },
      {
        key: "place-map-review",
        title: "Check farm map and place hierarchy against organic places",
        notes: "Expected evidence: farm places, map center or geometry where available, and place names that match how the certifier expects fields, beds, greenhouses, wash/pack, storage, and buffers to be identified.",
      },
      {
        key: "drift-incident-followup",
        title: "Record contamination or drift incident follow-up",
        notes: "Expected evidence: incident date, affected place/crop, suspected source, buffer or crop-handling response, linked farm note or photo, and certifier-notification notes when follow-up is needed.",
      },
    ],
  },
  {
    key: "input-approvals",
    title: "Review input approvals and restrictions",
    description: "Keep input labels, composition, sources, restrictions, and certifier-review notes ready.",
    tasks: [
      {
        key: "1",
        templateKey: "inputs-1",
        title: "Review inputs marked unknown or needs review",
        notes: "Expected evidence: input label, manufacturer, supplier, composition, source, restrictions, approval status, and certifier/OMRI/WSDA/National List evidence entered by the farmer.",
        priority: "high",
      },
      {
        key: "input-location-list",
        templateKey: "inputs-input-location-list",
        title: "List where each input is used",
        notes: "Expected evidence: OSP-ready input list showing composition, source, and farm place or handling location for every production or handling input.",
      },
      {
        key: "restricted-input-review",
        templateKey: "inputs-restricted-input-review",
        title: "Review restricted and prohibited input flags",
        notes: "Expected evidence: notes for restricted, prohibited, unknown, and needs-review inputs showing who reviewed them and what certifier follow-up remains.",
        priority: "high",
      },
      {
        key: "input-inventory-cleanup",
        templateKey: "inputs-input-inventory-cleanup",
        title: "Separate organic-use inputs from nonorganic materials",
        notes: "Expected evidence: storage notes, labels, receipts, and handling procedures showing how organic inputs are identified and kept from prohibited or nonorganic materials.",
      },
      {
        key: "current-labels-receipts",
        title: "Gather current labels and purchase evidence",
        notes: "Expected evidence: current product label, ingredient or SDS sheet when available, manufacturer, supplier, invoice or receipt, purchase date, and lot or batch identifier when shown.",
      },
      {
        key: "certifier-approval-before-use",
        title: "Confirm certifier approval before use",
        notes: "Expected evidence: certifier email, approval date, expiration or review date, restriction notes, and the person who checked the input before it was applied or used.",
        priority: "high",
      },
    ],
  },
  {
    key: "input-applications",
    title: "Track input applications and evidence",
    description: "Keep application dates, rates, places, reasons, weather, and linked evidence ready.",
    tasks: [
      {
        key: "1",
        templateKey: "inputs-2",
        title: "Check input application evidence",
        notes: "Expected evidence: application date, place or crop, quantity/unit, rate when known, reason, target problem, weather notes, applied-by, and linked farm notes or local references.",
      },
      {
        key: "material-use-reconciliation",
        title: "Reconcile input applications with material-use records",
        notes: "Expected evidence: organic input application records matched to relevant material-use records or a note explaining why the certification application log is the source record.",
      },
      {
        key: "application-corrections",
        title: "Record skipped or corrected application details",
        notes: "Expected evidence: notes for missing rates, corrected quantities, skipped place/crop context, or duplicate entries so the farmer can explain gaps without inventing records.",
      },
      {
        key: "post-use-context",
        title: "Attach weather and applied-by context after each use",
        notes: "Expected evidence: weather notes, applied-by person, reason for use, target problem when applicable, and linked farm note or local reference for field conditions.",
      },
    ],
  },
  {
    key: "seeds",
    title: "Organize seed and planting records",
    description: "Keep seed lots, commercial availability searches, invoices, labels, and planting events ready.",
    tasks: [
      {
        key: "1",
        title: "Review seed lots and organic status",
        notes: "Expected evidence: crop, variety, supplier, lot number, purchase date, quantity, organic status, treatment status, invoice reference, and seed label reference.",
      },
      {
        key: "2",
        title: "Review commercial availability searches",
        notes: "Expected evidence: supplier searched, date searched, crop/variety requested, result, and reason an equivalent organic variety was not available in needed variety, quantity, quality, or timing.",
        priority: "high",
      },
      {
        key: "sprout-seed-check",
        title: "Flag edible sprout seed for organic-only review",
        notes: "Expected evidence: seed lot notes identifying edible sprout use and organic seed status for certifier review; do not rely on nonorganic seed exceptions for sprouts.",
        priority: "high",
      },
      {
        key: "treated-seed-check",
        title: "Review treated seed and planting stock exceptions",
        notes: "Expected evidence: treatment name, whether it is allowed or required by phytosanitary regulation, temporary variance notes if relevant, and certifier guidance.",
      },
      {
        key: "planting-traceability",
        title: "Link planting events to seed lots and places",
        notes: "Expected evidence: planting date, seed lot, crop, farm place, quantity, planting method, and linked farm note when field context matters.",
      },
      {
        key: "seedlings-planting-stock",
        title: "Document seedlings and perennial planting stock status",
        notes: "Expected evidence: annual seedling or planting stock source, organic status, management period for perennial stock when relevant, variance or phytosanitary notes, and certifier guidance.",
      },
    ],
  },
  {
    key: "soil-fertility",
    title: "Document soil fertility and crop rotation practices",
    description: "Keep soil-building, erosion-control, soil-test, cover-crop, and rotation evidence ready.",
    tasks: [
      {
        key: "1",
        templateKey: "soil-2",
        title: "Review soil practice and rotation records",
        notes: "Expected evidence: soil-building practices, rotations, cover crops, erosion-control notes, soil tests, tillage/no-till choices, amendments, and linked farm notes.",
      },
      {
        key: "soil-prohibited-materials",
        templateKey: "soil-soil-prohibited-materials",
        title: "Check soil amendment prohibited-material risks",
        notes: "Expected evidence: notes that sewage sludge, disallowed synthetic substances, and crop-residue burning are not used unless a specific allowed exception or certifier instruction is documented.",
      },
      {
        key: "rotation-cover-crop",
        templateKey: "soil-rotation-cover-crop",
        title: "Document rotations, cover crops, and erosion control",
        notes: "Expected evidence: crop rotation records by place/season/year, cover crop or green manure notes, tillage/no-till choices, soil tests, and erosion-control practices.",
      },
      {
        key: "soil-tests-erosion",
        title: "Review soil tests and erosion-control evidence",
        notes: "Expected evidence: soil-test dates and results where used, erosion observations, slope or runoff concerns, cover-crop establishment notes, and tillage/no-till choices tied to places.",
      },
      {
        key: "plant-animal-materials",
        title: "Document plant and animal material sources",
        notes: "Expected evidence: source, composition, application reason, place/crop, whether the material is plant-based, manure, compost, or another amendment, and any certifier review notes.",
      },
    ],
  },
  {
    key: "compost",
    title: "Manage compost evidence",
    description: "Keep compost batch classification, hot compost logs, and cold/unfinished material review ready.",
    tasks: [
      {
        key: "method-classification",
        templateKey: "soil-compost-method-classification",
        title: "Classify each compost batch by process",
        notes: "Expected evidence: batch ingredients, start date, C:N ratio notes, process type, and whether it is hot compost, cold/unfinished material for certifier review, or raw manure interval material.",
        priority: "high",
      },
      {
        key: "hot-static",
        templateKey: "soil-hot-compost-static",
        title: "Record hot compost evidence for static or in-vessel batches",
        notes: "Expected evidence: initial C:N ratio between 25:1 and 40:1, temperature logs showing 131-170 F for 3 days, batch method, and notes on monitoring.",
      },
      {
        key: "hot-windrow",
        templateKey: "soil-hot-compost-windrow",
        title: "Record hot compost evidence for windrow batches",
        notes: "Expected evidence: initial C:N ratio between 25:1 and 40:1, temperature logs showing 131-170 F for 15 days, at least five turns during that period, and turn dates.",
      },
      {
        key: "cold-review",
        templateKey: "soil-cold-compost-review",
        title: "Flag cold compost or aged piles for review",
        notes: "Expected evidence: ingredient notes, age/start date, temperature gap notes, turns if any, and a decision note to treat as certifier-review material or follow raw manure interval planning until accepted.",
        priority: "high",
      },
      {
        key: "batch-use-before-application",
        title: "Record compost batch status before applying",
        notes: "Expected evidence: batch status, process decision, application place/crop, application date, quantity, and whether the material is treated as compost or as material needing raw-manure interval planning.",
        priority: "high",
      },
      {
        key: "temperature-gap-review",
        title: "Link compost temperature gaps to review notes",
        notes: "Expected evidence: missing logs, out-of-range temperatures, insufficient turns, monitoring notes, and certifier-review or follow-up decision before the material is represented as compost.",
      },
    ],
  },
  {
    key: "manure",
    title: "Track raw manure applications and harvest intervals",
    description: "Keep manure sources, application context, edible-portion contact, and 90/120-day interval evidence ready.",
    tasks: [
      {
        key: "1",
        templateKey: "soil-1",
        title: "Review manure interval planning dates",
        notes: "Expected evidence: manure application date, crop/place, whether the edible portion contacts soil, calculated 90-day or 120-day earliest harvest date, quantity, and notes for certifier review.",
        priority: "high",
      },
      {
        key: "edible-contact",
        title: "Identify crops with edible portions contacting soil",
        notes: "Expected evidence: crop/place notes showing whether the edible portion has soil contact so the 120-day or 90-day interval can be reviewed before harvest.",
        priority: "high",
      },
      {
        key: "harvest-date-review",
        title: "Review planned harvests before raw manure use",
        notes: "Expected evidence: expected harvest date, manure application date, calculated earliest harvest date, crop contact context, and warning notes when timing needs certifier review.",
      },
      {
        key: "source-application-method",
        title: "Document manure source and application method",
        notes: "Expected evidence: source, manure type, quantity, application method, incorporation or surface application notes, place/crop, and linked farm note when field conditions matter.",
      },
    ],
  },
  {
    key: "pest",
    title: "Document pest, weed, disease, and mulch practices",
    description: "Keep prevention hierarchy, actions, input escalation, and plastic mulch removal evidence ready.",
    tasks: [
      {
        key: "1",
        title: "Review pest and disease action hierarchy",
        notes: "Expected evidence: prevention, crop rotation, soil/crop nutrient management, sanitation, cultural practices, mechanical/physical controls, biological/botanical controls, and input escalation notes.",
        priority: "high",
      },
      {
        key: "2",
        title: "Check plastic mulch removal records",
        notes: "Expected evidence: installation place/date, removal date, photo or farm-note reference, and notes showing removal at the end of the growing or harvest season.",
      },
      {
        key: "pest-monitoring",
        title: "Record monitoring observations before treatments",
        notes: "Expected evidence: pest, weed, or disease observation date, place, crop, severity, photos or farm-note link, and notes about the threshold or reason action was needed.",
      },
      {
        key: "weed-control-methods",
        title: "Document weed-control methods used",
        notes: "Expected evidence: mulch, mowing, grazing, hand weeding, mechanical cultivation, flame/heat/electrical control, or other method notes before input escalation.",
      },
      {
        key: "input-escalation",
        title: "Document why an allowed input was needed",
        notes: "Expected evidence: linked observation, prevention practices tried, why they were insufficient, input application reference, and OSP condition or certifier guidance for the input.",
        priority: "high",
      },
      {
        key: "treated-lumber-check",
        title: "Check new treated-lumber contact risks",
        notes: "Expected evidence: notes for new or replacement lumber, trellis, bed, or livestock-contact installations showing prohibited treated materials are avoided or reviewed.",
      },
      {
        key: "sanitation-habitat",
        title: "Review sanitation and habitat-management records",
        notes: "Expected evidence: crop debris cleanup, disease-vector reduction, equipment or tool cleaning, field-edge habitat notes, and place/crop context for preventive practices.",
      },
      {
        key: "biological-botanical-controls",
        title: "Document biological or botanical control evidence",
        notes: "Expected evidence: control method, product label when applicable, release or application date, monitoring notes, input restriction notes, and certifier guidance for botanical or biological controls.",
      },
    ],
  },
  {
    key: "lot-traceability",
    title: "Prepare lot traceability records",
    description: "Keep lot codes, harvest links, product audit trails, and nonretail labeling evidence ready.",
    tasks: [
      {
        key: "1",
        templateKey: "traceability-1",
        title: "Review organic lot traceability",
        notes: "Expected evidence: lot code, crop, harvest place, harvest date, harvested quantity/unit, source harvest record link when available, handling, storage, and sale links.",
        priority: "high",
      },
      {
        key: "audit-trail-check",
        templateKey: "traceability-audit-trail-check",
        title: "Trace one product from seed or input through sale",
        notes: "Expected evidence: seed lot or input references, place, harvest lot, handling/storage records, sale invoice, and transport or buyer record where available.",
        priority: "high",
      },
      {
        key: "lot-labeling",
        templateKey: "traceability-lot-labeling",
        title: "Review nonretail container lot labeling",
        notes: "Expected evidence: lot-number labeling notes for shipped or stored nonretail containers when organic claims are used.",
      },
      {
        key: "create-lot-records",
        title: "Create lot records for products with organic claims",
        notes: "Expected evidence: lot code, crop, harvest place, harvest date, organic status, harvested quantity/unit, and source harvest record or farm note when available.",
        priority: "high",
      },
      {
        key: "seed-planting-context",
        title: "Link seed and planting context where useful",
        notes: "Expected evidence: seed lot, planting event, crop, and place references connected to lot or audit-trail records when those records help explain product origin.",
      },
    ],
  },
  {
    key: "handling-mass-balance",
    title: "Review handling, storage, sales, and mass balance",
    description: "Keep commingling prevention, storage, sale, loss, and quantity reconciliation evidence ready.",
    tasks: [
      {
        key: "1",
        templateKey: "traceability-2",
        title: "Run mass-balance review",
        notes: "Expected evidence: mass-balance report showing harvested, handled, stored, sold, lost, expected remaining, actual remaining, and any discrepancy notes as a review aid.",
      },
      {
        key: "handling-commingling",
        templateKey: "traceability-handling-commingling",
        title: "Document handling and commingling prevention",
        notes: "Expected evidence: wash/pack, storage, container, equipment-cleaning, organic/nonorganic separation, and prohibited-substance contact prevention notes.",
      },
      {
        key: "storage-container-cleaning",
        templateKey: "traceability-storage-container-cleaning",
        title: "Check storage containers and reusable bags",
        notes: "Expected evidence: container IDs, prior-use notes, cleaning notes, and confirmation that reused containers pose no known prohibited-substance contact risk.",
      },
      {
        key: "sale-invoice-claims",
        title: "Review sale invoices and organic claim wording",
        notes: "Expected evidence: buyer, sale date, invoice number, quantity/unit, lot code, evidence reference, and the exact organic claim wording used on invoice or sale record.",
      },
      {
        key: "loss-adjustments",
        title: "Record loss, shrink, and adjustment notes",
        notes: "Expected evidence: loss reason, handling or storage adjustment, quantity/unit, affected lot, discrepancy notes, and whether the adjustment should appear in the mass-balance review.",
      },
    ],
  },
  {
    key: "osp-practices",
    title: "Draft OSP practices, inputs, and monitoring",
    description: "Keep OSP practice, procedure, input, substance, and monitoring narratives ready.",
    tasks: [
      {
        key: "1",
        templateKey: "osp-1",
        title: "Review OSP practice and procedure notes",
        notes: "Expected evidence: current narratives describing production and handling practices, procedures, and how often they are performed.",
      },
      {
        key: "osp-input-list",
        templateKey: "osp-osp-input-list",
        title: "Update OSP input and substance list",
        notes: "Expected evidence: every production or handling input with composition, source, location of use, restrictions, and commercial availability documentation when applicable.",
      },
      {
        key: "osp-monitoring",
        templateKey: "osp-osp-monitoring",
        title: "Describe monitoring practices and frequency",
        notes: "Expected evidence: how the farm checks the OSP is being followed, how suppliers and organic status are verified, and how monitoring is recorded.",
      },
      {
        key: "narrative-record-match",
        title: "Match OSP narratives to implemented records",
        notes: "Expected evidence: notes linking OSP sections to local records or screens for places, inputs, seeds, soil, compost, manure, pest actions, traceability, handling, and reports.",
      },
    ],
  },
  {
    key: "osp-recordkeeping",
    title: "Document OSP recordkeeping and prevention procedures",
    description: "Keep recordkeeping, commingling prevention, prohibited-substance prevention, and certifier follow-up notes ready.",
    tasks: [
      {
        key: "1",
        templateKey: "osp-2",
        title: "Review commingling and prohibited-substance prevention notes",
        notes: "Expected evidence: physical barriers, management practices, storage/handling procedures, and split-operation safeguards for organic and nonorganic products.",
        priority: "high",
      },
      {
        key: "osp-recordkeeping",
        templateKey: "osp-osp-recordkeeping",
        title: "Describe the organic recordkeeping system",
        notes: "Expected evidence: where records live, how farm notes and organic records link together, retention years, audit-trail coverage, and export/recovery-copy practice.",
      },
      {
        key: "osp-certifier-questions",
        templateKey: "osp-osp-certifier-questions",
        title: "Add certifier-specific questions and extra information",
        notes: "Expected evidence: open questions, certifier-required fields not yet covered by the app, and notes to transfer into the certifier's required OSP form.",
      },
      {
        key: "gap-followup-tasks",
        title: "Track OSP gaps as follow-up tasks",
        notes: "Expected evidence: open questions, missing certifier fields, unclear procedures, owner or responsible person label if useful, and target dates for each follow-up item.",
      },
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
  await retireTemplateRecords(input.farmId, existingGoals, existingTasks, dependencies.repository);

  const rootTemplateKey = templateKey("goal", CERTIFICATION_GOAL_KEY);
  const existingRoot = existingGoals.find((goal) => goal.templateKey === rootTemplateKey);
  const rootGoal = existingRoot ? await savePlanningGoal(
    {
      ...existingRoot,
      title: "Complete organic certification readiness",
      description: "Plan the work needed for organic certification, renewal, and inspection preparation.",
      category: "organicCertification",
      source: "organicCertificationTemplate",
      templateKey: rootTemplateKey,
      sortOrder: 0,
    },
    dependencies,
  ) : await savePlanningGoal(
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
    const subgoal = existingSubgoal ? await savePlanningGoal(
      {
        ...existingSubgoal,
        parentGoalId: rootGoal.id,
        title: subgoalTemplate.title,
        description: subgoalTemplate.description,
        category: "organicCertification",
        source: "organicCertificationTemplate",
        templateKey: subgoalKey,
        sortOrder: subgoalIndex + 1,
      },
      dependencies,
    ) : await savePlanningGoal(
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
      const taskKey = templateKey("task", taskTemplate.templateKey ?? `${subgoalTemplate.key}-${taskTemplate.key}`);
      const existingTask = existingTasks.find((task) => task.templateKey === taskKey);
      const task = existingTask ? await savePlanningTask(
        {
          ...existingTask,
          goalId: subgoal.id,
          title: taskTemplate.title,
          notes: taskTemplate.notes,
          priority: taskTemplate.priority ?? existingTask.priority,
          source: "organicCertificationTemplate",
          templateKey: taskKey,
          sortOrder: taskIndex + 1,
        },
        dependencies,
      ) : await savePlanningTask(
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

async function retireTemplateRecords(
  farmId: FarmId,
  existingGoals: PlanningGoal[],
  existingTasks: PlanningTask[],
  repository: PlanningRepository,
): Promise<void> {
  const retiredSubgoalTemplateKeys = RETIRED_TEMPLATE_SUBGOAL_KEYS.map((key) => templateKey("subgoal", key));
  const retiredTaskPrefixes = RETIRED_TEMPLATE_SUBGOAL_KEYS.map((key) => templateKey("task", `${key}-`));

  for (const task of existingTasks) {
    if (task.templateKey && retiredTaskPrefixes.some((prefix) => task.templateKey?.startsWith(prefix))) {
      await repository.deleteTask(farmId, task.id);
    }
  }

  for (const goal of existingGoals) {
    if (goal.templateKey && retiredSubgoalTemplateKeys.includes(goal.templateKey)) {
      await repository.deleteGoal(farmId, goal.id);
    }
  }
}

function templateKey(kind: string, key: string): string {
  return `organicCertification:${kind}:${key}`;
}
