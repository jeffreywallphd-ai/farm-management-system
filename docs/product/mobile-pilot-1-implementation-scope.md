# Mobile Pilot 1 Implementation Scope

- Status: accepted
- Last reviewed: 2026-05-28
- Canonical for: exact first buildable standalone mobile pilot increment before AI experiments or server-connected features
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0008](../adr/ADR-0008-mobile-pilot-1-application-stack.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md)
- Related docs: [Initial Vertical Slice](initial-vertical-slice.md), [Field Workflows](field-workflows.md), [Roadmap](roadmap.md), [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Mobile App README](../../apps/mobile/README.md)
- Related tests: not yet implemented
- Supersedes: none

## Scope Statement

> Mobile Pilot 1 is the first buildable farmer-testing increment of the accepted standalone mobile pilot. It validates device-local offline recording, local history, and farmer-controlled export/backup using the smallest useful manual operational-record set. It does not include AI-assisted capture, server synchronization, external sharing, multi-device access, or deployment-mode implementation.

The Mobile Pilot 1 implementation stack is now selected in ADR-0008 through ADR-0011. The initial folder/file structure exists under `apps/mobile`, but workflow behavior, persistence behavior, export behavior, runtime schemas, and tests are not yet implemented.

## Included Mobile Pilot 1 Capabilities

| Capability | Status |
| --- | --- |
| Standalone mobile application behavior | Included |
| Single device-local farm context | Included |
| Minimal local farm setup | Included |
| Minimal locations needed for records | Included |
| Minimal tracked crops/materials/countable items needed for records | Included |
| Manual harvest record | Included |
| Manual material-use record | Included |
| Manual inventory-count observation | Included |
| Local activity history for included records | Included |
| Clear locally saved/device-local status | Included |
| Practical export/backup of Mobile Pilot 1 data | Included before meaningful farmer reliance |
| Manual correction/editing only to the extent deliberately defined for the pilot | Basic correction for obvious entry mistakes may be included; correction history beyond basic pilot needs is deferred |
| Field usability and offline behavior validation | Included |

## Deferred From Mobile Pilot 1

| Capability | Later posture |
| --- | --- |
| Planting/transplanting record | Candidate later manual workflow after discovery |
| Item movement record | Candidate later manual workflow after discovery |
| Equipment issue record | Candidate later manual workflow after discovery |
| Private internal supply-need note | Candidate discovery workflow after core recording proves usable |
| Voice-to-draft workflow | Mobile Pilot 2 constrained experiment |
| Photo-count-to-draft workflow | Mobile Pilot 2 constrained experiment |
| Any source audio/photo retention behavior | Mobile Pilot 2 only unless independently required |
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

A smaller record set makes field usability, offline retention, local history, and export/backup easier to verify before the project adds AI experiments, more workflows, or server-connected coordination. Additional records should be justified by discovery evidence rather than assumed into the first build.

## Implementation-Readiness Criteria

Mobile Pilot 1 is ready for implementation planning only when:

- The three accepted operational-record meanings are canonical and accepted.
- Local data-safety and export/backup requirements are accepted.
- Context routing points future agents to this document.
- Implementation prompts cannot reasonably infer that deferred record types, AI experiments, or server features are part of Mobile Pilot 1.
