# Mobile Pilot 1 Implementation Scope

- Status: accepted
- Last reviewed: 2026-05-30
- Canonical for: standalone mobile pilot scope, including the implemented manual foundation and the accepted voice/photo-first farmer-test direction
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0008](../adr/ADR-0008-mobile-pilot-1-application-stack.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md), [ADR-0012](../adr/ADR-0012-voice-photo-first-farm-event-capture-pilot.md)
- Related docs: [Initial Vertical Slice](initial-vertical-slice.md), [Field Workflows](field-workflows.md), [Roadmap](roadmap.md), [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Mobile App README](../../apps/mobile/README.md)
- Related tests: [Reference use-case tests](../../apps/mobile/src/application/use-cases/referenceUseCases.test.ts), [Reference validation tests](../../apps/mobile/src/domain/validation/referenceValidation.test.ts), [Harvest use-case tests](../../apps/mobile/src/application/use-cases/harvestUseCases.test.ts), [Manual record use-case tests](../../apps/mobile/src/application/use-cases/manualRecordUseCases.test.ts), [Harvest validation tests](../../apps/mobile/src/domain/validation/harvestValidation.test.ts), [Manual record validation tests](../../apps/mobile/src/domain/validation/manualRecordValidation.test.ts), [Phase 1 manual smoke test](../../apps/mobile/src/testing/phase-1-manual-smoke-test.md), [Phase 2 manual smoke test](../../apps/mobile/src/testing/phase-2-manual-smoke-test.md), [Phase 3 manual smoke test](../../apps/mobile/src/testing/phase-3-manual-smoke-test.md)
- Supersedes: none

## Scope Statement

> Mobile Pilot 1 is the standalone offline-first farmer-testing pilot. Its implemented manual-record foundation validates device-local setup, local history, and farmer-controlled recovery. Its next farmer-shareable differentiator is quick farm-event capture through voice memos, optional photos, light context, local timeline review, and recovery export. It does not include AI interpretation, server synchronization, external sharing, multi-device access, authentication, cloud backup, analytics, or deployment-mode implementation.

The Mobile Pilot 1 implementation stack is selected in ADR-0008 through ADR-0011. Phase 1 setup/reference behavior now exists under `apps/mobile`: one local farm profile, farmer-facing farm places, tracked crops, tracked materials, tracked countable items, SQLite-backed local persistence, Zod validation, and a reusable earthy UI foundation.

Farm places are the implemented farmer-facing form of local location data. Each farm place has a type, a name, and an optional parent place so the app can represent simple structures such as fields containing beds and rows, greenhouses containing benches, or wash/pack areas containing coolers. This is not a GIS, map, geometry, acreage, bed-dimension, or crop-planning feature.

Phase 3 now implements the complete manual Mobile Pilot 1 core: manual `HarvestRecorded`, `MaterialUseRecorded`, and `InventoryCountRecorded` creation; unified local activity history/detail; and a versioned JSON recovery-copy export for farm setup/reference data and all implemented manual records.

ADR-0012 pivots the next farmer-testable implementation direction toward voice/photo-first farm-event capture. The app now has the first model/persistence foundation for local farm-event metadata and attachment references, plus local voice memo recording/playback, optional local photo attachments, farm-note save flow, local timeline/detail review, and a user-controlled ZIP recovery package containing metadata plus retained media. Import/restore, AI interpretation, server-connected behavior, farmer distribution configuration, and later candidate workflows are still not implemented.

## Included Mobile Pilot 1 Capabilities

| Capability | Status |
| --- | --- |
| Standalone mobile application behavior | Included |
| Single device-local farm context | Included |
| Minimal local farm setup | Included |
| Minimal farm places needed for records | Included |
| Minimal tracked crops/materials/countable items needed for records | Included |
| Manual harvest record | Included |
| Manual material-use record | Included |
| Manual inventory-count observation | Included |
| Farm-event metadata and attachment-reference model | Foundation implemented; no media capture UI yet |
| Voice memo farm-event capture | Basic local recording/playback/save implemented |
| Optional photo attachments for farm events | Implemented for local farm notes |
| Local farm-event timeline | Accepted next implementation scope; not yet implemented |
| Local activity history for included records | Included |
| Clear locally saved/device-local status | Included |
| Practical export/backup of Mobile Pilot 1 data | Included for manual data; must expand to media recovery package before voice/photo farmer reliance |
| Manual correction/editing only to the extent deliberately defined for the pilot | Basic correction for obvious entry mistakes may be included; correction history beyond basic pilot needs is deferred |
| Field usability and offline behavior validation | Included |

## Deferred From Mobile Pilot 1

| Capability | Later posture |
| --- | --- |
| Planting/transplanting record | Candidate later manual workflow after discovery |
| Item movement record | Candidate later manual workflow after discovery |
| Equipment issue record | Candidate later manual workflow after discovery |
| Private internal supply-need note | Candidate discovery workflow after core recording proves usable |
| AI transcription or voice-to-structured-record workflow | Later constrained experiment after capture-first evidence |
| Photo-count inference workflow | Later constrained experiment after capture-first evidence |
| More advanced inventory reconciliation | Later refinement after manual count/use feedback |

## Explicitly Excluded or Deferred Server-Connected Scope

Mobile Pilot 1 does not include:

- Server implementation.
- Synchronization protocol, outbox, server API, server acceptance, or sync status UI.
- Cross-device farm access.
- Hosted, local, cooperative, private-cloud, or technical self-hosted server implementation.
- Shared need-listing publication.
- Listing responses or farmer-to-farmer messaging.
- Public marketplace, payments, orders, or social networking.
- Autonomous AI.
- Server language, server framework, server database, synchronization technology, AI runtime, authentication, hosting, or deployment technology.
- Technology choices beyond the Mobile Pilot 1 decisions recorded in ADR-0008 through ADR-0011.

## Why This Narrower Increment Is Required

The project needs a usable farmer-facing pilot quickly enough to test real work rather than theoretical interest.

Harvest, material use, and inventory count records are high-value because they connect everyday field work, material awareness, local history, and the original sourcing motivation without requiring server infrastructure.

The next farmer-facing learning risk is no longer whether structured forms can be implemented. The risk is whether farmers will actually capture useful information during work. ADR-0012 therefore shifts the first farmer-shareable differentiator toward voice memo and optional photo farm-event capture before adding AI interpretation or more structured workflow breadth.

A smaller record and event set makes field usability, offline retention, local history, and export/backup easier to verify before the project adds AI experiments, more workflows, or server-connected coordination. Additional records should be justified by discovery evidence rather than assumed into the first build.

The implemented Mobile Pilot 1 unit vocabulary is intentionally small: `lb`, `oz`, `kg`, `g`, `each`, `bunch`, `crate`, `bag`, `gal`, `L`, `flat`, and `tray`. Unit conversion, packaging math, and authoritative inventory calculation are not part of Mobile Pilot 1.

## Implementation-Readiness Criteria

Mobile Pilot 1 is ready for implementation planning only when:

- The three accepted operational-record meanings are canonical and accepted.
- Local data-safety and export/backup requirements are accepted.
- Context routing points future agents to this document.
- Implementation prompts cannot reasonably infer that deferred record types, AI experiments, or server features are part of Mobile Pilot 1.
