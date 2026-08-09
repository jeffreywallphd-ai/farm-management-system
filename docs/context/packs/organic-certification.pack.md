# Context Pack: Organic Certification

- Pack name: `organic-certification`
- Status: active
- Last reviewed: 2026-06-04
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents implement USDA organic certification readiness features without overclaiming legal compliance, certifier authority, or server-connected behavior.

## Use When

- Adding or changing organic operation profile, scopes, readiness dashboard, reports, or export content.
- Adding organic places, inputs, seeds, soil, pest, traceability, OSP, inspection-readiness, or organic evidence records.
- Reviewing USDA/NOP requirement mapping.

## Core Guidance

- ADR-0014 accepts a local Organic Certification Readiness module.
- The module organizes evidence and reports for farmer/certifier preparation. It does not certify farms or make legal determinations.
- Farm setup owns the pursuit/continuation toggle. Missing profiles and `notOrganic` profiles mean certification is off; show an off-state certification page and hide seeded certification goals/boards until pursuit is turned back on.
- Voice/photo farm notes are the source capture layer for certification evidence. Use organic evidence links to relate notes to organic categories or records instead of creating a separate evidence inbox or copying media.
- Inventory Management can store optional organic relevance, approval/review status, regulation notes, and evidence notes for farm inputs/materials and equipment. These fields organize evidence and do not verify approval or make compliance decisions.
- Organic Certification uses the shared local planning foundation for certification goals, subgoals, and tasks while remaining a standalone certification feature.
- Seeded certification planning uses two highest-level goals: certification administration work and certification farm work.
- Certification planning templates should split broad regulatory areas into smaller subgoals when evidence differs, including input approval vs application, soil fertility vs compost vs manure intervals, lot traceability vs handling/mass balance, and OSP practices vs recordkeeping/prevention procedures.
- Farm-work certification tasks should be highly actionable and atomic when work differs, such as separate tasks for compost temperature checking and windrow turning.
- Certification task cards should show a task-specific "Summary of USDA Requirements", include expected evidence context, and link to official USDA/eCFR requirement sections after user confirmation when only the default browser is available.
- Dedicated evidence-review and package-generation workflows replace the former transitional seeded `Prepare inspection evidence` and `Generate certification or renewal package` goals.
- Certification work boards may display certification planning tasks by status, but they must use the shared planning-board foundation and linked farm events rather than a separate certification task or evidence system.
- Use official USDA/eCFR sources for each phase before implementation.
- Keep all records local/offline-first unless intentionally exported by the user.
- Do not add certifier submission, cloud sync, authentication, analytics, background upload, or automatic AI extraction.
- Implement phases strictly in sequence unless the user explicitly authorizes a different slice and canonical docs are updated.

## Phase 1 Summary

Phase 1 includes organic tracking profile, national scope selection, dashboard, basic Organic Profile Report, and recovery-copy inclusion.

Phase 1 does not include organic place status, transition dates, boundary/buffer records, inputs, seed lots, soil/manure/compost, pest hierarchy, lots, OSP generation, or full report packages.

## Phase 2 Summary

Phase 2 includes organic place profiles, transition timing, boundary/buffer fields, boundary evidence records, place reports, and recovery-copy inclusion.

Phase 2 remains a local preparation and evidence-organizing aid. It does not add certifier submission, maps/GIS, legal eligibility determinations, cloud/sync/accounts, automatic AI extraction, inputs, seeds, soil, pest hierarchy, traceability, OSP generation, or full evidence packages.

## Phase 3 Summary

Phase 3 includes organic inputs, approval evidence references, input application records, input reports, and recovery-copy inclusion.

Phase 3 does not automatically verify OMRI/WSDA/National List status, decide whether an input is legally allowed or prohibited, submit records to certifiers, or add cloud/sync/accounts/AI extraction.

## Phase 4 Summary

Phase 4 includes seed lots, commercial availability searches, planting events, seed reports, and recovery-copy inclusion.

Phase 4 does not automatically search suppliers, decide commercial availability sufficiency, verify seed certification status, enforce sprout-specific legal outcomes, submit records, or add cloud/sync/accounts/AI extraction.

## Phase 5 Summary

Phase 5 includes soil fertility practices, compost batches/logs, manure interval planning dates, crop rotations, reports, and recovery-copy inclusion.

Phase 5 does not automatically certify compost, block harvests, make manure-compliance determinations, provide fertilizer recommendations, or add cloud/sync/accounts/AI extraction.

## Phase 6 Summary

Phase 6 includes pest/weed/disease observations, linked actions, input escalation notes, plastic mulch removal records, reports, and recovery-copy inclusion.

Phase 6 does not diagnose pests, prescribe treatments, verify allowed substances, auto-create compliance records, or add cloud/sync/accounts/AI extraction.

## Phase 7 Summary

Phase 7 includes organic lots, handling events, storage records, sale records, traceability reports, mass-balance snapshots, and recovery-copy inclusion.

Phase 7 does not automatically create lots from every harvest, print labels, submit records to certifiers, make legal compliance determinations, add recall automation, or add cloud/sync/accounts/AI extraction.

## Phase 8 Summary

Phase 8 includes local Organic System Plan section drafts, certification preparation tasks backed by the shared planning foundation, OSP/inspection reports, and recovery-copy inclusion.

Phase 8 does not submit certifier forms, generate Common OSP files, integrate with certifier portals, score compliance automatically, or add cloud/sync/accounts/AI extraction.

## Phase 9 Summary

Phase 9 includes local organic report package records, generated package text, package manifest data, package preview warnings, linked farm-note evidence references, package UI, local PDF export for saved packages, and recovery-copy inclusion.

Phase 9 does not submit packages, generate signed certifier files, bundle media, connect to portals, score compliance, or add cloud/sync/accounts/AI extraction. PDF export is explicit and local/user-controlled.

## Phase 10 Summary

Phase 10 includes generic advanced-scope readiness records for livestock, wild crops, mushrooms, producer groups, imports, and labeling/product claims, plus reporting and recovery-copy inclusion.

Phase 10 does not implement full specialty-scope compliance modules, validate import certificates, approve labels, calculate livestock/pasture compliance, automate producer-group systems, or add cloud/sync/accounts/AI extraction.

## Canonical Source Documents and ADRs

- `docs/adr/ADR-0014-organic-certification-readiness-module.md`
- `docs/product/organic-certification-readiness.md`
- `docs/domain/organic-certification-rules.md`
- `docs/architecture/organic-certification-architecture.md`
- `docs/adr/ADR-0015-local-farm-planning-foundation.md`
- `docs/product/farm-planning-roadmapping.md`
- `docs/domain/farm-planning-rules.md`
- `docs/architecture/planning-architecture.md`
- `docs/product/mobile-pilot-1-implementation-scope.md`
- `docs/operations/mobile-pilot-data-safety-requirements.md`

## Official Sources To Recheck

- 7 CFR Part 205.
- 7 CFR 205.101 for exemptions.
- 7 CFR 205.103 for certified-operation recordkeeping.
- 7 CFR 205.201 for Organic System Plan content.
- 7 CFR 205.105 for allowed/prohibited substances, methods, and ingredients.
- 7 CFR 205.202 for land requirements, three-year prohibited-substance timing, boundaries, and buffers.
- 7 CFR 205.203 for soil fertility and crop nutrient management input-related requirements.
- 7 CFR 205.204 for seeds and planting stock.
- 7 CFR 205.203 for soil fertility, manure timing, compost process, and crop rotation requirements.
- 7 CFR 205.206 for pest, weed, disease, prevention hierarchy, control methods, and plastic mulch removal.
- 7 CFR 205.601 and related National List sections for allowed/prohibited substance categories.
- 7 CFR 205.272 for commingling and prohibited-substance contact prevention.
- 7 CFR 205.307 for nonretail container lot-number labeling when applicable.
- USDA AMS Organic System Plan guidance.

## Required Verification

- Validation tests for status/scope/profile fields.
- Use-case/repository tests for local persistence and editing.
- Report-generation tests.
- Export payload tests.
- UI typecheck and available test suite.
- Phase completion report identifying official sources reviewed.
