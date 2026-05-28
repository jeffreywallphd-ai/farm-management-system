# Architecture Documentation

`docs/architecture/` is canonical for intended technical architecture and system boundaries.

## Current Architecture Documents

- [System Overview](system-overview.md): first-slice architecture drivers, conceptual components, information categories, and invariants.
- [Offline-First Mobile Architecture](offline-first-mobile-architecture.md): offline field behavior, local retained work, draft lifecycle, and mobile-side responsibilities.
- [Synchronization Architecture](synchronization-architecture.md): conceptual sync lifecycle, idempotency, server/mobile authority boundaries, conflict classes, and sync status concepts.
- [Persistence and Attachment Storage](persistence-and-attachment-storage.md): persistence responsibilities, attachment lifecycle principles, storage boundaries, and data ownership implications.
- [AI-Assisted Capture Boundaries](ai-assisted-capture-boundaries.md): architecture constraints separating inference, drafts, confirmation, operational records, offline retention, attachments, and later privacy boundaries.
- [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md): architecture boundaries among identity, authorized access, synchronization, publication, visibility, local-network distribution, AI captures, and attachment access.
- [Server and Deployment Operating Model](server-and-deployment-operating-model.md): deployment-mode architecture constraints and the relationship among mobile offline use, server operation, private/shared boundaries, data portability, and future technical choices.

These documents are proposed canonical architecture for the first-slice offline, synchronization, AI-assisted capture, privacy, sharing, server, and deployment foundation. They do not choose implementation technologies.

Accepted ADRs now govern the foundational cross-cutting constraints. See the [ADR Index](../adr/README.md) and [Decision Readiness Register](../adr/decision-readiness-register.md) before making durable architecture choices.

Architecture-affecting implementation work must also consult the [Coding Standards](../standards/coding-standards.md), [Testing and Verification Standards](../standards/testing-and-verification-standards.md), [Security and Privacy Engineering Standards](../standards/security-and-privacy-engineering-standards.md), and [Change Impact Matrix](../standards/change-impact-matrix.md).

## Expected Future Architecture Topics

- Deeper security implementation boundaries after identity/privacy concepts are validated.
- Module and dependency rules, once implementation structure is selected.
- Language/framework-specific architecture standards after accepted technology decisions.

Architecture documents should describe current intended boundaries and invariants. They should not act as chronological implementation diaries.

Unresolved decisions must be marked explicitly rather than hidden behind vague language or silently assumed by automated development agents.
