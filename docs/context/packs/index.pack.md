# Context Pack: Repository Baseline

- Pack name: `index`
- Status: active
- Last reviewed: 2026-05-28
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

This baseline pack gives automated agents the minimum stable project context before non-trivial implementation, review, documentation, or planning work.

## Use When

Use for every non-trivial repository task before selecting specialized packs.

## Do Not Use When

Do not use as the only context for behavior-changing work; add relevant specialized packs and canonical sources.

## Project Identity

This is an open-source small-farm support platform. The active implementation target is Mobile Pilot 1: a standalone offline-first mobile increment with an implemented manual-record foundation and an accepted next farmer-test direction focused on voice/photo farm-event capture, local timeline review, and data control/recovery. The first slice remains intentionally narrow.

## Core Guidance

- Read canonical documents relevant to the task.
- Use [Change Impact Matrix](../../standards/change-impact-matrix.md) for behavior-changing work.
- Load only relevant specialized packs.
- Preserve farmer-centered terminology.
- Add or update verification when implementing behavior once code exists.
- Update canonical docs and relevant packs when durable behavior changes.
- Surface missing decisions rather than silently resolving them.

## Non-Negotiable Constraints

- [ADR-0001](../../adr/ADR-0001-offline-first-field-operation.md): supported field recording must remain usable offline.
- [ADR-0002](../../adr/ADR-0002-history-preserving-idempotent-synchronization.md): confirmed pilot records must be safely retained locally; when server synchronization is later authorized, synchronization must not cause silent loss, duplicate effects, or destructive history replacement.
- [ADR-0003](../../adr/ADR-0003-ai-interpretations-require-confirmation.md): AI-assisted interpretations remain drafts until explicit user confirmation.
- [ADR-0004](../../adr/ADR-0004-private-by-default-intentional-sharing.md): farm operational data and sensitive captures are private by default; shared listings require intentional limited publication.
- [ADR-0005](../../adr/ADR-0005-data-portability-and-recoverability.md): practical data portability and recoverability are foundational operating constraints.
- [ADR-0007](../../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md): the first implemented pilot is standalone mobile; server connection and in-product shared publication are deferred.
- [ADR-0008](../../adr/ADR-0008-mobile-pilot-1-application-stack.md): Mobile Pilot 1 uses Expo, React Native, TypeScript, development builds, and EAS/internal distribution.
- [ADR-0009](../../adr/ADR-0009-mobile-pilot-1-local-persistence.md): Mobile Pilot 1 uses `expo-sqlite` behind repositories/adapters, hand-written migrations, and no ORM.
- [ADR-0010](../../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md): Mobile Pilot 1 uses local versioned JSON export/recovery copy through Expo FileSystem and Expo Sharing.
- [ADR-0011](../../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md): Mobile Pilot 1 uses Zod for runtime boundary validation.
- [ADR-0012](../../adr/ADR-0012-voice-photo-first-farm-event-capture-pilot.md): The next farmer-shareable pilot prioritizes local voice/photo farm-event capture before AI interpretation or server-connected features.

## Current Pilot Sequencing

- Local export/backup is required before meaningful farmer reliance.
- The implemented manual foundation includes `HarvestRecorded`, `MaterialUseRecorded`, and `InventoryCountRecorded`.
- The next accepted farmer-shareable pilot adds local voice memo and optional photo farm-event capture without AI interpretation.
- Later server compatibility must be preserved without implementing server infrastructure prematurely.
- Private supply-need notes, AI interpretation drafts, platform publication, and responses are not Mobile Pilot 1 scope.

## Decisions Still Deferred

This pack does not authorize selection of implementation language/framework, database/storage/synchronization technology, AI model/runtime, identity/security mechanism, deployment packaging, first production deployment mode, local-server shipping timeline, server synchronization, need-listing publication, or scope expansion beyond the documented standalone mobile pilot.

Exception: ADR-0008 through ADR-0011 accept only the Mobile Pilot 1 app stack, local persistence, export/recovery-copy mechanism, and runtime boundary validation. Future server, sync, AI, authentication, and deployment technology remain deferred.

Use the [Decision Readiness Register](../../adr/decision-readiness-register.md) before touching deferred decisions.

## Explicit Non-Goals / Overreach to Avoid

Do not use this baseline pack to skip specialized packs, broaden product scope, select deferred technology, or treat proposed ADRs as accepted.

## Pack-Routing Table

| Task area | Add pack |
| --- | --- |
| Product/domain workflow or terminology | `product-and-domain.pack.md` |
| Offline/sync/conflicts/local persistence | `offline-sync.pack.md` |
| Mobile field workflow or capture UX | `mobile-field-capture.pack.md` |
| Voice/photo/AI-assisted input | `ai-assisted-recording.pack.md` |
| Privacy/listings/attachments/access | `privacy-and-sharing.pack.md` |
| Server/deployment/backup/export/recovery | `server-deployment-and-operations.pack.md` |
| Testing/logging/defect diagnosis | `testing-and-diagnostics.pack.md` |
| Dependency/provider/technology evaluation | `dependency-and-technology-selection.pack.md` |
| Documentation/ADR/governance review | `documentation-and-adr-governance.pack.md` |

## Minimal-Source Posture

This pack identifies the baseline. It does not remove the requirement to read actual canonical documents, accepted ADRs, standards, and affected code/tests relevant to a task.

## Canonical Source Documents and ADRs

- `../../../AGENTS.md`: agent startup and restraint rules.
- `docs/README.md`: documentation authority and map.
- `docs/adr/README.md`: ADR policy.
- `docs/adr/decision-readiness-register.md`: deferred decisions.
- `docs/product/mobile-pilot-1-implementation-scope.md`: exact current implementation scope.
- `docs/domain/mobile-pilot-1-operational-records.md`: accepted Pilot 1 record meanings.
- `docs/operations/mobile-pilot-data-safety-requirements.md`: accepted Pilot 1 data-safety requirements.
- `apps/mobile/README.md`: current Mobile Pilot 1 app structure and stack notes.
- `docs/context/prompt-routing.md`: task classification and pack assembly.

## Required Standards

- `docs/standards/change-impact-matrix.md`
- `docs/standards/ai-agent-development-standards.md`

## Required Documentation Impact Review

Review affected canonical docs and specialized packs whenever durable behavior, accepted ADRs, or repeated task-routing needs change.

## Required Verification Impact Review

For implementation work, verification expectations come from the specialized packs and the change-impact matrix.

## Prompt Assembly Notes

Start with this pack, then add the smallest set of specialized packs required by `docs/context/prompt-routing.md`.
