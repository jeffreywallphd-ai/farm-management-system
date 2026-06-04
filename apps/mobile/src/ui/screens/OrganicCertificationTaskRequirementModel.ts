import type { PlanningTask } from "../../domain/planning/Planning";

export interface OrganicRequirementReference {
  key: string;
  label: string;
  url: string;
}

export interface OrganicTaskRequirementExplanation {
  isTemplateMapped: boolean;
  reason: string;
  references: OrganicRequirementReference[];
}

const ECFR_PART_205_URL = "https://www.ecfr.gov/current/title-7/part-205";

const REQUIREMENT_REFERENCES = {
  "205.101": {
    key: "205.101",
    label: "7 CFR 205.101 exemptions from certification",
    url: `${ECFR_PART_205_URL}/section-205.101`,
  },
  "205.103": {
    key: "205.103",
    label: "7 CFR 205.103 recordkeeping by certified operations",
    url: `${ECFR_PART_205_URL}/section-205.103`,
  },
  "205.105": {
    key: "205.105",
    label: "7 CFR 205.105 allowed and prohibited substances, methods, and ingredients",
    url: `${ECFR_PART_205_URL}/section-205.105`,
  },
  "205.201": {
    key: "205.201",
    label: "7 CFR 205.201 Organic System Plan",
    url: `${ECFR_PART_205_URL}/section-205.201`,
  },
  "205.202": {
    key: "205.202",
    label: "7 CFR 205.202 land requirements",
    url: `${ECFR_PART_205_URL}/section-205.202`,
  },
  "205.203": {
    key: "205.203",
    label: "7 CFR 205.203 soil fertility, compost, and manure",
    url: `${ECFR_PART_205_URL}/section-205.203`,
  },
  "205.204": {
    key: "205.204",
    label: "7 CFR 205.204 seeds and planting stock",
    url: `${ECFR_PART_205_URL}/section-205.204`,
  },
  "205.205": {
    key: "205.205",
    label: "7 CFR 205.205 crop rotation practice standard",
    url: `${ECFR_PART_205_URL}/section-205.205`,
  },
  "205.206": {
    key: "205.206",
    label: "7 CFR 205.206 pest, weed, and disease management",
    url: `${ECFR_PART_205_URL}/section-205.206`,
  },
  "205.272": {
    key: "205.272",
    label: "7 CFR 205.272 commingling and prohibited-substance prevention",
    url: `${ECFR_PART_205_URL}/section-205.272`,
  },
  "205.300": {
    key: "205.300",
    label: "7 CFR 205.300 use of the term organic",
    url: `${ECFR_PART_205_URL}/section-205.300`,
  },
  "205.307": {
    key: "205.307",
    label: "7 CFR 205.307 nonretail container labeling",
    url: `${ECFR_PART_205_URL}/section-205.307`,
  },
  "205.403": {
    key: "205.403",
    label: "7 CFR 205.403 on-site inspections",
    url: `${ECFR_PART_205_URL}/section-205.403`,
  },
  "205.406": {
    key: "205.406",
    label: "7 CFR 205.406 continuation of certification",
    url: `${ECFR_PART_205_URL}/section-205.406`,
  },
  "205.601": {
    key: "205.601",
    label: "7 CFR 205.601 allowed synthetic substances for organic crop production",
    url: `${ECFR_PART_205_URL}/section-205.601`,
  },
  "205.602": {
    key: "205.602",
    label: "7 CFR 205.602 prohibited nonsynthetic substances for organic crop production",
    url: `${ECFR_PART_205_URL}/section-205.602`,
  },
  USDA_OSP: {
    key: "USDA_OSP",
    label: "USDA AMS Organic System Plan guidance",
    url: "https://www.ams.usda.gov/services/organic-certification/organic-system-plan",
  },
} as const satisfies Record<string, OrganicRequirementReference>;

type RequirementKey = keyof typeof REQUIREMENT_REFERENCES;

interface RequirementRule {
  prefix?: string;
  templateKey?: string;
  requirementSummary: string;
  references: RequirementKey[];
}

const REQUIREMENT_RULES: RequirementRule[] = [
  {
    prefix: "organicCertification:task:admin-profile-",
    requirementSummary: "7 CFR 205.201 requires an Organic System Plan agreed to by the operation and certifier, and 7 CFR 205.406 requires annual certification updates, fees, updated OSP information, and yearly inspection. Certification profile tasks keep the operation identity, scope, certificate, renewal, certifier instructions, and inspection timing ready for that review.",
    references: ["205.201", "205.406", "205.103", "USDA_OSP"],
  },
  {
    prefix: "organicCertification:task:admin-recordkeeping-",
    requirementSummary: "7 CFR 205.103 requires certified operations to keep records adapted to the farm, fully disclosing activities and transactions, traceable from purchase or acquisition through production to sale or transport, retained for at least five years, and available for inspection. Recordkeeping administration tasks make sure the farm knows where those records live and how the audit trail can be produced.",
    references: ["205.103", "205.201", "205.101"],
  },
  {
    prefix: "organicCertification:task:admin-input-approvals-",
    requirementSummary: "7 CFR 205.201 requires the OSP to list each production or handling input with composition, source, use location, and commercial-availability documentation when applicable. 7 CFR 205.105 and the National List sections limit substances and methods, so input approval tasks keep labels, invoices, composition, restrictions, and certifier-review evidence ready before use.",
    references: ["205.105", "205.201", "205.601", "205.602", "205.103"],
  },
  {
    prefix: "organicCertification:task:admin-osp-practices-",
    requirementSummary: "7 CFR 205.201 requires the OSP to describe practices and procedures, how often they are performed, inputs and substances, monitoring practices, supplier and organic-status checks, recordkeeping, and certifier-requested information. OSP practice tasks help convert farm work into the narratives and lists the certifier reviews.",
    references: ["205.201", "205.103", "USDA_OSP"],
  },
  {
    prefix: "organicCertification:task:admin-osp-recordkeeping-",
    requirementSummary: "7 CFR 205.201 requires the OSP to describe the recordkeeping system, commingling-prevention measures on split operations, and management practices or physical barriers that prevent organic products from contacting prohibited substances. 7 CFR 205.103 and 205.272 make those procedures auditable and handling-specific.",
    references: ["205.201", "205.103", "205.272", "USDA_OSP"],
  },
  {
    prefix: "organicCertification:task:farm-land-",
    requirementSummary: "7 CFR 205.202 requires organic crop land to have no prohibited substances applied for three years before harvest and to have distinct boundaries and buffer zones sufficient to prevent unintended prohibited-substance application or contact from adjoining land. Land tasks turn each place, boundary, buffer, transition date, and drift concern into reviewable evidence.",
    references: ["205.202", "205.105", "205.201", "205.103"],
  },
  {
    prefix: "organicCertification:task:farm-input-applications-",
    requirementSummary: "7 CFR 205.201 requires input substances and use locations to be in the OSP, while 7 CFR 205.103 requires records detailed enough to audit farm activities and transactions. Input application tasks record what was applied, where, when, why, at what quantity, and by whom so actual field use can be checked against the OSP and allowed-substance rules.",
    references: ["205.103", "205.201", "205.203", "205.105"],
  },
  {
    prefix: "organicCertification:task:farm-seeds-",
    requirementSummary: "7 CFR 205.204 requires organically grown seeds, annual seedlings, and planting stock unless a listed exception applies. Nonorganic untreated seed generally needs commercial-availability evidence, edible sprout seed must be organic, treated seed has tighter limits, and perennial planting stock has organic-management timing requirements.",
    references: ["205.204", "205.201", "205.103"],
  },
  {
    prefix: "organicCertification:task:farm-soil-fertility-",
    requirementSummary: "7 CFR 205.203 requires tillage and cultivation practices that maintain or improve soil condition and minimize erosion, and requires nutrients and fertility to be managed through rotations, cover crops, and plant or animal materials without contaminating crops, soil, or water. 7 CFR 205.205 requires crop rotation functions such as soil organic matter, pest management, deficient or excess nutrients, and erosion control.",
    references: ["205.203", "205.205", "205.105", "205.103"],
  },
  {
    templateKey: "organicCertification:task:farm-compost-record-carbon-nitrogen-ratio",
    requirementSummary: "7 CFR 205.203 requires compliant compost from plant and animal materials to start with an initial carbon-to-nitrogen ratio between 25:1 and 40:1 before the temperature process can be reviewed as compost rather than raw manure or unfinished material.",
    references: ["205.203", "205.103"],
  },
  {
    templateKey: "organicCertification:task:farm-compost-check-static-temperature",
    requirementSummary: "7 CFR 205.203 requires in-vessel or static aerated pile compost to maintain 131-170 F for three days. Temperature-check tasks create the dated readings needed to show the pile stayed within that required process window.",
    references: ["205.203", "205.103"],
  },
  {
    templateKey: "organicCertification:task:farm-compost-confirm-static-temperature-window",
    requirementSummary: "7 CFR 205.203 treats static aerated pile or in-vessel compost as compliant only when the pile maintained 131-170 F for three days after starting with the required C:N ratio. This confirmation task packages those readings for review.",
    references: ["205.203", "205.103"],
  },
  {
    templateKey: "organicCertification:task:farm-compost-check-windrow-temperature",
    requirementSummary: "7 CFR 205.203 requires windrow compost to maintain 131-170 F for 15 days. Temperature-check tasks create the dated readings needed to show the windrow stayed inside that required hot-compost window.",
    references: ["205.203", "205.103"],
  },
  {
    templateKey: "organicCertification:task:farm-compost-turn-windrow-pile",
    requirementSummary: "7 CFR 205.203 requires windrow compost to be turned at least five times during the 15-day 131-170 F period. Turn tasks create the dated turn evidence that belongs alongside the temperature log.",
    references: ["205.203", "205.103"],
  },
  {
    templateKey: "organicCertification:task:farm-compost-record-windrow-turn-dates",
    requirementSummary: "7 CFR 205.203 requires at least five turns during the windrow's 15-day 131-170 F process period. The turn-date record lets the certifier match the five-turn evidence to the same compost batch and temperature window.",
    references: ["205.203", "205.103"],
  },
  {
    templateKey: "organicCertification:task:farm-compost-confirm-windrow-temperature-window",
    requirementSummary: "7 CFR 205.203 requires windrow compost to maintain 131-170 F for 15 days and be turned at least five times during that period. This confirmation task brings the temperature and five-turn evidence together for the compost batch.",
    references: ["205.203", "205.103"],
  },
  {
    prefix: "organicCertification:task:farm-compost-",
    requirementSummary: "7 CFR 205.203 distinguishes compliant compost from raw manure or other plant and animal materials by process evidence, including ingredients, C:N ratio where applicable, temperature method, timing, and windrow turns when used. Compost tasks keep each batch identity, process classification, application, and gap explanation ready for certifier review under the recordkeeping rule.",
    references: ["205.203", "205.103", "205.201"],
  },
  {
    prefix: "organicCertification:task:farm-manure-",
    requirementSummary: "7 CFR 205.203 requires raw manure to be composted unless it is used on nonfood crops or incorporated far enough ahead of harvest: at least 120 days before harvest for crops whose edible portion contacts soil or soil particles, and at least 90 days before harvest for crops whose edible portion does not. Manure tasks document source, application, crop-contact context, and interval checks.",
    references: ["205.203", "205.103", "205.201"],
  },
  {
    prefix: "organicCertification:task:farm-pest-",
    requirementSummary: "7 CFR 205.206 requires a prevention-first hierarchy for pests, weeds, and diseases: rotations, sanitation, resistant varieties, mechanical or physical controls, mulching, mowing, grazing, hand weeding, cultivation, flame/heat/electrical methods, and biological or botanical options before allowed input escalation. It also requires plastic or synthetic mulch removal at season end and prohibits treated lumber contact in new or replacement installations.",
    references: ["205.206", "205.201", "205.103", "205.601"],
  },
  {
    prefix: "organicCertification:task:farm-lot-traceability-",
    requirementSummary: "7 CFR 205.103 requires audit-trail records that span purchase or acquisition through production to sale or transport and trace products back to the last certified operation. 7 CFR 205.307 requires lot numbers on nonretail containers used to ship or store organic products. Lot tasks connect seed, harvest, handling, storage, labels, sales, and transport into a traceable product record.",
    references: ["205.103", "205.201", "205.307", "205.403"],
  },
  {
    prefix: "organicCertification:task:farm-handling-mass-balance-",
    requirementSummary: "7 CFR 205.272 requires handlers to prevent commingling of organic and nonorganic products and protect organic products from prohibited-substance contact, including container and packaging risks. 7 CFR 205.103 and inspection requirements support quantity reconciliation, while labeling rules govern organic claim wording. Handling and mass-balance tasks keep cleaning, separation, sales, losses, and discrepancy evidence reviewable.",
    references: ["205.272", "205.103", "205.201", "205.300", "205.403"],
  },
];

const DEFAULT_REQUIREMENT_SUMMARY =
  "USDA organic certification review generally relies on the Organic System Plan requirements in 7 CFR 205.201 and the auditable recordkeeping requirements in 7 CFR 205.103. Farmer-created certification tasks should explain how the task supports the local OSP, farm records, or certifier follow-up.";

export function isOrganicCertificationTask(task: PlanningTask): boolean {
  return (
    task.source === "organicCertification" ||
    task.source === "organicCertificationTemplate" ||
    Boolean(task.templateKey?.startsWith("organicCertification:task:"))
  );
}

export function getOrganicCertificationTaskRequirementExplanation(task: PlanningTask): OrganicTaskRequirementExplanation {
  const templateKey = task.templateKey;
  const requirement = templateKey ? REQUIREMENT_RULES.find((rule) => {
    if (rule.templateKey) {
      return rule.templateKey === templateKey;
    }
    return rule.prefix ? templateKey.startsWith(rule.prefix) : false;
  }) : undefined;

  if (!requirement) {
    return {
      isTemplateMapped: false,
      reason: buildTaskSpecificRequirementSummary(task, DEFAULT_REQUIREMENT_SUMMARY),
      references: [REQUIREMENT_REFERENCES["205.201"], REQUIREMENT_REFERENCES["205.103"]],
    };
  }

  return {
    isTemplateMapped: true,
    reason: buildTaskSpecificRequirementSummary(task, requirement.requirementSummary),
    references: requirement.references.map((key) => REQUIREMENT_REFERENCES[key]),
  };
}

function buildTaskSpecificRequirementSummary(task: PlanningTask, requirementSummary: string): string {
  return `${requirementSummary} This task narrows that requirement to "${task.title}" with expected evidence: ${cleanExpectedEvidence(task.notes)}.`;
}

function cleanExpectedEvidence(notes?: string): string {
  const evidence = notes?.replace(/^Expected evidence:\s*/i, "").trim();
  if (!evidence) {
    return "supporting records or notes that explain the certification work";
  }

  return evidence.replace(/[.。]+$/u, "");
}
