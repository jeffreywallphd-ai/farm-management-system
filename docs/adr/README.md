# Architecture Decision Records

ADRs are durable decision records for consequential product-technical or architectural choices. They should explain what was decided, why it was decided, what alternatives were considered, and what consequences follow.

## Decision Readiness

- [Decision Readiness Register](decision-readiness-register.md): current classification of accepted, proposed, deferred, excluded, and no-separate-ADR-needed foundational decisions.

## When to Create an ADR

Create an ADR when adopting or materially changing decisions such as:

- Offline-first system-of-record behavior.
- Confirmed operational event model.
- Synchronization or conflict strategy.
- AI-assisted draft and confirmation trust boundary.
- Privacy and published-network-listing boundary.
- Server language or runtime.
- Database strategy.
- Self-hosting or deployment model.
- Major module or dependency architecture.
- Major security or data ownership policies.

## Status Values

Use these ADR statuses:

```text
proposed
accepted
superseded
deprecated
rejected
```

Accepted ADRs are binding architecture guidance for the decisions they record. Proposed ADRs document candidate decisions but are not equivalent to accepted implementation authority. Deferred topics in the readiness register must not be silently implemented as settled architecture.

## Current ADR Index

| ADR | Status | Decision scope |
| --- | --- | --- |
| [ADR-0001](ADR-0001-offline-first-field-operation.md) | accepted | Offline-capable mobile field recording is foundational for supported workflows |
| [ADR-0002](ADR-0002-history-preserving-idempotent-synchronization.md) | accepted | Confirmed operational history must be preserved and synchronization must avoid duplicate accepted effects |
| [ADR-0003](ADR-0003-ai-interpretations-require-confirmation.md) | accepted | AI-assisted interpretations remain drafts until explicit user confirmation |
| [ADR-0004](ADR-0004-private-by-default-intentional-sharing.md) | accepted | Farm operational data is private by default; shared listings are intentional limited representations |
| [ADR-0005](ADR-0005-data-portability-and-recoverability.md) | accepted | Data portability, backup, restore, migration safety, and recoverability are operating-model constraints |
| [ADR-0006](ADR-0006-deployment-mode-compatibility.md) | proposed | Architecture should remain compatible with multiple server operating modes, pending validation and planning |
| [ADR-0007](ADR-0007-standalone-mobile-pilot-before-server-connected-features.md) | accepted | The first implemented pilot is standalone offline-first mobile before server-connected features |
| [ADR-0008](ADR-0008-mobile-pilot-1-application-stack.md) | accepted | Mobile Pilot 1 uses Expo, React Native, TypeScript, development builds, and EAS/internal distribution |
| [ADR-0009](ADR-0009-mobile-pilot-1-local-persistence.md) | accepted | Mobile Pilot 1 uses `expo-sqlite` behind local repositories/adapters with hand-written migrations and no ORM |
| [ADR-0010](ADR-0010-mobile-pilot-1-export-and-recovery-copy.md) | accepted | Mobile Pilot 1 uses local versioned JSON export/recovery copy through Expo FileSystem and Expo Sharing |
| [ADR-0011](ADR-0011-mobile-pilot-1-runtime-boundary-validation.md) | accepted | Mobile Pilot 1 uses Zod for runtime validation at input, persistence, and export boundaries |
| [ADR-0012](ADR-0012-voice-photo-first-farm-event-capture-pilot.md) | accepted | The next farmer-shareable standalone mobile pilot is voice/photo-first farm-event capture rather than manual-form-first recordkeeping |

## ADR Rules

- ADRs should be short, specific, and decision-centered.
- Record a decision before implementation when practical.
- Do not rewrite accepted ADR history to conceal a changed decision.
- When changing a prior accepted decision, create a superseding ADR or clearly update status and link to the replacement.
- ADRs must link to relevant product, domain, architecture, standards, and operations documents.
- ADRs should identify validation needs where a decision depends on unresolved farmer or user research.
- ADRs should link to the [Decision Readiness Register](decision-readiness-register.md) when a topic remains proposed or deferred.

## Key Canonical Sources

- [Documentation Governance](../README.md)
- [Standards Index](../standards/README.md)
- [Change Impact Matrix](../standards/change-impact-matrix.md)
- [Initial Vertical Slice](../product/initial-vertical-slice.md)
- [Operational Event Catalog](../domain/operational-event-catalog.md)
- [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md)
- [Synchronization Architecture](../architecture/synchronization-architecture.md)
- [AI-Assisted Capture Boundaries](../architecture/ai-assisted-capture-boundaries.md)
- [Identity, Privacy, and Sharing](../architecture/identity-privacy-and-sharing.md)
- [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md)
- [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md)

## Current Implementation Sequence

[ADR-0007](ADR-0007-standalone-mobile-pilot-before-server-connected-features.md) is the accepted implementation-sequencing decision. The current implementation target is a standalone offline-first mobile pilot.

Server synchronization, multi-device operation, in-product need-listing publication, responses/messaging, hosted/local/cooperative server implementation, and broader network functionality are deferred from the pilot. Future server compatibility remains required, but it does not authorize building a server now.

[ADR-0008](ADR-0008-mobile-pilot-1-application-stack.md) through [ADR-0011](ADR-0011-mobile-pilot-1-runtime-boundary-validation.md) select the Mobile Pilot 1 app stack, local persistence, export/recovery-copy mechanism, and runtime boundary validation. [ADR-0012](ADR-0012-voice-photo-first-farm-event-capture-pilot.md) refines the next farmer-shareable pilot direction around local voice/photo farm-event capture. These ADRs do not select future server language, server framework, server database, synchronization protocol, AI runtime, authentication, cloud provider, or deployment technology.

Use `docs/adr/template.md` for new ADRs.

## Standards Operationalization

Repository standards translate accepted ADRs into implementation and review obligations. When future work touches an accepted ADR decision, consult the relevant ADR, the [Decision Readiness Register](decision-readiness-register.md), and the [Change Impact Matrix](../standards/change-impact-matrix.md). Standards may require tests, documentation updates, privacy review, or ADR escalation, but they do not silently accept deferred technology or product-priority decisions.

For future ADR or technology-selection work, also use [Prompt Routing](../context/prompt-routing.md) and the [Documentation and ADR Governance Pack](../context/packs/documentation-and-adr-governance.pack.md) to assemble minimum-sufficient context.
