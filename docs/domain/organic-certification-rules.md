# Organic Certification Domain Rules

- Status: accepted
- Last reviewed: 2026-06-04
- Canonical for: domain vocabulary and record meaning for USDA organic certification readiness features
- Related ADRs: [ADR-0014](../adr/ADR-0014-organic-certification-readiness-module.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md)
- Related docs: [Organic Certification Readiness](../product/organic-certification-readiness.md), [Farm Domain Glossary](glossary.md), [Privacy, Visibility, and Sharing Rules](privacy-visibility-and-sharing-rules.md), [Persistence and Attachment Storage](../architecture/persistence-and-attachment-storage.md)
- Related tests: [Organic certification use-case tests](../../apps/mobile/src/application/use-cases/organicCertificationUseCases.test.ts)
- Supersedes: none

## Purpose

This document defines the domain meaning of organic certification readiness records. It is not a restatement of all USDA organic regulations. Each implementation phase must add focused domain rules after official requirement review.

## Core Terms

| Term | Meaning |
| --- | --- |
| Organic certification readiness | The app's organization of farm-entered records, evidence, reminders, and reports that may support USDA organic certification work. |
| Organic operation profile | The local farm's user-entered certification context: current organic status, scopes, certifier information, annual update dates, inspection window, retention years, and notes. |
| Organic certification scope | A national USDA/NOP scope category that may be relevant to the operation, such as crops, livestock, wild crops, handling, mushrooms, producer group, imports, or packaged product labeling. |
| Organic Profile Report | A generated local report summarizing the organic operation profile and selected scopes for farmer/certifier preparation. |
| Organic report package PDF | A user-exported local PDF rendering of a saved organic report package. It is a portable report artifact, not a submission, signature, certifier form, or compliance determination. |
| Readiness status | An app status describing whether user-entered data appears present, partial, missing, or not applicable for a category. It is not a legal compliance finding. |
| Certifier note | User-entered information from or for an accredited certifying agent. The app does not verify certifier identity or submit data. |
| Organic evidence link | A farmer-confirmed local relationship between a saved farm note and an organic category or organic readiness record. It gives certification meaning to an existing note without copying or replacing the note. |
| Certification planning task | A local planning task shown inside Organic Certification for certification preparation work. It uses the shared planning foundation but does not create worker accounts, legal assignments, or compliance determinations. |

## Phase 1 Domain Rules

- Organic tracking is optional and farm-local.
- A farm may have at most one active Phase 1 organic operation profile in the local mobile app.
- `notOrganic` means the farm wants organic certification pursuit/continuation turned off in the app. The Organic Certification dashboard, seeded certification goals, and certification boards should stay hidden while this status is active, although local certification records may remain stored for recovery and later reactivation.
- `transitioning` means the farm is preparing for organic certification or organic production but is not represented by the app as certified.
- `exempt` means the farmer has identified an exemption posture. The app must still present records as useful evidence because exempt operations may have recordkeeping obligations.
- `certified` means the farmer has entered a certified status and optional certifier/certificate fields. The app does not verify certification.
- `splitOperation` means organic and nonorganic activities may both exist. Phase 1 only captures the profile posture; Phase 2 and later handle places, commingling, buffers, and traceability.
- Record retention years defaults to 5 for certified, transitioning, split, and unknown certified-scope contexts, reflecting 7 CFR 205.103. Exempt operations may use 3 based on 7 CFR 205.101, but the farmer can adjust the field.
- Certification scope selection only enables later module relevance. Selecting a scope in Phase 1 does not create records for that scope.

## Phase 2 Domain Rules

- An organic place profile is the app's local organic-readiness overlay for a saved farm place. It does not replace the farm-place record or change the farm-place hierarchy.
- Organic place paths are derived from current farm-place names and parent/child relationships at display/report time. Renaming a parent place updates derived child paths without rewriting organic records.
- `nonOrganic` means the farmer identifies the place as not managed or represented as organic in the app.
- `transitioning` means the farmer is tracking transition history but the app does not represent the place as certified.
- `eligibleOrganic` means the farmer has recorded information suggesting the place may be ready for certifier review. It is not a legal eligibility determination.
- `certifiedOrganic` means the farmer has identified the place as certified in their records. The app does not verify certification.
- `buffer` means the place is tracked primarily as a buffer zone or boundary-protection area.
- `excluded` means the farmer wants the place left out of organic readiness tracking or organic production claims.
- When a last prohibited substance date is entered, the app may calculate a planning eligibility date three years later. The report must describe this as planning/support information for certifier review.
- Boundary/buffer evidence is local evidence linked to a farm place. It may reference local media, notes, maps, or documents, but the app must not upload or submit that evidence automatically.

## Phase 3 Domain Rules

- An organic input is the app's local certification-readiness record for a material, substance, or product that may be used in organic production or handling.
- Organic inputs may link to an existing tracked material from Inventory Management but can also exist without that link when the farmer wants a certification record before inventory cleanup.
- Inventory catalog items may also store organic relevance, approval/review status, regulation notes, and evidence notes for farm inputs/materials and equipment. These fields are intended to make inventory usable as a long-term home for input and equipment evidence if the standalone certification module is reduced later.
- When organic certification pursuit is off, organic inventory fields may remain optional supporting context. When a farmer marks an inventory item as organic-relevant, user-facing copy and validation should guide the farmer toward approval/evidence notes, but the app still must not decide acceptability.
- Approval status is farmer-entered evidence organization. The app must not automatically verify OMRI, WSDA, National List, certifier approval, allowed status, restricted status, or prohibited status.
- `needsReview`, `unknown`, `restricted`, and `prohibited` statuses should be surfaced in reports as attention items for farmer/certifier review, not as final compliance findings.
- An organic input application records how a saved organic input was used, including optional place, crop, date, quantity, rate, reason, target problem, weather notes, applied-by, evidence references, and optional farm-note link.
- Evidence attachment IDs or references are local organizational links. They do not imply the app has verified the evidence or submitted it externally.

## Phase 4 Domain Rules

- A seed lot is a farmer-entered record for seed or planting stock used or intended for organic production.
- Organic seed status is farmer-entered and not automatically verified by the app.
- Nonorganic seed lots should be paired with commercial availability evidence where relevant, but the app does not decide whether the farmer's search is sufficient for certification.
- Commercial availability search records capture supplier search evidence and the farmer-entered reason an equivalent organic variety was not available in the needed variety, quantity, quality, or timing.
- Planting events connect seed lots to crop/place/date context for traceability and inspection preparation.
- Edible sprout seed requirements must be handled with certifier/legal care in later scope; Phase 4 does not make an automatic sprout acceptability decision.

## Phase 5 Domain Rules

- Soil fertility practices are farmer-entered evidence of soil-building, erosion-control, soil-test, and amendment practices.
- Compost batches and temperature logs organize evidence for compost production. The app records method, temperatures, and turns but does not certify that a batch meets NOP compost standards.
- Manure applications calculate 90-day or 120-day earliest harvest dates from farmer-entered contact-with-soil context. These dates are planning warnings for review, not automatic harvest blocks or compliance determinations.
- Crop rotation records document place/crop/year/season history and rotation purpose. They do not generate crop plans or agronomic recommendations.

## Phase 6 Domain Rules

- Pest, weed, and disease observations are separate from actions so the farmer can show prevention, monitoring, and intervention history.
- Actions can represent prevention, sanitation, cultural, mechanical, physical, biological, botanical, allowed-synthetic, or other methods.
- Input escalation records organize why an input was used after other practices were insufficient. The app does not verify that escalation satisfies NOP requirements.
- Plastic mulch records organize installation/removal evidence. The app does not certify field cleanup.

## Phase 7 Domain Rules

- An organic lot is a farmer-entered traceability record for a harvested quantity that may be represented, reviewed, stored, handled, or sold together.
- Organic lots may link to an existing manual harvest record by ID. The app does not automatically create lots from every harvest because lot identity and labeling are farm workflow decisions.
- Handling events record lot movement and transformation context, including equipment and cleaning references where the farmer chooses to enter them.
- Storage records capture local lot/container/location history. They support traceability and mass-balance review but do not replace physical labels or certifier-required procedures.
- Sale records capture buyer, invoice, organic claim wording, and evidence references for lot-to-sale traceability.
- Mass-balance snapshots are planning and inspection-preparation calculations from local records. They identify arithmetic discrepancies but do not determine compliance.
- Lot reports should preserve stable IDs and show current crop/place references through lookup where available. Historical lot codes and optional harvest record IDs are stored as entered.

## Phase 8 Domain Rules

- An Organic System Plan section is a farmer-entered local draft note that organizes information likely needed for certifier review.
- OSP sections in the app do not replace certifier forms, Common OSP templates, or certifier-specific submission requirements.
- Inspection-readiness preparation uses certification planning tasks. Task status means local work status, not compliance status.
- OSP and inspection reports must state that they are local organization aids and not certifier submissions or compliance determinations.

## Phase 9 Domain Rules

- An organic report package is a farmer-generated local bundle of report text and a manifest of included report names and record counts.
- Report packages are retained as local records so a farmer can see what was assembled at a point in time.
- A report package is not a certifier submission, certification packet accepted by any agency, legal determination, or replacement for certifier-required forms.
- Report packages should include linked farm-note evidence references where present. The package may reference the note, its local attachments, and farmer-written evidence notes, but it must not duplicate media files inside organic records.
- Saved report packages may be exported as local PDFs through explicit farmer action. PDF export must not upload, submit, sign, certify, or imply certifier acceptance of the package.

## Farm-Note Evidence Rules

- Farm notes remain the source capture records for voice memos, photos, and quick field context.
- Organic evidence links are local organizational relationships. They do not create a new evidence inbox, copy media, certify the note, or verify that the note satisfies a regulation.
- A farm note may be marked for organic review without being linked yet. This is a farmer-managed follow-up cue.
- A linked farm note may support more than one organic category or record when the farmer confirms each relationship.
- Removing or changing an evidence link must not delete the underlying farm note, audio, photo, or transcript draft.
- Reports should describe linked farm notes as supporting evidence references for certifier review, not as proof of compliance.

## Phase 10 Domain Rules

- An advanced-scope record is a farmer-entered local readiness note for an organic scope that needs specialty certifier review.
- Advanced-scope records organize evidence for livestock, wild crops, mushrooms, producer groups, imports, and labeling/product claims.
- These records do not implement the full regulatory logic for any advanced scope and must not be presented as specialty-scope compliance findings.

## Certification Planning Rules

- Organic Certification may seed local certification goals, subgoals, and tasks from the shared planning foundation.
- Certification pursuit/continuation is controlled from Farm setup. The Organic Certification dashboard, Farm Planning review lists, and Farm Work Boards should show seeded certification goals only when the organic operation profile is active for certification work. Missing profiles and `notOrganic` profiles should be treated as off.
- Seeded certification planning should use two highest-level goals: certification administration work and certification farm work. Administration work covers certifier/profile setup, recordkeeping administration, input approval review, and OSP drafting/follow-up. Farm work covers field, handling, compost, manure, seed, traceability, input-application, pest, and mass-balance work.
- Seeded certification subgoals should be split when the farmer needs different evidence records, review cadence, or certifier questions for the work. Input approval review should be separate from input application logs; soil fertility and rotation should be separate from compost-process evidence and raw-manure interval planning; lot traceability should be separate from handling/storage/sales mass-balance review; and OSP practice/input/monitoring narratives should be separate from OSP recordkeeping, commingling-prevention, and certifier follow-up procedures.
- Seeded certification tasks should be actionable and evidence-oriented. Farm-work tasks should be split down to direct actions when the underlying work differs, such as checking compost temperature separately from turning a compost pile, recording application dates separately from quantities/rates, or assigning lot codes separately from tracing a product through sale. Task notes may describe expected evidence such as labels, receipts, certifier notes, farm-note links, temperature logs, turn logs, transition dates, buffers, traceability records, OSP narratives, and report packages, but those notes are guidance for farmer/certifier review rather than proof of compliance.
- Certification task cards should include a farmer-readable "Summary of USDA Requirements" that explains why the specific task exists and references the USDA/NOP sections that call for the related practice, record, or evidence. Summaries should include the task title and expected evidence context so they remain specific to the action being shown rather than repeated generic category text. These references are educational anchors for certifier preparation and must not be presented as an app determination that the task satisfies the requirement.
- Dedicated evidence-review and package-generation workflows replace the former seeded `Prepare inspection evidence` and `Generate certification or renewal package` goals. Template-owned manual checklist records for those goals should be removed rather than maintained in parallel.
- Certification goals and tasks must remain editable by the farmer, including timeline and status fields.
- Certification planning records are preparation aids. They must not be presented as certifier-approved work, legal assignments, or proof that a requirement has been satisfied.
- Requirement links may open official USDA or eCFR pages only through farmer action. When an in-app viewer with a clear close control is not available, the app must prompt before opening the default browser and must not transmit farm records through the link.
- Farm notes remain the source evidence records. Planning tasks may link to farm notes or organic records, but they must not duplicate audio, photos, or farm-note content into a separate evidence inbox.
- Legacy inspection-readiness items may remain readable for compatibility, but new certification preparation work should use planning tasks unless canonical scope changes again.

## Evidence Review and Package Rules

- Evidence review workflows may group organic evidence links across multiple organic areas, but they must keep source records as the authoritative records.
- One source evidence item may support multiple organic areas when the farmer confirms each relationship.
- Package generation assembles local report text, summaries, manifest counts, evidence references, and explicit preparation warnings. It does not submit forms, upload files, sign records, approve labels, or certify compliance.
- Package PDFs are generated from saved local package content and shared only through explicit farmer-controlled export/share actions.
- Package generation should reference linked source media and documents by local metadata unless the farmer explicitly chooses an export action that bundles selected files.
- Missing-evidence and stale-link prompts are preparation prompts, not compliance findings.

## Non-Determination Rule

The app must not label a farm, product, place, input, lot, or report as legally compliant or certified based only on app-entered data. User-facing copy should say the module helps organize records for certifier review.

## Privacy Rule

Organic readiness records are private farm operational data. They can include certifier contacts, certificate numbers, production scope, and later evidence. They must remain local/private unless exported intentionally.
