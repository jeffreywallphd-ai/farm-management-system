# Organic Certification Readiness

- Status: accepted
- Last reviewed: 2026-06-02
- Canonical for: USDA organic certification readiness product scope and phase sequencing
- Related ADRs: [ADR-0014](../adr/ADR-0014-organic-certification-readiness-module.md), [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md)
- Related docs: [Product Vision and Scope](product-vision-and-scope.md), [Initial Vertical Slice](initial-vertical-slice.md), [Mobile Pilot 1 Implementation Scope](mobile-pilot-1-implementation-scope.md), [Organic Certification Domain Rules](../domain/organic-certification-rules.md), [Organic Certification Architecture](../architecture/organic-certification-architecture.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md)
- Related tests: [Organic certification use-case tests](../../apps/mobile/src/application/use-cases/organicCertificationUseCases.test.ts), [Organic certification migration test](../../apps/mobile/src/infrastructure/sqlite/migrations/harvestMigration.test.ts)
- Supersedes: none

## Product Goal

Build a local Organic Certification Readiness module that helps organic, transitioning, exempt, split, and non-organic farms organize USDA National Organic Program evidence, records, readiness status, and inspection-oriented reports.

The module supports farmers preparing for certifier review. It does not certify operations, replace accredited certifiers, make legal determinations, submit records to USDA, or guarantee compliance.

## Product Loop

The long-term organic workflow should build on the current app direction:

```text
Farm places
-> Voice/photo farm notes
-> User-confirmed structured evidence
-> Organic readiness records
-> Inspection-ready reports and exports
```

The farmer should record what happened once and reuse that information for certification evidence, history, and reports wherever the relationship is confirmed by the user.

## Farm Notes as Certification Evidence

Voice/photo farm notes are the source capture layer for certification evidence. The organic module must not create a separate evidence inbox that duplicates farm notes, audio, or photos. Instead, it may add farmer-confirmed organic evidence links that point from organic readiness categories or records back to saved farm notes.

The certification-support loop should be:

```text
Record voice/photo farm note
-> optionally mark it for organic review
-> farmer links the note to an organic category or record
-> organic screens and reports show the linked note as evidence
-> renewal and inspection views retrieve the same linked notes
```

This keeps daily farm work and certification work together. Marking a note for organic review is only a local reminder; it does not create a confirmed organic record or compliance finding.

## Certification Planning

Organic Certification uses the shared local farm planning foundation for certification goals, subgoals, and preparation tasks, while remaining a standalone feature area in the mobile UX.

The certification area should seed a practical certification plan with meaningful subgoals for profile setup, land context, input review, seed and planting records, soil fertility, pest hierarchy, traceability, Organic System Plan drafting, inspection preparation, reports, and advanced scopes where relevant. Farmers may adjust timelines and task status locally. These planning records organize work for certification preparation; they do not determine compliance, submit records, assign legal responsibility, create worker accounts, or replace certifier instructions.

## Phase Sequence

Implementation proceeds phase by phase:

1. Organic certification foundation and scope.
2. Organic places, transition, boundaries, and buffers.
3. Organic inputs and materials.
4. Seeds, planting stock, and commercial availability.
5. Soil fertility, manure, compost, and crop rotation.
6. Pest, weed, disease, and prevention hierarchy.
7. Harvest, handling, storage, traceability, and mass balance.
8. Organic System Plan and inspection readiness.
9. Reporting and export package generation.
10. Optional advanced scopes: livestock, wild crops, mushrooms, producer groups, imports, and labeling/product claims.

Each phase must include storage, display, reporting, tests, and review against official USDA/NOP sources before implementation is considered complete.

## Phase 1 Scope

Phase 1 establishes only the certification context the rest of the module depends on.

Included:

- Turn organic tracking on or off for the local farm.
- Capture organic operation status:
  - `notOrganic`
  - `transitioning`
  - `exempt`
  - `certified`
  - `splitOperation`
- Capture enabled national-scope categories:
  - crops
  - livestock
  - wild crops
  - handling
  - mushrooms
  - producer group
  - imports
  - packaged product labeling
- Capture certifier name/contact, certificate number, certificate effective date, annual update due date, inspection due window, record retention years, and notes.
- Display an Organic Certification dashboard only when organic tracking is enabled.
- Generate a basic Organic Profile Report.
- Include Phase 1 profile/scope data in local recovery export.

Excluded from Phase 1:

- Organic place status, transition dates, boundaries, buffers, or evidence attachments.
- Inputs, seed lots, planting events, manure, compost, pest hierarchy, lots, traceability, OSP generation, full evidence export packages, or advanced scopes beyond selecting the scope toggles.
- Cloud, sync, account, certifier submission, analytics, or legal/compliance determinations.

## Official Phase 1 Requirement Anchors

- 7 CFR 205.103 requires certified-operation records to be auditable, traceable, sufficient to demonstrate compliance, and maintained for not less than five years.
- 7 CFR 205.101 identifies certification exemptions and includes recordkeeping obligations for exempt operations.
- 7 CFR 205.201 defines Organic System Plan requirements for non-exempt operations intending to represent products as organic.
- USDA AMS describes the Organic System Plan as central to certification, submitted to an accredited certifier, and updated annually.

## UX Requirements

Organic Certification appears in the hamburger menu as the entry point.

Before organic tracking is enabled, show a setup screen that explains:

- Organic tracking is optional.
- Records stay local unless the farmer exports them.
- The module helps organize records for certifier review.
- The app does not replace certification.

After organic tracking is enabled, show:

- Certification profile.
- Enabled scopes.
- Annual update date if present.
- Record retention status.
- Recent organic records placeholder until later phases add record types.
- Missing setup items.
- Organic Profile Report action.

Only show implemented features. Later phase sections should be described as planned only in docs, not exposed as inactive clutter in the app.

## Reporting Requirements

Phase 1 Organic Profile Report must include:

- farm name;
- organic status;
- certifier information;
- certificate number and effective date;
- annual update due date;
- inspection due window;
- enabled scopes;
- record retention years;
- date generated;
- clear disclaimer that the report is for organization and certifier review, not certification.

## Completion Standard

Phase 1 is complete when:

- Organic tracking can be enabled and edited locally.
- The dashboard appears only after organic tracking is enabled.
- Profile/scope data survives app restart through SQLite.
- Organic Profile Report can be generated locally.
- Recovery export includes organic profile and scopes.
- Tests cover validation, use cases, export payloads, and report generation.
- Verification is run and official USDA/NOP Phase 1 requirements are checked.

## Phase 2 Scope

Phase 2 adds organic land/place readiness records as an overlay on the existing farm-place hierarchy.

Included:

- Organic status for every saved farm place: `nonOrganic`, `transitioning`, `eligibleOrganic`, `certifiedOrganic`, `buffer`, or `excluded`.
- Transition start date, last prohibited substance date, planning eligibility date, and certified-organic-since date.
- Boundary descriptions, buffer descriptions, adjacent land-use notes, contamination/drift risk notes, certifier-approved flag, and certifier notes.
- Boundary and buffer evidence records with type, description, optional local URI/reference, captured date, and place link.
- Organic Places screen linked from the Organic Certification dashboard and hamburger menu.
- Local Organic Land Eligibility, Transition Status, Boundary and Buffer, and Contamination/Drift Incident reports.
- Recovery export inclusion for organic place profiles and boundary evidence.

Excluded from Phase 2:

- Certifier submission, maps/GIS, legal land eligibility determinations, automatic AI extraction, cloud storage, sync, accounts, analytics, or background upload.
- Inputs, seeds, soil fertility, pest/weed/disease hierarchy, harvest lots, mass balance, OSP generation, and full organic evidence ZIP package. These remain later phases.

## Official Phase 2 Requirement Anchors

- 7 CFR 205.202 requires organic crop land to be managed according to applicable crop production standards, have no prohibited substances applied for three years before harvest, and have distinct boundaries and buffer zones to prevent unintended contact with prohibited substances.
- 7 CFR 205.272 requires handling operations to prevent commingling and contact with prohibited substances. Phase 2 records contamination/drift concerns at the place level for later commingling and contamination-prevention work.

## Phase 2 Completion Standard

Phase 2 is complete when:

- Every saved farm place can have one organic place profile.
- Transition eligibility can be calculated from the last prohibited substance date as a planning aid.
- Boundary/buffer evidence can be recorded locally and associated with a farm place.
- Organic place reports can be generated offline and include current place paths, status, dates, evidence, and non-determination language.
- Recovery export includes Phase 2 place and evidence records.
- Tests cover validation, use cases, reports, migration shape, and export payloads.

## Phase 3 Scope

Phase 3 adds organic input and material readiness records tied to the app's existing setup materials.

Included:

- Organic input records with category, manufacturer, supplier, composition, source, approval status, approval evidence references, certifier approval date, expiration date, restrictions, and notes.
- Approval statuses: `unknown`, `approvedByCertifier`, `omriListed`, `wsdaListed`, `allowedByNationalList`, `restricted`, `prohibited`, and `needsReview`.
- Organic input application records with input, optional place, optional crop, date, quantity, unit, rate, reason, target problem, weather notes, applied-by, evidence references, and optional farm-note link.
- Organic Inputs screen linked from the Organic Certification dashboard and hamburger menu.
- Local reports:
  - Input List for OSP.
  - Input Application Log.
  - Certifier Approval Evidence Packet.
  - Restricted/Needs Review Inputs Report.
- Recovery export inclusion for organic inputs and organic input applications.

Excluded from Phase 3:

- Automatic OMRI/WSDA/National List lookup, legal allowed/prohibited determinations, certifier submission, cloud sync, accounts, analytics, or automatic AI extraction.
- Seed lots, commercial availability, compost/manure interval logic, pest hierarchy, harvest lots, mass balance, OSP generation, and full evidence ZIP package. These remain later phases.

## Official Phase 3 Requirement Anchors

- 7 CFR 205.105 defines broad allowed/prohibited substance and method boundaries for products represented as organic.
- 7 CFR 205.201 requires an Organic System Plan to include practices/procedures, substances used as production or handling inputs, monitoring practices, recordkeeping, and contamination/commingling prevention practices.
- 7 CFR 205.203 addresses soil fertility and crop nutrient management, including restrictions on plant and animal materials and soil amendments.
- 7 CFR 205.601 and related National List sections define synthetic substances allowed for organic crop production and must be interpreted by certifiers or qualified reviewers, not automatically by this app.

## Phase 3 Completion Standard

Phase 3 is complete when:

- Organic inputs can be saved and edited locally.
- Organic input applications can be recorded with place/crop/date/amount/reason/evidence context.
- Reports can be generated offline for input inventory, application log, approval evidence, and needs-review/restricted inputs.
- Recovery export includes Phase 3 input and application records.
- Tests cover validation, use cases, reports, migration shape, and export payloads.

## Phase 4 Scope

Phase 4 adds seed, planting stock, commercial availability, and planting records.

Included:

- Seed lots with crop, variety, supplier, lot number, purchase date, quantity, organic status, seed treatment, invoice evidence, label evidence, and notes.
- Commercial availability searches with seed lot, crop/variety text, searched date, supplier, result, evidence, and notes.
- Planting events with seed lot, optional crop, optional place, planting date, quantity, method, and optional farm-note link.
- Organic Seeds screen linked from the Organic Certification dashboard and hamburger menu.
- Local reports:
  - Seed and Planting Stock Report.
  - Commercial Availability Search Report.
  - Planting Event Report.
  - Seed-to-Crop Traceability Report.
- Recovery export inclusion for seed lots, commercial availability searches, and organic planting events.

Excluded from Phase 4:

- Automatic supplier search, automatic commercial-availability determinations, sprout-specific enforcement decisions, legal seed acceptability determinations, certifier submission, cloud sync, accounts, analytics, or automatic AI extraction.

## Official Phase 4 Requirement Anchors

- 7 CFR 205.204 requires organically grown seeds, annual seedlings, and planting stock except under specified conditions.
- 7 CFR 205.204 allows nonorganically produced untreated seeds or planting stock when an equivalent organic variety is not commercially available, except edible sprout production requires organic seed.
- 7 CFR 205.204 addresses treated seed/planting stock, temporary variances for annual seedlings, perennial planting stock management, and phytosanitary exceptions.

## Phase 4 Completion Standard

Phase 4 is complete when:

- Seed lots can be saved and edited locally.
- Commercial availability searches can be recorded against seed lots.
- Planting events link seed lots to crops and places.
- Reports can be generated offline for seed lots, commercial availability, planting, and seed-to-crop traceability.
- Recovery export includes Phase 4 seed records.
- Tests cover validation, use cases, reports, migration shape, and export payloads.

## Phase 5 Scope

Phase 5 adds soil fertility, compost, manure interval, and crop rotation records.

Included:

- Soil fertility practice records for cover crops, green manure, compost, manure, mulch, tillage/no-till, soil tests, erosion control, and other soil-building practices.
- Compost batches with ingredients, method, C:N ratio notes, status, and compost temperature/turning logs.
- Manure applications with place, crop, date, manure type, contact-with-soil flag, calculated 90/120-day interval, earliest harvest date, quantity, and notes.
- Crop rotation records by place/crop/year/season with previous crop and cover-crop notes.
- Organic Soil screen linked from the Organic Certification dashboard and hamburger menu.
- Local Soil Fertility, Compost Production, Manure Interval, Crop Rotation, and Erosion Control reports.
- Recovery export inclusion for soil, compost, manure, and rotation records.

Excluded from Phase 5:

- Automatic harvest blocking, automatic legal compliance decisions, fertilizer recommendations, lab integrations, cloud sync, certifier submission, accounts, analytics, or automatic AI extraction.

## Official Phase 5 Requirement Anchors

- 7 CFR 205.203 requires producers to maintain or improve soil condition and minimize erosion through tillage/cultivation choices.
- 7 CFR 205.203 requires crop nutrient and soil fertility management through rotations, cover crops, and plant/animal materials.
- 7 CFR 205.203 includes raw manure timing requirements of 120 days before harvest for edible portions contacting soil and 90 days before harvest when they do not.
- 7 CFR 205.203 includes compost process temperature/turning conditions for in-vessel, static aerated pile, and windrow systems.

## Phase 5 Completion Standard

Phase 5 is complete when:

- Soil fertility practices, compost batches/logs, manure applications, and crop rotation records can be recorded locally.
- Manure applications calculate 90/120-day earliest harvest dates as planning warnings.
- Reports can be generated offline for soil fertility, compost, manure intervals, crop rotation, and erosion control.
- Recovery export includes Phase 5 records.
- Tests cover validation, use cases, reports, migration shape, and export payloads.

## Phase 6 Scope

Phase 6 adds pest, weed, disease, prevention hierarchy, action, and plastic mulch records.

Included:

- Pest/weed/disease observations with place, crop, date, severity, description, photo references, and farm-note link.
- Actions linked to observations with prevention, sanitation, cultural, mechanical, physical, biological, botanical, allowed-synthetic, or other action type.
- Input escalation context with why-needed notes and optional input-application reference.
- Plastic mulch records with installation/removal evidence.
- Organic Pest/Weed/Disease screen linked from the Organic Certification dashboard and hamburger menu.
- Local Pest Observation and Action, Weed Management, Disease Management, Input Escalation Justification, and Plastic Mulch Removal reports.
- Recovery export inclusion for Phase 6 records.

Excluded from Phase 6:

- Automatic pest diagnosis, treatment recommendations, allowed-substance verification, automatic AI extraction, cloud sync, accounts, certifier submission, analytics, or legal determinations.

## Official Phase 6 Requirement Anchors

- 7 CFR 205.206 requires preventive practices such as crop rotation, sanitation, and cultural practices.
- 7 CFR 205.206 allows mechanical/physical, biological, botanical, and National List substances only within the regulatory hierarchy and documented OSP conditions.
- 7 CFR 205.206 requires plastic and other synthetic mulches to be removed from the field at the end of the growing or harvest season.

## Phase 6 Completion Standard

Phase 6 is complete when:

- Observations and actions are separate but linkable.
- Input escalation notes can be documented.
- Plastic mulch removal records can be captured.
- Reports can be generated offline for pest, weed, disease, input escalation, and plastic mulch.
- Recovery export includes Phase 6 records.
- Tests cover use cases, reports, migration shape, and export payloads.

## Phase 7 Scope

Phase 7 adds harvest, handling, storage, sales, traceability, and mass-balance records.

Included:

- Organic lots with lot code, crop, harvest place, harvest date, organic status, harvested quantity/unit, optional source harvest record ID, and notes.
- Handling events for washing, packing, cooling, drying, freezing, sorting, grading, combining, splitting, relabeling, transport, and other handling activities.
- Storage records by lot, storage place, in/out dates, quantity, unit, container ID, and notes.
- Sale records by lot, buyer, date, quantity, invoice number, organic claim text, and local evidence references.
- Organic Traceability screen linked from the Organic Certification dashboard and hamburger menu.
- Local reports:
  - Lot Traceability Report.
  - Handling and Commingling Prevention Report.
  - Storage Report.
  - Sale Traceability Report.
  - Mass Balance Report.
- Recovery export inclusion for lots, handling events, storage records, and sale records.

Excluded from Phase 7:

- Certifier submission, automatic compliance/legal determinations, automatic lot generation from every harvest, barcode/label printing, recall automation, accounts, cloud sync, analytics, or automatic AI extraction.

## Official Phase 7 Requirement Anchors

- 7 CFR 205.103 requires records adapted to the business to be auditable, sufficiently detailed, maintained, and traceable from production through sale and transport.
- 7 CFR 205.272 requires practices and records that help prevent commingling and contact with prohibited substances during handling.
- 7 CFR 205.307 requires nonretail containers used to ship or store raw or processed agricultural products labeled as organic to display production lot numbers when applicable.

## Phase 7 Completion Standard

Phase 7 is complete when:

- Organic harvest lots can be saved, edited, and optionally linked to existing harvest records.
- Handling, storage, and sale records can be recorded against lots.
- A sale can be traced back to its lot, harvest place, crop, and optional source harvest record ID through local reports.
- A local mass-balance report summarizes harvested, handled, stored, sold, lost, expected remaining, actual remaining, and discrepancy values as a review aid.
- Recovery export includes Phase 7 records.
- Tests cover use cases, reports, migration shape, and export payloads.

## Phase 8 Scope

Phase 8 adds Organic System Plan drafting support and inspection-readiness preparation tasks backed by the shared local planning foundation.

Included:

- Local Organic System Plan section records for practices/procedures, inputs/substances, monitoring, recordkeeping, commingling/prohibited-substance prevention, and additional certifier information.
- Local inspection-readiness preparation tasks through the shared planning foundation, including certification task status, timing, notes, and evidence references.
- Organic System Plan screen linked from the Organic Certification dashboard and hamburger menu.
- Local reports:
  - Organic System Plan Draft Summary.
  - Organic Inspection Preparation Tasks.
- Recovery export inclusion for OSP sections and certification planning tasks.

Excluded from Phase 8:

- Certifier form submission, Common OSP file generation, certifier portal integration, automatic compliance scoring, legal determinations, cloud sync, accounts, analytics, or automatic AI extraction.

## Official Phase 8 Requirement Anchors

- 7 CFR 205.201 requires an organic production or handling system plan agreed to by the operation and accredited certifying agent, including practices/procedures, substances, monitoring, recordkeeping, commingling/prohibited-substance prevention, and additional certifier-required information.
- USDA AMS describes the Organic System Plan as central to certification, submitted to an accredited certifier, and updated annually. The app only organizes local draft notes and evidence.

## Phase 8 Completion Standard

Phase 8 is complete when:

- OSP section records can be saved and edited locally.
- Inspection-readiness preparation tasks can be saved and edited locally through the certification planning workflow.
- Reports can be generated offline for OSP draft review and inspection readiness.
- Recovery export includes Phase 8 records and shared planning records used by certification.
- Tests cover use cases, reports, migration shape, and export payloads.

## Phase 9 Scope

Phase 9 adds local organic reporting package generation.

Included:

- Organic report package records with type, title, generated date, manifest JSON, report names, generated package text, and notes.
- A package generator that combines implemented organic reports into one local inspection/annual-update/archive package text.
- Linked farm-note evidence references in package manifests and report text where present.
- Organic Report Package screen linked from the Organic Certification dashboard and hamburger menu.
- Recovery export inclusion for saved report package records.

Excluded from Phase 9:

- Certifier submission, electronic signatures, PDF/Word/Common OSP file generation, media bundling, cloud sync, certifier portal integration, automatic compliance scoring, accounts, analytics, or automatic AI extraction.

## Official Phase 9 Requirement Anchors

- 7 CFR 205.103 requires auditable, sufficiently detailed, traceable records from production through sale/transport and records available for inspection.
- 7 CFR 205.403 describes on-site inspection context for certified operations. The package helps farmers gather local reports before review; it does not perform inspection or certification.

## Phase 9 Completion Standard

Phase 9 is complete when:

- A local organic report package can be generated from implemented reports.
- The package includes a manifest and clear non-submission/non-determination language.
- Generated packages are stored locally and included in recovery export.
- Tests cover package generation, migration shape, and export payloads.

## Phase 10 Scope

Phase 10 adds optional advanced-scope readiness records.

Included:

- Advanced-scope readiness records for livestock, wild crops, mushrooms, producer groups, imports, and labeling/product claims.
- Each record includes scope type, topic, description, readiness status, local evidence references, notes, and timestamps.
- Organic Advanced Scopes screen linked from the Organic Certification dashboard and hamburger menu.
- Local Advanced Scope Readiness Report.
- Recovery export inclusion for advanced-scope records.

Excluded from Phase 10:

- Full livestock herd/flock compliance modules, pasture/DMI calculations, health-treatment enforcement, import certificate validation, labeling approval, product formulation compliance, producer-group internal control systems, certifier submission, cloud sync, accounts, analytics, or automatic AI extraction.

## Official Phase 10 Requirement Anchors

- 7 CFR 205.207 addresses wild-crop harvesting from designated areas without prohibited substances for three years and non-destructive harvesting.
- 7 CFR 205.236 and related livestock sections govern livestock origin and livestock production requirements.
- 7 CFR 205.273 addresses imports to the United States.
- 7 CFR 205.300 and related labeling sections govern use of organic claims and labeling categories.
- 7 CFR 205.201 includes producer-group OSP internal-control-system content where applicable.

## Phase 10 Completion Standard

Phase 10 is complete when:

- Advanced-scope records can be saved and edited locally.
- Advanced-scope report can be generated offline with non-determination language.
- Recovery export includes Phase 10 records.
- Tests cover use cases, reports, migration shape, and export payloads.
