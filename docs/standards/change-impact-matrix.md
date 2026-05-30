# Change Impact Matrix

- Status: accepted
- Last reviewed: 2026-05-28
- Canonical for: repository-wide change-impact routing across documentation, ADRs, tests, privacy, operations, and validation
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0006](../adr/ADR-0006-deployment-mode-compatibility.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0008](../adr/ADR-0008-mobile-pilot-1-application-stack.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md)
- Related docs: [Documentation Standards](documentation-standards.md), [Coding Standards](coding-standards.md), [Testing and Verification Standards](testing-and-verification-standards.md), [Security and Privacy Engineering Standards](security-and-privacy-engineering-standards.md), [Decision Readiness Register](../adr/decision-readiness-register.md)
- Related tests: not yet implemented
- Supersedes: none

## How to Use the Matrix

Before implementation, identify each affected change category. Read the specified canonical sources. Determine whether the change is within accepted scope or requires new product/ADR approval. During implementation, satisfy required verification and privacy/recovery obligations. Before completion, update relevant canonical documents and context routing when durable behavior changed.

A change may fall into multiple categories; all applicable rows must be considered.

## Core Change-Impact Matrix

| Change type | Required canonical docs/ADRs to review | Documentation update likely required when behavior changes | Required future verification category | Special risk/check |
| --- | --- | --- | --- | --- |
| Implement Mobile Pilot 1 manual record core | ADR-0007, [Mobile Pilot 1 Scope](../product/mobile-pilot-1-implementation-scope.md), [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md), offline architecture, usability/testing standards | Product/domain/architecture/context | Mobile workflow + local retention tests | `HarvestRecorded`, `MaterialUseRecorded`, and `InventoryCountRecorded` are implemented; further record types require pilot-scope review |
| Add/change Mobile Pilot 1 setup/reference data | ADR-0007, ADR-0009, ADR-0011, [Mobile Pilot 1 Scope](../product/mobile-pilot-1-implementation-scope.md), offline architecture, usability/testing standards | Product/architecture/context/app README | Validation + repository/use-case + local persistence tests | Do not add operational-record, export, sync, AI, auth, or sharing behavior |
| Add/change Mobile Pilot 1 app structure or stack dependencies | ADR-0008, ADR-0009, ADR-0010, ADR-0011, readiness register, dependency standards, [Mobile Pilot 1 Scope](../product/mobile-pilot-1-implementation-scope.md) | ADR/readiness/context/app README | JSON/package validation now; typecheck after install | Do not add AI, sync, server, auth, ORM, cloud, analytics, or deployment packages |
| Add/change standalone mobile pilot workflow | ADR-0007, [Mobile Pilot 1 Scope](../product/mobile-pilot-1-implementation-scope.md), product slice, field workflows, offline architecture, usability/testing standards | Product/domain/architecture/context | Mobile workflow + local retention tests | Record types outside the three Pilot 1 records require pilot-scope review |
| Add/change local mobile export/backup | ADR-0007, ADR-0005, [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md), operations export/recovery docs, privacy docs | Operations/architecture/product/context | Export/backup completeness + sensitive data tests | Device-local data loss risk |
| Add or change operational record type | [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md), product slice, event catalog, inventory rules, ADR-0002 | Domain docs; possibly product/architecture/ADR | Domain + local retention/future sync tests | Avoid scope expansion and history loss; non-Pilot-1 record types require authorization |
| Change manual field-entry workflow | Field workflows, usability standards, ADR-0001 | Product workflow docs | Mobile workflow/usability verification | Must remain usable offline where required |
| Change farm-place setup or hierarchy | Farm structure, Mobile Pilot 1 scope, offline architecture, persistence architecture | Product/domain/architecture/context/app README | Validation + repository/use-case + migration + mobile workflow tests | Keep place hierarchy local/private; do not add GIS, maps, planning, sync, or server behavior |
| Add/change quantity or inventory behavior | Inventory rules, operational records, ADR-0002, sync docs | Domain and sync docs; perhaps ADR | Domain + discrepancy + sync tests | No silent overwrite of history |
| Change offline local retention behavior | ADR-0001, offline docs, operations/recovery docs | Architecture and possibly operations docs | Offline retention/restart tests | Record loss risk |
| Change synchronization submission/retry/acceptance | ADR-0002, sync docs, recovery docs | Architecture/operations; ADR if invariant changes | Idempotency/retry/reconnect tests | Duplicate effects/data loss |
| Introduce server connection or synchronization implementation | ADR-0007, ADR-0002, sync architecture, readiness register | Product/architecture/ADR before implementation | Sync/idempotency/integration tests after authorization | Outside current pilot unless authorized |
| Change reference data available offline | Farm structure, offline/sync docs | Domain/architecture as needed | Offline context/versioning tests later | Historic record resolvability |
| Add voice-assisted draft workflow | ADR-0003, AI docs, product validation docs, operational records | Product/domain/architecture | Draft-confirmation + usability tests | Mobile Pilot 2 only; not Mobile Pilot 1 |
| Add photo-assisted count workflow | ADR-0003, AI/inventory/attachment/privacy docs | Product/domain/architecture | Draft/count/attachment/privacy tests | Mobile Pilot 2 only; not Mobile Pilot 1; no arbitrary vision expansion |
| Change AI confirmation/correction behavior | ADR-0003, AI docs | Domain/architecture/ADR if constraint changes | Trust-boundary tests | No silent confirmation |
| Add model/provider/external inference service | AI/privacy/dependency standards, readiness register | Architecture/privacy/ADR likely | Integration/privacy/failure tests | Sensitive data leaves boundary |
| Add/change source capture retention | AI/privacy/attachment/operations docs | Domain/architecture/operations/ADR likely | Retention/delete/export tests | Consent/sensitive content |
| Add internal supply need behavior | Sourcing/privacy/domain docs, ADR-0004 | Domain/product | Domain/privacy tests | Must remain private |
| Add/change need listing publication | ADR-0004, privacy/sharing docs, sync docs | Product/domain/architecture | Publication/visibility/offline-pending tests | No underlying record exposure |
| Introduce in-product need-listing publication | ADR-0007, ADR-0004, sourcing/privacy docs, readiness register | Product/domain/architecture/ADR before implementation | Publication/privacy tests after authorization | Deferred feature; do not implement as pilot work |
| Add multi-device farm behavior | ADR-0007, ADR-0002, identity/privacy architecture, sync docs | Product/architecture/ADR likely | Sync/auth/access tests after authorization | Deferred server-connected expansion |
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
| Change pilot scope based on farmer evidence | User research, validation plans, roadmap, ADR-0007, readiness register | Product docs and possibly ADR/readiness updates | Verification scope depends on change | Evidence must be recorded before durable expansion |
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
