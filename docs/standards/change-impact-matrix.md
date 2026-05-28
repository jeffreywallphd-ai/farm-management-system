# Change Impact Matrix

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: repository-wide change-impact routing across documentation, ADRs, tests, privacy, operations, and validation
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0006](../adr/ADR-0006-deployment-mode-compatibility.md)
- Related docs: [Documentation Standards](documentation-standards.md), [Coding Standards](coding-standards.md), [Testing and Verification Standards](testing-and-verification-standards.md), [Security and Privacy Engineering Standards](security-and-privacy-engineering-standards.md), [Decision Readiness Register](../adr/decision-readiness-register.md)
- Related tests: not yet implemented
- Supersedes: none

## How to Use the Matrix

Before implementation, identify each affected change category. Read the specified canonical sources. Determine whether the change is within accepted scope or requires new product/ADR approval. During implementation, satisfy required verification and privacy/recovery obligations. Before completion, update relevant canonical documents and context routing when durable behavior changed.

A change may fall into multiple categories; all applicable rows must be considered.

## Core Change-Impact Matrix

| Change type | Required canonical docs/ADRs to review | Documentation update likely required when behavior changes | Required future verification category | Special risk/check |
| --- | --- | --- | --- | --- |
| Add or change operational record type | Product slice, event catalog, inventory rules, ADR-0002 | Domain docs; possibly product/architecture/ADR | Domain + sync tests | Avoid scope expansion and history loss |
| Change manual field-entry workflow | Field workflows, usability standards, ADR-0001 | Product workflow docs | Mobile workflow/usability verification | Must remain usable offline where required |
| Add/change quantity or inventory behavior | Inventory rules, operational records, ADR-0002, sync docs | Domain and sync docs; perhaps ADR | Domain + discrepancy + sync tests | No silent overwrite of history |
| Change offline local retention behavior | ADR-0001, offline docs, operations/recovery docs | Architecture and possibly operations docs | Offline retention/restart tests | Record loss risk |
| Change synchronization submission/retry/acceptance | ADR-0002, sync docs, recovery docs | Architecture/operations; ADR if invariant changes | Idempotency/retry/reconnect tests | Duplicate effects/data loss |
| Change reference data available offline | Farm structure, offline/sync docs | Domain/architecture as needed | Offline context/versioning tests later | Historic record resolvability |
| Add voice-assisted draft workflow | ADR-0003, AI docs, product validation docs, operational records | Product/domain/architecture | Draft-confirmation + usability tests | No automatic confirmed effect |
| Add photo-assisted count workflow | ADR-0003, AI/inventory/attachment/privacy docs | Product/domain/architecture | Draft/count/attachment/privacy tests | No arbitrary vision expansion |
| Change AI confirmation/correction behavior | ADR-0003, AI docs | Domain/architecture/ADR if constraint changes | Trust-boundary tests | No silent confirmation |
| Add model/provider/external inference service | AI/privacy/dependency standards, readiness register | Architecture/privacy/ADR likely | Integration/privacy/failure tests | Sensitive data leaves boundary |
| Add/change source capture retention | AI/privacy/attachment/operations docs | Domain/architecture/operations/ADR likely | Retention/delete/export tests | Consent/sensitive content |
| Add internal supply need behavior | Sourcing/privacy/domain docs, ADR-0004 | Domain/product | Domain/privacy tests | Must remain private |
| Add/change need listing publication | ADR-0004, privacy/sharing docs, sync docs | Product/domain/architecture | Publication/visibility/offline-pending tests | No underlying record exposure |
| Add availability listing | Product scope/validation, privacy docs | Product/domain/architecture; possibly ADR | Visibility/inventory tests | Offered amount not total inventory |
| Add messaging or responses | Product roadmap/validation/privacy docs | Product/domain/architecture | Authorization/privacy tests | Do not create social platform by accident |
| Change visibility or sharing audience | ADR-0004, privacy docs | Domain/architecture/ADR likely | Authorization/serialization tests | High-risk privacy widening |
| Add attachment sharing | Privacy/AI/attachment docs | Domain/architecture/operations/ADR likely | Attachment access tests | Explicit sharing only |
| Add identity/authentication/membership behavior | Privacy architecture, readiness register, security standards | Architecture/ADR likely | Auth/access tests | Mechanism currently deferred |
| Add hosted deployment behavior | Deployment/operations/privacy/recovery docs, ADR-0005 | Architecture/operations; ADR if durable | Deployment/export/privacy tests | Operator/data-control boundary |
| Add local-server behavior | Deployment/local experience/recovery docs, ADR-0006 | Architecture/operations; ADR if prioritized | Local operation/recovery tests | Ordinary farmer burden |
| Add cooperative/multi-farm hosting | Deployment/privacy/sharing/validation docs | Product/architecture/ADR likely | Isolation/visibility tests | Farm boundaries remain private |
| Add backup or restore | ADR-0005, operations/privacy docs | Operations/architecture | Backup/restore/integrity tests | Sensitive data and duplicate sync effects |
| Add export | ADR-0005, privacy/domain docs | Operations/architecture | Export completeness tests | Usable farm-owned data |
| Add upgrade/migration | Operations/sync/privacy/ADR docs | Operations/architecture/ADR if meaning changes | Migration/reconnect tests | Preserve history/visibility |
| Add logs/diagnostics/telemetry | Logging/privacy/security docs | Standards/architecture as needed | Redaction/diagnostic tests | Sensitive leakage |
| Add dependency/external service | Dependency/security/privacy/readiness docs | Standards/architecture/ADR depending on impact | Vulnerability/integration review | License/lock-in/data transfer |
| Change user-facing terminology | Glossary/naming standards/product workflows | Domain/product/context | UI/docs review | Terminology drift |
| Add broad deferred feature | Product non-goals/readiness register | Product/roadmap/ADR before code | Not applicable until authorized | Stop unauthorized expansion |

## ADR Escalation Rules

A change requires ADR review or creation when it:

- Changes an accepted invariant.
- Selects a previously deferred core technology.
- Changes data privacy/visibility or AI trust boundaries.
- Changes the operating/deployment model materially.
- Changes export/recovery guarantees.
- Changes the core offline/sync strategy.
- Introduces a third-party dependency that materially changes data/control/licensing/hosting posture.

## Product-Validation Escalation Rules

Product validation review is required before implementing substantial expansion in:

- New AI workflows.
- New photo-count categories.
- Availability listings.
- Messaging.
- Cooperative purchasing.
- Local-server packaging.
- Cooperative hosting.
- Public visibility.
- Advanced planning or compliance areas.

## Minimum Completion Report Rule

Future work reports must identify which change-impact rows applied and how documentation, testing, ADR, privacy, recovery, and validation implications were addressed.

## Context-Pack and Routing Impact Rule

When an accepted ADR, canonical architecture/domain rule, standard, or recurring high-risk workflow changes, review the relevant context packs and `docs/context/prompt-routing.md` for accuracy. Pack updates follow canonical updates and must not substitute for them.
