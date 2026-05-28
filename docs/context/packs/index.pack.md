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

This is an open-source small-farm support platform. The initial direction prioritizes practical farm activity recording, offline field use, trustworthy AI assistance, controlled local coordination, and data control/recovery. The first slice remains intentionally narrow.

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
- [ADR-0002](../../adr/ADR-0002-history-preserving-idempotent-synchronization.md): confirmed records must be retained and synchronized without silent loss, duplicate effects, or destructive history replacement.
- [ADR-0003](../../adr/ADR-0003-ai-interpretations-require-confirmation.md): AI-assisted interpretations remain drafts until explicit user confirmation.
- [ADR-0004](../../adr/ADR-0004-private-by-default-intentional-sharing.md): farm operational data and sensitive captures are private by default; shared listings require intentional limited publication.
- [ADR-0005](../../adr/ADR-0005-data-portability-and-recoverability.md): practical data portability and recoverability are foundational operating constraints.

## Decisions Still Deferred

This pack does not authorize selection of implementation language/framework, database/storage/synchronization technology, AI model/runtime, identity/security mechanism, deployment packaging, first production deployment mode, local-server shipping timeline, or scope expansion beyond the documented first slice.

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
