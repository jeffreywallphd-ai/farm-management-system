import type { Farm } from "../../../domain/farm/Farm";
import {
  INSPECTION_READINESS_CATEGORY_LABELS,
  ORGANIC_OSP_SECTION_TYPE_LABELS,
  ORGANIC_READINESS_STATUS_LABELS,
} from "../../../domain/organic/OrganicSystemPlan";
import type { Clock } from "../../ports/Clock";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type { PlanningRepository } from "../../ports/PlanningRepository";
import { PLANNING_TASK_STATUS_LABELS } from "../../../domain/planning/Planning";

export async function createOrganicSystemPlanReport(
  input: { farm: Farm; reportType: "ospDraft" | "inspectionReadiness" },
  dependencies: { clock: Clock; planningRepository?: PlanningRepository; repository: OrganicCertificationRepository },
): Promise<string> {
  const [sections, inspectionItems, templatePlanningTasks, farmerCertificationTasks] = await Promise.all([
    dependencies.repository.listOrganicSystemPlanSections(input.farm.id),
    dependencies.repository.listOrganicInspectionReadinessItems(input.farm.id),
    dependencies.planningRepository?.listTasks(input.farm.id, { source: "organicCertificationTemplate" }) ?? Promise.resolve([]),
    dependencies.planningRepository?.listTasks(input.farm.id, { source: "organicCertification" }) ?? Promise.resolve([]),
  ]);
  const planningTasks = uniqueTasksById([...templatePlanningTasks, ...farmerCertificationTasks]);
  const lines = [
    input.reportType === "ospDraft" ? "Organic System Plan Draft Summary" : "Organic Inspection Preparation Tasks",
    `Farm: ${input.farm.name}`,
    `Generated: ${dependencies.clock.now().toISOString()}`,
    "Use: This local report organizes OSP and inspection notes for farmer and certifier review. It is not a certifier submission or compliance determination.",
    "",
  ];
  if (input.reportType === "ospDraft") {
    for (const section of sections) {
      lines.push(`${ORGANIC_OSP_SECTION_TYPE_LABELS[section.sectionType]}: ${section.title}`);
      lines.push(`Status: ${ORGANIC_READINESS_STATUS_LABELS[section.readinessStatus]}`);
      lines.push(section.narrative);
      lines.push(`Evidence IDs: ${section.evidenceAttachmentIds.join(", ") || "None"}`);
      lines.push("");
    }
  } else {
    for (const task of planningTasks) {
      lines.push(`Certification task: ${task.title}`);
      lines.push(`Status: ${PLANNING_TASK_STATUS_LABELS[task.status]}`);
      lines.push(`Due date: ${task.dueDate ?? "Not set"}`);
      lines.push(`Notes: ${task.notes ?? "Not recorded"}`);
      lines.push("");
    }
    for (const item of inspectionItems) {
      lines.push(`${INSPECTION_READINESS_CATEGORY_LABELS[item.category]}: ${item.prompt}`);
      lines.push(`Status: ${ORGANIC_READINESS_STATUS_LABELS[item.readinessStatus]}`);
      lines.push(`Notes: ${item.notes ?? "Not recorded"}`);
      lines.push(`Evidence IDs: ${item.evidenceAttachmentIds.join(", ") || "None"}`);
      lines.push("");
    }
  }
  if (lines.length === 5) lines.push("No records found for this report.");
  return lines.join("\n");
}

function uniqueTasksById<T extends { id: string }>(tasks: T[]): T[] {
  return [...new Map(tasks.map((task) => [task.id, task])).values()];
}
