# Context Pack: Privacy and Sharing

- Pack name: `privacy-and-sharing`
- Status: active
- Last reviewed: 2026-05-28
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents work on farm-private data, local pilot records/captures, future visibility/listings/local-network publication, responses, attachments, access, identity, external sharing, and privacy-sensitive exports/diagnostics.

## Use When

- Local pilot records, private supply needs, source captures, or exports/backups.
- Future listing publication or withdrawal.
- Sharing audience or local-network behavior.
- Identity/access concepts.
- Attachment or source-capture access.
- External APIs or hosted/cooperative boundaries.
- Export, backup, diagnostics, or logs involving sensitive data.
- Any local-network feature.

## Do Not Use When

- A task is fully internal and cannot affect visibility, attachments, access, exports, or sensitive diagnostics.
- Product-only wording work does not touch private/shared meaning.

## Core Guidance

- Farm operational data is private by default.
- Privacy applies immediately to locally stored pilot records, local history, private supply needs, source captures, and exports/backups.
- Local-network participation does not expose private records.
- A supply need is not a shared listing.
- A shared listing is an intentionally published limited representation.
- External publication/listing behavior is future server-connected scope.
- Internal counts, usage history, captures, drafts, and provenance are not exposed automatically.
- Synchronization is not publication.
- Pending offline publication is not active external visibility.
- AI does not choose visibility or publication.
- Source photos/audio and drafts remain private unless separately, intentionally governed.

## Non-Negotiable Constraints

- [ADR-0004](../../adr/ADR-0004-private-by-default-intentional-sharing.md): private-by-default and intentional limited publication.
- [ADR-0003](../../adr/ADR-0003-ai-interpretations-require-confirmation.md): AI cannot create publication or operational effects.
- [ADR-0005](../../adr/ADR-0005-data-portability-and-recoverability.md): exports/backups may contain sensitive data.

## Decisions Still Deferred

Authentication, roles, invitation mechanics, public visibility, messaging, moderation, attachment-sharing UX, consent/deletion policy, legal/privacy policy, and hosted operator access mechanism remain deferred.

## Explicit Non-Goals / Overreach to Avoid

Do not implement sharing functionality merely because privacy rules define how it must work later. Do not create public marketplace behavior, automatic shortage publication, broad social networking, unrestricted operator access, or implicit attachment/capture sharing.

## Canonical Source Documents and ADRs

- `docs/domain/privacy-visibility-and-sharing-rules.md`: visibility classes and data classification.
- `docs/architecture/identity-privacy-and-sharing.md`: architecture trust zones and publication boundary.
- `docs/domain/sourcing-and-local-network-model.md`: supply need and listing concepts.
- `docs/product/local-coordination-and-sharing-validation-plan.md`: validation gates for sharing expansion.
- `docs/architecture/synchronization-architecture.md`: publication timing and sync distinction.

## Required Standards

- `docs/standards/security-and-privacy-engineering-standards.md`
- `docs/standards/logging-and-diagnostics-standards.md`
- `docs/standards/dependency-and-supply-chain-standards.md`
- `docs/standards/testing-and-verification-standards.md`
- `docs/standards/change-impact-matrix.md`

## Required Documentation Impact Review

Review privacy/domain/architecture docs, sourcing docs, sync docs, and operations docs when visibility, sharing, attachments, identity/access, exports, diagnostics, or hosted/cooperative boundaries change.

## Required Verification Impact Review

Future implementation must verify private-record non-exposure, listing data minimization, explicit publication, pending publication, attachment access, source-capture privacy, access denial, export/backup sensitivity, and log redaction.

## Prompt Assembly Notes

Common companions: `product-and-domain` for listings, `offline-sync` for pending publication, `ai-assisted-recording` for captures, `server-deployment-and-operations` for hosted/export work, and `testing-and-diagnostics`.
