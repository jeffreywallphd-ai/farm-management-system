import type { Clock } from "../../ports/Clock";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { PlanningRepository } from "../../ports/PlanningRepository";
import type { FarmId } from "../../../domain/farm/Farm";
import type { PlanningGoal, PlanningTask } from "../../../domain/planning/Planning";
import { savePlanningGoal, savePlanningTask } from "./ManagePlanning";

interface TemplateTask {
  key: string;
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

interface TemplateRootGoal {
  key: string;
  title: string;
  description: string;
  subgoals: TemplateSubgoal[];
}

const CERTIFICATION_TEMPLATE_GOALS: TemplateRootGoal[] = [
  {
    key: "certification-administration-work",
    title: "Complete certification administration work",
    description: "Keep certifier, renewal, records, input approval, and Organic System Plan administration ready.",
    subgoals: [
      {
        key: "admin-profile",
        title: "Set up certification profile",
        description: "Keep certifier, certificate, renewal, inspection, and scope context current.",
        tasks: [
          {
            key: "review-certifier-contact",
            title: "Review certifier contact information",
            notes: "Expected evidence: current certifier name, contact method, certification status, certificate number when certified, and notes from the latest certifier instructions.",
            priority: "high",
          },
          {
            key: "set-operation-status",
            title: "Set organic operation status",
            notes: "Expected evidence: farmer-entered status for certified, transitioning, exempt, split, or nonorganic context and a note explaining the current certification posture.",
            priority: "high",
          },
          {
            key: "select-certification-scopes",
            title: "Select certification scopes",
            notes: "Expected evidence: enabled scopes such as crops, handling, wild crops, livestock, mushrooms, imports, producer group, or labeling/product claims for certifier review.",
          },
          {
            key: "enter-certificate-details",
            title: "Enter certificate details",
            notes: "Expected evidence: certificate number, effective date, certified scope, and any local reference to the current certificate when already certified.",
          },
          {
            key: "set-renewal-date",
            title: "Set annual update due date",
            notes: "Expected evidence: annual update due date from certifier notice, renewal schedule, or farmer-entered planning note.",
          },
          {
            key: "set-inspection-window",
            title: "Set inspection window",
            notes: "Expected evidence: expected inspection window, certifier email or letter when available, and notes about inspection timing.",
          },
          {
            key: "collect-certifier-forms",
            title: "Collect certifier forms and current OSP template",
            notes: "Expected evidence: local note or reference naming the certifier's required forms, Common OSP sections if used, and any special instructions the app does not replace.",
            priority: "high",
          },
        ],
      },
      {
        key: "admin-recordkeeping",
        title: "Set up recordkeeping and audit trail administration",
        description: "Keep record retention, audit trail, and recovery/export practices ready for review.",
        tasks: [
          {
            key: "set-retention-years",
            title: "Set record retention years",
            notes: "Expected evidence: record retention period used by the farm and a note confirming the retention period expected for certification review.",
            priority: "high",
          },
          {
            key: "name-record-storage-locations",
            title: "Name where certification records are kept",
            notes: "Expected evidence: locations or systems where labels, invoices, farm notes, organic records, reports, photos, and exports are stored.",
          },
          {
            key: "check-purchase-through-sale-trail",
            title: "Check purchase-through-sale audit trail setup",
            notes: "Expected evidence: note confirming records can trace purchase or acquisition through production, harvest, handling, sale, or transport for certifier review.",
            priority: "high",
          },
          {
            key: "create-recovery-copy-routine",
            title: "Create recovery-copy routine",
            notes: "Expected evidence: local export or recovery-copy practice, last review date, and where the farmer keeps recovery files.",
          },
          {
            key: "document-exemption-or-split-operation",
            title: "Document exemption or split-operation posture",
            notes: "Expected evidence: exempt-sales context if used, split organic/nonorganic areas or products, and any certifier guidance about records still needed.",
          },
        ],
      },
      {
        key: "admin-input-approvals",
        title: "Review input approvals and restrictions",
        description: "Keep input labels, composition, sources, restrictions, and certifier-review notes ready before use.",
        tasks: [
          {
            key: "list-production-inputs",
            title: "List every production input",
            notes: "Expected evidence: input name, manufacturer, supplier, composition, source, and intended crop or place for every production input.",
            priority: "high",
          },
          {
            key: "list-handling-inputs",
            title: "List every handling input",
            notes: "Expected evidence: input name, manufacturer, supplier, composition, source, and intended handling or storage location for every handling input.",
          },
          {
            key: "attach-current-label",
            title: "Attach current input label evidence",
            notes: "Expected evidence: current product label, ingredient sheet, SDS, or local reference for each input when available.",
            priority: "high",
          },
          {
            key: "record-purchase-evidence",
            title: "Record input purchase evidence",
            notes: "Expected evidence: invoice, receipt, purchase date, supplier, and lot or batch identifier when shown.",
          },
          {
            key: "mark-approval-status",
            title: "Mark input approval status",
            notes: "Expected evidence: farmer-entered approval status, certifier/OMRI/WSDA/National List evidence entered by the farmer, and notes about who reviewed the input.",
            priority: "high",
          },
          {
            key: "review-restricted-inputs",
            title: "Review restricted input notes",
            notes: "Expected evidence: restriction notes, allowed-use conditions, expiration or review date, and certifier follow-up still needed.",
            priority: "high",
          },
          {
            key: "resolve-unknown-inputs",
            title: "Resolve unknown or needs-review inputs",
            notes: "Expected evidence: list of inputs still marked unknown or needs review and the next certifier question or review step for each.",
            priority: "high",
          },
          {
            key: "confirm-approval-before-use",
            title: "Confirm input approval before use",
            notes: "Expected evidence: certifier email, approval date, restriction notes, and the person who checked the input before it was applied or used.",
            priority: "high",
          },
          {
            key: "separate-input-storage",
            title: "Separate organic-use inputs from nonorganic materials",
            notes: "Expected evidence: storage notes, labels, receipts, and handling procedures showing how organic inputs are identified and kept from prohibited or nonorganic materials.",
          },
        ],
      },
      {
        key: "admin-osp-practices",
        title: "Draft OSP practices, inputs, and monitoring",
        description: "Keep Organic System Plan practice, procedure, input, substance, and monitoring narratives ready.",
        tasks: [
          {
            key: "draft-production-practices",
            title: "Draft production practice narrative",
            notes: "Expected evidence: current narrative describing crop production practices, procedures, and how often they are performed.",
          },
          {
            key: "draft-handling-practices",
            title: "Draft handling practice narrative",
            notes: "Expected evidence: current narrative describing harvest, wash/pack, storage, labeling, and sale handling practices when applicable.",
          },
          {
            key: "update-osp-input-list",
            title: "Update OSP input and substance list",
            notes: "Expected evidence: every production or handling input with composition, source, location of use, restrictions, and commercial availability documentation when applicable.",
            priority: "high",
          },
          {
            key: "describe-monitoring-frequency",
            title: "Describe monitoring practices and frequency",
            notes: "Expected evidence: how the farm checks that practices are followed, how suppliers and organic status are verified, and how monitoring is recorded.",
          },
          {
            key: "match-osp-narratives-to-records",
            title: "Match OSP narratives to implemented records",
            notes: "Expected evidence: notes linking OSP sections to local records or screens for places, inputs, seeds, soil, compost, manure, pest actions, traceability, handling, and reports.",
          },
        ],
      },
      {
        key: "admin-osp-recordkeeping",
        title: "Document OSP recordkeeping and prevention procedures",
        description: "Keep recordkeeping, commingling prevention, prohibited-substance prevention, and certifier follow-up notes ready.",
        tasks: [
          {
            key: "draft-recordkeeping-system",
            title: "Draft organic recordkeeping system description",
            notes: "Expected evidence: where records live, how farm notes and organic records link together, retention years, audit-trail coverage, and export/recovery-copy practice.",
            priority: "high",
          },
          {
            key: "draft-commingling-prevention",
            title: "Draft commingling-prevention procedure",
            notes: "Expected evidence: physical barriers, management practices, storage/handling procedures, and split-operation safeguards for organic and nonorganic products.",
            priority: "high",
          },
          {
            key: "draft-prohibited-contact-prevention",
            title: "Draft prohibited-substance contact prevention procedure",
            notes: "Expected evidence: cleaning, storage, buffer, equipment, container, and input-control procedures that prevent prohibited-substance contact.",
            priority: "high",
          },
          {
            key: "write-certifier-questions",
            title: "Write certifier-specific questions",
            notes: "Expected evidence: open questions, certifier-required fields not yet covered by the app, and notes to transfer into the certifier's required OSP form.",
          },
          {
            key: "create-follow-up-tasks-for-gaps",
            title: "Create follow-up tasks for OSP gaps",
            notes: "Expected evidence: open questions, missing certifier fields, unclear procedures, owner or responsible person label if useful, and target dates for each follow-up item.",
          },
        ],
      },
    ],
  },
  {
    key: "certification-farm-work",
    title: "Complete certification farm work",
    description: "Do the field, handling, traceability, compost, manure, seed, and daily-record work needed for organic review.",
    subgoals: [
      {
        key: "farm-land",
        title: "Document land and transition status",
        description: "Keep place status, transition dates, boundaries, buffers, and drift notes ready.",
        tasks: [
          {
            key: "list-organic-places",
            title: "List every organic and transitioning place",
            notes: "Expected evidence: each field, bed, greenhouse, buffer, excluded area, nonorganic area, wash/pack, and storage place named with current place path.",
            priority: "high",
          },
          {
            key: "set-place-status",
            title: "Set organic status for each place",
            notes: "Expected evidence: each relevant place marked transitioning, certified organic, eligible, buffer, excluded, or nonorganic.",
            priority: "high",
          },
          {
            key: "record-last-prohibited-substance-date",
            title: "Record last prohibited-substance date for each place",
            notes: "Expected evidence: last prohibited substance date, prior manager notes, applicator records, or farmer statement for each organic or transitioning place.",
            priority: "high",
          },
          {
            key: "record-transition-eligibility-date",
            title: "Record transition eligibility date for each place",
            notes: "Expected evidence: calculated transition eligibility date and supporting prohibited-substance history for each transitioning place.",
            priority: "high",
          },
          {
            key: "write-boundary-description",
            title: "Write boundary description for each organic place",
            notes: "Expected evidence: written boundary description showing roads, fences, hedges, signs, waterways, or other markers around each organic place.",
          },
          {
            key: "record-buffer-widths",
            title: "Record buffer widths and barriers",
            notes: "Expected evidence: buffer width, barrier, runoff/diversion, or vegetation notes for places next to nonorganic or risk areas.",
          },
          {
            key: "attach-boundary-photo-or-map",
            title: "Attach boundary photo or map evidence",
            notes: "Expected evidence: field photo, map note, geometry screenshot, or local reference linked to each relevant boundary or buffer.",
          },
          {
            key: "record-adjacent-land-use",
            title: "Record adjacent land use and drift risk",
            notes: "Expected evidence: neighboring land-use notes, contamination or drift risk notes, and any known spray, runoff, or buffer concerns.",
          },
          {
            key: "record-drift-incident",
            title: "Record contamination or drift incident follow-up",
            notes: "Expected evidence: incident date, affected place/crop, suspected source, buffer or crop-handling response, linked farm note or photo, and certifier-notification notes when follow-up is needed.",
          },
          {
            key: "match-place-names-to-certifier-map",
            title: "Match place names to certifier map terms",
            notes: "Expected evidence: place names and map labels that match how the certifier expects fields, beds, greenhouses, wash/pack, storage, and buffers to be identified.",
          },
        ],
      },
      {
        key: "farm-input-applications",
        title: "Track input applications and evidence",
        description: "Keep application dates, rates, places, reasons, weather, and linked evidence ready.",
        tasks: [
          {
            key: "record-application-date",
            title: "Record each input application date",
            notes: "Expected evidence: date for each organic input application.",
            priority: "high",
          },
          {
            key: "record-application-place-crop",
            title: "Record input application place and crop",
            notes: "Expected evidence: field, bed, greenhouse, crop, or handling location for each input application.",
            priority: "high",
          },
          {
            key: "record-application-quantity-rate",
            title: "Record input quantity and rate",
            notes: "Expected evidence: quantity, unit, rate when known, and calculation or label context for each input application.",
          },
          {
            key: "record-application-reason",
            title: "Record input application reason",
            notes: "Expected evidence: reason for use, target problem when applicable, and related observation or OSP condition.",
          },
          {
            key: "record-weather-applied-by",
            title: "Record weather and applied-by context",
            notes: "Expected evidence: weather notes, field conditions, applicator or responsible person, and linked farm note when useful.",
          },
          {
            key: "link-application-evidence",
            title: "Link evidence to input application",
            notes: "Expected evidence: linked farm note, photo, local reference, or material-use record supporting the application.",
          },
          {
            key: "reconcile-material-use",
            title: "Reconcile input application with material-use record",
            notes: "Expected evidence: organic input application matched to material-use record or a note explaining why the certification application log is the source record.",
          },
          {
            key: "correct-application-gaps",
            title: "Correct missing or duplicate application details",
            notes: "Expected evidence: notes for missing rates, corrected quantities, skipped place/crop context, or duplicate entries so the farmer can explain gaps without inventing records.",
          },
        ],
      },
      {
        key: "farm-seeds",
        title: "Organize seed and planting records",
        description: "Keep seed lots, commercial availability searches, invoices, labels, and planting events ready.",
        tasks: [
          {
            key: "enter-seed-lot",
            title: "Enter seed lot for each planted variety",
            notes: "Expected evidence: crop, variety, supplier, lot number, purchase date, and quantity for each seed lot.",
            priority: "high",
          },
          {
            key: "attach-seed-label-invoice",
            title: "Attach seed label and invoice evidence",
            notes: "Expected evidence: seed label reference, invoice or receipt reference, supplier, purchase date, and lot number where shown.",
          },
          {
            key: "record-seed-organic-status",
            title: "Record seed organic status",
            notes: "Expected evidence: organic, nonorganic untreated, treated, or unknown seed status for each seed lot.",
            priority: "high",
          },
          {
            key: "record-seed-treatment-status",
            title: "Record seed treatment status",
            notes: "Expected evidence: treatment name, untreated confirmation, allowed treatment context, phytosanitary requirement, or variance note when relevant.",
          },
          {
            key: "perform-commercial-availability-search",
            title: "Perform commercial availability search",
            notes: "Expected evidence: supplier searched, date searched, crop/variety requested, search result, and reason an equivalent organic variety was not available.",
            priority: "high",
          },
          {
            key: "record-commercial-search-results",
            title: "Record supplier search results",
            notes: "Expected evidence: supplier names, responses, dates, varieties offered, quantities, quality or timing limitations, and farmer-entered reason for nonorganic seed use.",
          },
          {
            key: "flag-sprout-seed-organic-only",
            title: "Flag edible sprout seed as organic only",
            notes: "Expected evidence: seed lot notes identifying edible sprout use and organic seed status for certifier review.",
            priority: "high",
          },
          {
            key: "review-planting-stock-exception",
            title: "Review planting stock exception or variance",
            notes: "Expected evidence: planting stock source, organic status, management period for perennial stock when relevant, variance or phytosanitary notes, and certifier guidance.",
          },
          {
            key: "record-planting-event",
            title: "Record planting event",
            notes: "Expected evidence: planting date, crop, farm place, quantity, planting method, and linked farm note when field context matters.",
            priority: "high",
          },
          {
            key: "link-planting-to-seed-lot",
            title: "Link planting event to seed lot",
            notes: "Expected evidence: planting event connected to the seed lot used for that crop, place, and date.",
            priority: "high",
          },
          {
            key: "record-annual-seedling-source",
            title: "Record annual seedling source and status",
            notes: "Expected evidence: annual seedling source, organic status, label or invoice reference, and certifier guidance when relevant.",
          },
        ],
      },
      {
        key: "farm-soil-fertility",
        title: "Document soil fertility and crop rotation practices",
        description: "Keep soil-building, erosion-control, soil-test, cover-crop, and rotation evidence ready.",
        tasks: [
          {
            key: "record-soil-fertility-practice",
            title: "Record soil fertility practice",
            notes: "Expected evidence: soil-building practice, place, season, date or date range, and linked farm note when useful.",
          },
          {
            key: "record-soil-test",
            title: "Record soil test evidence",
            notes: "Expected evidence: soil-test date, place, result reference, and how the result informed soil-building decisions.",
          },
          {
            key: "record-erosion-observation",
            title: "Record erosion observation",
            notes: "Expected evidence: place, date, slope or runoff concern, photo or farm note, and severity notes.",
          },
          {
            key: "record-erosion-control-practice",
            title: "Record erosion-control practice",
            notes: "Expected evidence: cover, contouring, mulch, water diversion, reduced tillage, or other erosion-control practice tied to place and season.",
          },
          {
            key: "record-crop-rotation",
            title: "Record crop rotation by place and season",
            notes: "Expected evidence: crop sequence by place, season, and year, including cover crops or fallow periods when used.",
            priority: "high",
          },
          {
            key: "record-cover-crop",
            title: "Record cover crop or green manure",
            notes: "Expected evidence: species or mix, planting date, termination date when known, place, purpose, and linked farm note.",
          },
          {
            key: "record-plant-material-source",
            title: "Record plant material amendment source",
            notes: "Expected evidence: source, composition, place/crop, application reason, and any contamination-risk or certifier-review notes.",
          },
          {
            key: "record-animal-material-source",
            title: "Record animal material amendment source",
            notes: "Expected evidence: source, type, composition, manure/compost distinction, place/crop, application reason, and certifier-review notes.",
          },
          {
            key: "check-prohibited-soil-materials",
            title: "Check prohibited soil material risks",
            notes: "Expected evidence: notes that sewage sludge, disallowed synthetic substances, and crop-residue burning are not used unless a specific allowed exception or certifier instruction is documented.",
            priority: "high",
          },
        ],
      },
      {
        key: "farm-compost",
        title: "Manage compost evidence",
        description: "Keep compost batch classification, temperature checks, turn records, and cold/unfinished material review ready.",
        tasks: [
          {
            key: "create-compost-batch",
            title: "Create compost batch record",
            notes: "Expected evidence: batch identifier, start date, method, location, and responsible person or note.",
            priority: "high",
          },
          {
            key: "list-compost-ingredients",
            title: "List compost batch ingredients",
            notes: "Expected evidence: ingredient list, source, rough proportions, and manure or plant material distinction.",
          },
          {
            key: "record-carbon-nitrogen-ratio",
            title: "Record compost C:N ratio",
            notes: "Expected evidence: initial C:N ratio note or calculation showing whether the batch is in the 25:1 to 40:1 range used for NOP compost process review.",
            priority: "high",
          },
          {
            key: "classify-compost-process",
            title: "Classify compost process type",
            notes: "Expected evidence: process classified as static aerated pile, in-vessel, windrow, cold/unfinished, aged material, or raw-manure interval material.",
            priority: "high",
          },
          {
            key: "check-static-temperature",
            title: "Check static or in-vessel compost temperature",
            notes: "Expected evidence: daily temperature readings for the static aerated pile or in-vessel process during the 3-day review window.",
          },
          {
            key: "confirm-static-temperature-window",
            title: "Confirm static or in-vessel temperature window",
            notes: "Expected evidence: temperature log showing 131-170 F for 3 days for static aerated pile or in-vessel compost.",
          },
          {
            key: "check-windrow-temperature",
            title: "Check windrow compost temperature",
            notes: "Expected evidence: temperature readings during the 15-day windrow review window.",
          },
          {
            key: "turn-windrow-pile",
            title: "Turn windrow compost pile",
            notes: "Expected evidence: turn date, batch identifier, turn count, and note that the pile was turned during the 15-day review window.",
            priority: "high",
          },
          {
            key: "record-windrow-turn-dates",
            title: "Record windrow turn dates",
            notes: "Expected evidence: at least five turn dates during the 15-day windrow temperature period.",
            priority: "high",
          },
          {
            key: "confirm-windrow-temperature-window",
            title: "Confirm windrow temperature window",
            notes: "Expected evidence: temperature log showing 131-170 F for 15 days and at least five turns during that period.",
            priority: "high",
          },
          {
            key: "flag-compost-temperature-gap",
            title: "Flag compost temperature gap",
            notes: "Expected evidence: missing logs, out-of-range temperatures, insufficient turns, monitoring notes, and certifier-review or follow-up decision.",
          },
          {
            key: "flag-cold-or-unfinished-pile",
            title: "Flag cold or unfinished pile for review",
            notes: "Expected evidence: ingredient notes, age/start date, temperature gap notes, turns if any, and a decision note to treat as certifier-review material or follow raw manure interval planning until accepted.",
            priority: "high",
          },
          {
            key: "record-compost-status-before-application",
            title: "Record compost batch status before application",
            notes: "Expected evidence: batch status, process decision, and whether the material is treated as compost or as material needing raw-manure interval planning.",
            priority: "high",
          },
          {
            key: "record-compost-application",
            title: "Record compost application",
            notes: "Expected evidence: batch identifier, application place/crop, application date, quantity, and linked farm note when useful.",
          },
        ],
      },
      {
        key: "farm-manure",
        title: "Track raw manure applications and harvest intervals",
        description: "Keep manure sources, application context, edible-portion contact, and 90/120-day interval evidence ready.",
        tasks: [
          {
            key: "record-manure-source",
            title: "Record raw manure source and type",
            notes: "Expected evidence: source, type, lot or supplier when available, and whether the material is raw manure or another animal material.",
            priority: "high",
          },
          {
            key: "record-manure-application-date",
            title: "Record raw manure application date",
            notes: "Expected evidence: application date for each raw manure use.",
            priority: "high",
          },
          {
            key: "record-manure-place-crop",
            title: "Record raw manure place and crop",
            notes: "Expected evidence: place, crop, quantity, application method, and incorporation or surface application notes.",
          },
          {
            key: "identify-edible-soil-contact",
            title: "Identify edible portion soil contact",
            notes: "Expected evidence: crop/place notes showing whether the edible portion has direct contact with soil or soil particles.",
            priority: "high",
          },
          {
            key: "calculate-manure-harvest-interval",
            title: "Calculate manure harvest interval date",
            notes: "Expected evidence: calculated 90-day or 120-day earliest harvest date based on application date and edible-portion contact context.",
            priority: "high",
          },
          {
            key: "compare-harvest-to-interval",
            title: "Compare planned harvest to manure interval",
            notes: "Expected evidence: expected harvest date, manure application date, calculated earliest harvest date, crop contact context, and warning notes when timing needs certifier review.",
          },
          {
            key: "flag-manure-timing-conflict",
            title: "Flag manure timing conflict",
            notes: "Expected evidence: affected crop/place, interval date, planned harvest date, and follow-up note for farmer or certifier review.",
            priority: "high",
          },
          {
            key: "link-manure-evidence",
            title: "Link manure application evidence",
            notes: "Expected evidence: linked farm note, photo, local reference, or application record supporting the raw manure application.",
          },
        ],
      },
      {
        key: "farm-pest",
        title: "Document pest, weed, disease, and mulch practices",
        description: "Keep prevention hierarchy, actions, input escalation, and plastic mulch removal evidence ready.",
        tasks: [
          {
            key: "record-monitoring-observation",
            title: "Record pest, weed, or disease observation",
            notes: "Expected evidence: observation date, place, crop, severity, photos or farm-note link, and notes about the threshold or reason action was needed.",
            priority: "high",
          },
          {
            key: "record-prevention-practice",
            title: "Record prevention or cultural practice",
            notes: "Expected evidence: crop rotation, sanitation, resistant variety, nutrient management, habitat management, or other preventive practice used before treatment.",
          },
          {
            key: "record-sanitation-action",
            title: "Record sanitation or habitat-management action",
            notes: "Expected evidence: crop debris cleanup, disease-vector reduction, equipment/tool cleaning, field-edge habitat notes, and place/crop context.",
          },
          {
            key: "record-weed-control-method",
            title: "Record weed-control method",
            notes: "Expected evidence: mulch, mowing, grazing, hand weeding, mechanical cultivation, flame/heat/electrical control, or other method notes before input escalation.",
          },
          {
            key: "record-mechanical-physical-control",
            title: "Record mechanical or physical control action",
            notes: "Expected evidence: trap, barrier, cultivation, pruning, removal, row cover, or other mechanical/physical control details.",
          },
          {
            key: "record-biological-botanical-control",
            title: "Record biological or botanical control action",
            notes: "Expected evidence: control method, product label when applicable, release or application date, monitoring notes, input restriction notes, and certifier guidance.",
          },
          {
            key: "justify-input-escalation",
            title: "Document why input escalation was needed",
            notes: "Expected evidence: linked observation, prevention practices tried, why they were insufficient, input application reference, and OSP condition or certifier guidance for the input.",
            priority: "high",
          },
          {
            key: "link-input-to-observation",
            title: "Link pest input application to observation",
            notes: "Expected evidence: input application record connected to the pest, weed, or disease observation that justified it.",
          },
          {
            key: "record-plastic-mulch-installation",
            title: "Record plastic mulch installation",
            notes: "Expected evidence: installation place, date, crop, material, and farm note or photo when useful.",
          },
          {
            key: "record-plastic-mulch-removal",
            title: "Record plastic mulch removal",
            notes: "Expected evidence: removal date, place, crop, and notes showing removal at the end of the growing or harvest season.",
            priority: "high",
          },
          {
            key: "attach-mulch-removal-evidence",
            title: "Attach plastic mulch removal evidence",
            notes: "Expected evidence: photo, farm note, or local reference showing mulch removal.",
          },
          {
            key: "check-treated-lumber-contact",
            title: "Check treated-lumber contact risk",
            notes: "Expected evidence: notes for new or replacement lumber, trellis, bed, or livestock-contact installations showing prohibited treated materials are avoided or reviewed.",
          },
        ],
      },
      {
        key: "farm-lot-traceability",
        title: "Prepare lot traceability records",
        description: "Keep lot codes, harvest links, product audit trails, and nonretail labeling evidence ready.",
        tasks: [
          {
            key: "create-lot-record",
            title: "Create lot record for organic-claim product",
            notes: "Expected evidence: lot code, crop/product, organic status, and record date for each product represented with an organic claim.",
            priority: "high",
          },
          {
            key: "assign-lot-code",
            title: "Assign lot code",
            notes: "Expected evidence: stable lot code used on harvest, handling, storage, sale, or nonretail container records.",
            priority: "high",
          },
          {
            key: "link-lot-to-harvest",
            title: "Link lot to harvest record",
            notes: "Expected evidence: harvest record, crop, harvest place, harvest date, and source harvest record link when available.",
            priority: "high",
          },
          {
            key: "record-lot-quantity",
            title: "Record lot harvested quantity",
            notes: "Expected evidence: harvested quantity, unit, and any source harvest record or farm note when available.",
          },
          {
            key: "link-seed-planting-to-lot",
            title: "Link seed and planting context to lot",
            notes: "Expected evidence: seed lot, planting event, crop, and place references connected to the lot or audit-trail record when those records help explain product origin.",
          },
          {
            key: "record-lot-handling-event",
            title: "Record lot handling event",
            notes: "Expected evidence: handling date, lot code, activity, location, quantity, and commingling-prevention note when relevant.",
          },
          {
            key: "record-lot-storage-location",
            title: "Record lot storage location",
            notes: "Expected evidence: storage location, container, lot code, date, and cleaning or prior-use note when relevant.",
          },
          {
            key: "record-sale-lot-link",
            title: "Record sale invoice lot link",
            notes: "Expected evidence: buyer, sale date, invoice number, quantity/unit, lot code, and evidence reference.",
            priority: "high",
          },
          {
            key: "review-nonretail-labeling",
            title: "Review nonretail container lot labeling",
            notes: "Expected evidence: lot-number labeling notes for shipped or stored nonretail containers when organic claims are used.",
          },
          {
            key: "trace-product-through-sale",
            title: "Trace one product from seed or input through sale",
            notes: "Expected evidence: seed lot or input references, place, harvest lot, handling/storage records, sale invoice, and transport or buyer record where available.",
            priority: "high",
          },
        ],
      },
      {
        key: "farm-handling-mass-balance",
        title: "Review handling, storage, sales, and mass balance",
        description: "Keep commingling prevention, storage, sale, loss, and quantity reconciliation evidence ready.",
        tasks: [
          {
            key: "record-equipment-cleaning",
            title: "Record equipment cleaning before organic handling",
            notes: "Expected evidence: equipment, date, cleaning method, prior use, and lot or product handled after cleaning.",
            priority: "high",
          },
          {
            key: "record-organic-nonorganic-separation",
            title: "Record organic and nonorganic separation step",
            notes: "Expected evidence: physical separation, time separation, labels, bins, barriers, or workflow steps that prevent commingling.",
            priority: "high",
          },
          {
            key: "record-container-prior-use",
            title: "Record storage container prior use",
            notes: "Expected evidence: container ID, prior-use notes, and confirmation that reused containers pose no known prohibited-substance contact risk.",
          },
          {
            key: "record-container-cleaning",
            title: "Record reusable bag or container cleaning",
            notes: "Expected evidence: cleaning date, method, container or bag identifier, prior use, and lot/product placed inside.",
          },
          {
            key: "record-prohibited-contact-prevention",
            title: "Record prohibited-substance contact prevention",
            notes: "Expected evidence: cleaning, storage, buffer, equipment, container, or input-control practice that prevents prohibited-substance contact.",
            priority: "high",
          },
          {
            key: "record-organic-claim-wording",
            title: "Record exact organic claim wording",
            notes: "Expected evidence: exact organic claim wording used on invoice, label, sign, or sale record.",
          },
          {
            key: "record-sale-quantity",
            title: "Record quantity sold by lot",
            notes: "Expected evidence: lot code, sale quantity, unit, buyer, invoice number, and sale date.",
          },
          {
            key: "record-loss-adjustment",
            title: "Record loss, shrink, or adjustment",
            notes: "Expected evidence: affected lot, quantity/unit, reason, handling or storage context, and whether the adjustment should appear in the mass-balance review.",
          },
          {
            key: "run-mass-balance-review",
            title: "Run mass-balance review",
            notes: "Expected evidence: mass-balance report showing harvested, handled, stored, sold, lost, expected remaining, actual remaining, and any discrepancy notes as a review aid.",
            priority: "high",
          },
          {
            key: "explain-mass-balance-discrepancy",
            title: "Explain mass-balance discrepancy",
            notes: "Expected evidence: discrepancy amount, likely reason, linked loss/adjustment notes, and follow-up for farmer or certifier review.",
          },
        ],
      },
    ],
  },
];

export async function ensureOrganicCertificationPlan(
  input: { farmId: FarmId; targetDate?: string },
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: PlanningRepository },
): Promise<{
  goal: PlanningGoal;
  goals: PlanningGoal[];
  administrationGoal: PlanningGoal;
  farmWorkGoal: PlanningGoal;
  subgoals: PlanningGoal[];
  tasks: PlanningTask[];
}> {
  const existingGoals = await dependencies.repository.listGoals(input.farmId, {
    category: "organicCertification",
    source: "organicCertificationTemplate",
  });
  const existingTasks = await dependencies.repository.listTasks(input.farmId, {
    source: "organicCertificationTemplate",
  });
  const activeGoalTemplateKeys = new Set<string>();
  const activeTaskTemplateKeys = new Set<string>();

  for (const rootTemplate of CERTIFICATION_TEMPLATE_GOALS) {
    activeGoalTemplateKeys.add(templateKey("goal", rootTemplate.key));
    for (const subgoalTemplate of rootTemplate.subgoals) {
      activeGoalTemplateKeys.add(templateKey("subgoal", subgoalTemplate.key));
      for (const taskTemplate of subgoalTemplate.tasks) {
        activeTaskTemplateKeys.add(templateKey("task", `${subgoalTemplate.key}-${taskTemplate.key}`));
      }
    }
  }

  await removeRetiredTemplateRecords(
    input.farmId,
    existingGoals,
    existingTasks,
    activeGoalTemplateKeys,
    activeTaskTemplateKeys,
    dependencies.repository,
  );

  const retainedGoals = existingGoals.filter((goal) => goal.templateKey && activeGoalTemplateKeys.has(goal.templateKey));
  const retainedTasks = existingTasks.filter((task) => task.templateKey && activeTaskTemplateKeys.has(task.templateKey));
  const goals: PlanningGoal[] = [];
  const subgoals: PlanningGoal[] = [];
  const tasks: PlanningTask[] = [];

  for (const [rootIndex, rootTemplate] of CERTIFICATION_TEMPLATE_GOALS.entries()) {
    const rootTemplateKey = templateKey("goal", rootTemplate.key);
    const existingRoot = retainedGoals.find((goal) => goal.templateKey === rootTemplateKey);
    const rootGoal = existingRoot ? await savePlanningGoal(
      {
        ...existingRoot,
        parentGoalId: undefined,
        title: rootTemplate.title,
        description: rootTemplate.description,
        category: "organicCertification",
        source: "organicCertificationTemplate",
        templateKey: rootTemplateKey,
        sortOrder: rootIndex + 1,
      },
      dependencies,
    ) : await savePlanningGoal(
      {
        farmId: input.farmId,
        title: rootTemplate.title,
        description: rootTemplate.description,
        category: "organicCertification",
        status: "active",
        targetDate: input.targetDate,
        source: "organicCertificationTemplate",
        templateKey: rootTemplateKey,
        sortOrder: rootIndex + 1,
      },
      dependencies,
    );
    goals.push(rootGoal);

    for (const [subgoalIndex, subgoalTemplate] of rootTemplate.subgoals.entries()) {
      const subgoalKey = templateKey("subgoal", subgoalTemplate.key);
      const existingSubgoal = retainedGoals.find((goal) => goal.templateKey === subgoalKey);
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
        const taskKey = templateKey("task", `${subgoalTemplate.key}-${taskTemplate.key}`);
        const existingTask = retainedTasks.find((task) => task.templateKey === taskKey);
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
  }

  const administrationGoal = goals.find((candidate) => candidate.templateKey === templateKey("goal", "certification-administration-work"));
  const farmWorkGoal = goals.find((candidate) => candidate.templateKey === templateKey("goal", "certification-farm-work"));
  if (!administrationGoal || !farmWorkGoal) {
    throw new Error("Organic certification template goals could not be created.");
  }

  return { goal: administrationGoal, goals, administrationGoal, farmWorkGoal, subgoals, tasks };
}

async function removeRetiredTemplateRecords(
  farmId: FarmId,
  existingGoals: PlanningGoal[],
  existingTasks: PlanningTask[],
  activeGoalTemplateKeys: Set<string>,
  activeTaskTemplateKeys: Set<string>,
  repository: PlanningRepository,
): Promise<void> {
  for (const task of existingTasks) {
    if (task.templateKey && !activeTaskTemplateKeys.has(task.templateKey)) {
      await repository.deleteTask(farmId, task.id);
    }
  }

  for (const goal of existingGoals) {
    if (goal.templateKey && !activeGoalTemplateKeys.has(goal.templateKey)) {
      await repository.deleteGoal(farmId, goal.id);
    }
  }
}

function templateKey(kind: string, key: string): string {
  return `organicCertification:${kind}:${key}`;
}
