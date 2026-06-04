# Organic Certification Architecture

- Status: accepted
- Last reviewed: 2026-06-04
- Canonical for: architecture boundaries for local organic certification readiness features
- Related ADRs: [ADR-0014](../adr/ADR-0014-organic-certification-readiness-module.md), [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md)
- Related docs: [Organic Certification Readiness](../product/organic-certification-readiness.md), [Organic Certification Domain Rules](../domain/organic-certification-rules.md), [Offline-First Mobile Architecture](offline-first-mobile-architecture.md), [Persistence and Attachment Storage](persistence-and-attachment-storage.md), [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md)
- Related tests: [Organic certification use-case tests](../../apps/mobile/src/application/use-cases/organicCertificationUseCases.test.ts), [Organic certification migration test](../../apps/mobile/src/infrastructure/sqlite/migrations/harvestMigration.test.ts)
- Supersedes: none

## Purpose

This document defines how organic certification readiness fits the current standalone mobile architecture.

## Architecture Boundary

Organic certification readiness is a local module inside the existing Expo/React Native mobile app.

It uses:

- TypeScript domain types.
- Zod validation at input/export boundaries.
- `expo-sqlite` behind repository/use-case ports.
- Existing local export/recovery-copy mechanisms.
- Existing farm profile and navigation shell.
- Existing farm-note media storage for audio and photos, referenced through evidence links rather than duplicated in organic records.

It does not introduce:

- server APIs;
- synchronization;
- certifier submission;
- accounts or authentication;
- cloud storage;
- analytics or telemetry;
- automatic AI extraction or compliance decisions.

## Phase 1 Storage Boundary

Phase 1 adds local SQLite storage for:

- one organic operation profile per local farm;
- one certification-scope row per selected/known scope;
- generated report content derived from current local data when the user opens or exports the report.

Later phases may add organic place profiles, evidence records, inputs, seed lots, soil records, pest observations, lots, sales, OSP sections, and export packages only after their phase docs and tests are updated.

## Phase 2 Storage Boundary

Phase 2 adds local SQLite storage for:

- one organic place profile per local farm place;
- boundary/buffer evidence rows linked to a farm place.

Organic place records store farm-place IDs, status, transition dates, boundary/buffer descriptions, adjacent land-use/risk notes, certifier notes, and timestamps. They do not duplicate farm-place names or parent paths; readable paths are derived from current farm-place lookup so hierarchy edits remain reflected in organic reports.

Boundary evidence can store an optional local URI/reference. Media capture and durable app-controlled media copying remain governed by the existing attachment-storage architecture. Phase 2 does not add remote document storage, certifier submission, or automatic media upload.

## Phase 3 Storage Boundary

Phase 3 adds local SQLite storage for:

- organic input records linked optionally to setup materials;
- organic input application records linked to organic inputs and optionally to places, crops, evidence references, and farm notes.

Organic input approval status is stored as user-entered app data. The repository does not call OMRI, WSDA, USDA, certifier, or National List services. Any later external lookup or certifier-specific workflow requires separate accepted scope and ADR review.

## Phase 4 Storage Boundary

Phase 4 adds local SQLite storage for:

- seed lots;
- commercial availability searches;
- organic planting events.

Seed records may reference crop IDs, farm-place IDs, local evidence IDs, and farm-note IDs, but they do not perform supplier searches, remote document retrieval, certifier submission, or automatic compliance decisions.

## Phase 5 Storage Boundary

Phase 5 adds local SQLite storage for soil fertility practices, compost batches, compost temperature logs, manure applications, and crop rotation records.

Manure interval dates are calculated locally from the application date and farmer-entered edible-portion contact context. The app stores the calculated planning date but does not block harvest workflows or assert certification compliance.

## Phase 6 Storage Boundary

Phase 6 adds local SQLite storage for pest/weed/disease observations, linked actions, and plastic mulch records.

The module stores farmer-entered observations and actions only. It does not diagnose pests, prescribe controls, verify allowed substance status, or generate automatic compliance findings.

## Phase 7 Storage Boundary

Phase 7 adds local SQLite storage for organic lots, handling events, storage records, and sale records.

Organic lot records store stable IDs, user-entered lot codes, crop/place IDs, harvest date, status, harvested quantity, optional source harvest record ID, notes, and timestamps. Handling, storage, and sale records link to lots and remain local. Reports derive traceability and mass-balance snapshots from these local rows at runtime.

The module does not submit records to certifiers, generate legal compliance determinations, create barcode labels, add recall workflows, or synchronize lot data to a server.

## Phase 8 Storage Boundary

Phase 8 adds local SQLite storage for Organic System Plan section drafts. Inspection-readiness preparation work uses the shared local planning foundation accepted in ADR-0015.

These records store farmer-entered narratives, prompts, notes, local evidence references, and timestamps. Certification planning tasks store local work status and timeline fields through the planning repository. Neither path generates certifier-specific forms, uploads files, integrates with certifier portals, or scores compliance automatically.

## Phase 9 Storage Boundary

Phase 9 adds local SQLite storage for organic report package records.

The app stores generated package text and manifest JSON locally. Saved packages may be rendered to user-controlled local PDF exports. The module does not create Word/Common OSP files, bundle media, sign records, submit packages, upload packages, or connect to certifier systems.

## Phase 10 Storage Boundary

Phase 10 adds local SQLite storage for advanced-scope readiness records.

These records are generic specialty-scope notes with evidence references. They do not add livestock herd management, import certificate validation, labeling approval, producer-group internal-control-system automation, or any server-connected workflow.

## Farm-Note Evidence-Link Boundary

Organic evidence links are a local relationship table between saved farm notes and organic readiness categories or records. They store IDs, category, linked-record type, linked-record ID, evidence role, farmer notes, timestamps, and privacy posture.

Evidence links do not store audio, photos, transcripts, or copied documents. Farm-note attachments remain governed by the farm-event attachment storage boundary. Organic views, reports, and certification subpages resolve evidence links back to farm-note metadata when the farmer needs to review or export certification-support material.

The mobile UX must not introduce a separate evidence inbox or organic review queue. Certification evidence is surfaced from linked farm events on the relevant organic pages and reporting views so the voice/photo event workflow remains the source of daily evidence capture.

## Certification Planning Boundary

Organic Certification uses the shared local planning repository for seeded certification goals, subgoals, and preparation tasks. The Organic Certification UX remains standalone, but timeline and task data are stored through the planning foundation so generic Planning and certification preparation share one local work model.

Certification planning must not introduce accounts, cloud calendars, push notifications, server sync, automatic task generation, compliance scoring, certifier submission, or worker permission models. A task may include a farmer-entered responsible-person label for future assignment readiness, but that label is not an authenticated user or access-control boundary.

## Export Boundary

Organic readiness data is included in the existing local recovery copy when present. Phase 1 export includes profile and scope data. Phase 2 export also includes organic place profiles and boundary evidence. Phase 3 export adds organic inputs and input applications. Phase 4 export adds seed lots, commercial availability searches, and planting events. Phase 5 export adds soil, compost, manure, and rotation records. Phase 6 export adds pest/weed/disease and mulch records. Phase 7 export adds organic lots, handling events, storage records, and sale records. Phase 8 export adds OSP section drafts; certification preparation tasks are exported through the shared planning arrays. Phase 9 export adds saved organic report package records. Phase 10 export adds advanced-scope readiness records.

Farm-note evidence links are included in the recovery copy as link metadata. The existing farm-event recovery package remains responsible for exporting farm-note media references and media files.

Organic export content is private and potentially sensitive. The app must not upload or share it automatically.

## Report Boundary

Reports and report packages are generated locally as structured text/data for in-app display, recovery/export inclusion, and explicit saved-package PDF export. They are preparation aids for the farmer and certifier, not legal determinations or submissions.

## Future Compatibility

Organic records should preserve stable IDs, timestamps, farm references, scope references, privacy posture, and enough structure for later export and possible future synchronization. This compatibility does not authorize sync implementation.
