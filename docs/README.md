# Documentation Governance

## Purpose

Documentation is part of the product-development control system for this open-source small-farm support platform. It exists to:

- Preserve product and architectural intent.
- Define domain vocabulary and operational rules.
- Guide human contributors and automated development agents.
- Prevent implementation drift.
- Make major decisions traceable.
- Support safe evolution of offline, privacy-sensitive, and AI-assisted workflows.

## Documentation Areas and Authority

| Directory | Role | Canonical? |
| --- | --- | ---: |
| `docs/product/` | Product vision, validated user needs, release scope, field workflows, roadmap and non-goals | Yes for product scope |
| `docs/domain/` | Farm terminology, operational concepts, event rules, inventory semantics, AI-confirmation rules, sourcing/network concepts | Yes for domain behavior |
| `docs/architecture/` | Intended system structure, boundaries, offline/sync model, deployment model, security/privacy architecture | Yes for technical architecture |
| `docs/adr/` | Durable architectural or product-technical decisions with rationale and consequences | Yes for recorded decisions |
| `docs/standards/` | Coding, naming, testing, documentation, diagnostics, security, and usability standards | Yes for implementation standards |
| `docs/context/` | Compact AI-oriented context routing and summary packs derived from canonical docs | No; routing/summarization only |
| `docs/operations/` | Installation, hosting, backup, restore, upgrades, exports, and operational recovery guidance | Yes for operational procedures once accepted |

## Current Foundation

Product scope is currently defined by:

- [Product Vision and Scope](product/product-vision-and-scope.md)
- [Initial Vertical Slice](product/initial-vertical-slice.md)
- [Field Workflows](product/field-workflows.md)
- [User Research and Validation](product/user-research-and-validation.md)
- [AI-Assisted Capture Validation Plan](product/ai-assisted-capture-validation-plan.md)
- [Local Coordination and Sharing Validation Plan](product/local-coordination-and-sharing-validation-plan.md)
- [Deployment and Data-Control Validation Plan](product/deployment-and-data-control-validation-plan.md)
- [Product Roadmap](product/roadmap.md)

The accepted implementation-driving product documents identify the current first target as a standalone offline-first mobile pilot. Validation plans remain proposed where they describe hypotheses and future research.

Farm-domain behavior is currently defined by:

- [Farm Domain Glossary](domain/glossary.md)
- [Farm Structure and Tracked Items](domain/farm-structure-and-tracked-items.md)
- [Operational Event Catalog](domain/operational-event-catalog.md)
- [Inventory and Reconciliation Rules](domain/inventory-and-reconciliation-rules.md)
- [Sourcing and Local Network Model](domain/sourcing-and-local-network-model.md)
- [AI-Assisted Capture and Confirmation Rules](domain/ai-assisted-capture-and-confirmation-rules.md)
- [Privacy, Visibility, and Sharing Rules](domain/privacy-visibility-and-sharing-rules.md)

These documents are proposed domain guidance and should be refined as farmer terminology and workflow evidence is gathered.

Architecture is currently defined by:

- [System Overview](architecture/system-overview.md)
- [Offline-First Mobile Architecture](architecture/offline-first-mobile-architecture.md)
- [Synchronization Architecture](architecture/synchronization-architecture.md)
- [Persistence and Attachment Storage](architecture/persistence-and-attachment-storage.md)
- [AI-Assisted Capture Boundaries](architecture/ai-assisted-capture-boundaries.md)
- [Identity, Privacy, and Sharing](architecture/identity-privacy-and-sharing.md)
- [Server and Deployment Operating Model](architecture/server-and-deployment-operating-model.md)

These documents are proposed architecture guidance and intentionally defer implementation technology choices.

Foundational ADRs are currently defined by:

- [ADR Index](adr/README.md)
- [Decision Readiness Register](adr/decision-readiness-register.md)
- [ADR-0001: Offline-First Field Operation Is Foundational](adr/ADR-0001-offline-first-field-operation.md)
- [ADR-0002: Preserve Operational History and Require Idempotent Synchronization](adr/ADR-0002-history-preserving-idempotent-synchronization.md)
- [ADR-0003: AI-Assisted Interpretations Require User Confirmation](adr/ADR-0003-ai-interpretations-require-confirmation.md)
- [ADR-0004: Farm Operational Data Is Private by Default and Sharing Is Intentional](adr/ADR-0004-private-by-default-intentional-sharing.md)
- [ADR-0005: Data Portability and Recoverability Are Required Operating Constraints](adr/ADR-0005-data-portability-and-recoverability.md)
- [ADR-0006: Keep Architecture Compatible With Multiple Server Operating Modes](adr/ADR-0006-deployment-mode-compatibility.md)
- [ADR-0007: Standalone Mobile Pilot Precedes Server-Connected Features](adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)

Accepted ADRs govern the decisions they record. ADR-0007 establishes the current implementation sequence: standalone mobile pilot first, with server synchronization, shared publication, and server deployment deferred. Proposed ADRs and deferred topics in the decision-readiness register must not be treated as accepted implementation authority.

Operations requirements are currently defined by:

- [Deployment Modes](operations/deployment-modes.md)
- [Local Farm Server Experience](operations/local-farm-server-experience.md)
- [Backup, Restore, and Data Export Requirements](operations/backup-restore-and-data-export-requirements.md)
- [Upgrades, Migrations, and Recovery Requirements](operations/upgrades-migrations-and-recovery-requirements.md)

These documents are proposed operating requirements and target experiences. They are not installation instructions for implemented deployment modes.

Repository-wide standards are currently defined by:

- [Standards Index](standards/README.md)
- [Documentation Standards](standards/documentation-standards.md)
- [Coding Standards](standards/coding-standards.md)
- [Naming and Domain Language Standards](standards/naming-and-domain-language-standards.md)
- [Testing and Verification Standards](standards/testing-and-verification-standards.md)
- [Logging and Diagnostics Standards](standards/logging-and-diagnostics-standards.md)
- [Security and Privacy Engineering Standards](standards/security-and-privacy-engineering-standards.md)
- [Accessibility and Field Usability Standards](standards/accessibility-and-field-usability-standards.md)
- [Dependency and Supply Chain Standards](standards/dependency-and-supply-chain-standards.md)
- [AI-Agent Development Standards](standards/ai-agent-development-standards.md)
- [Change Impact Matrix](standards/change-impact-matrix.md)

Use the change-impact matrix as required review material for substantial future implementation changes. It routes work to the relevant canonical documents, ADRs, verification categories, privacy/security review, operations review, and product-validation gates.

Task-specific AI context packs are currently defined in:

- [Context README](context/README.md)
- [Prompt Routing](context/prompt-routing.md)
- [Repository Baseline Pack](context/packs/index.pack.md)
- [Product and Domain Pack](context/packs/product-and-domain.pack.md)
- [Offline Sync Pack](context/packs/offline-sync.pack.md)
- [Mobile Field Capture Pack](context/packs/mobile-field-capture.pack.md)
- [AI-Assisted Recording Pack](context/packs/ai-assisted-recording.pack.md)
- [Privacy and Sharing Pack](context/packs/privacy-and-sharing.pack.md)
- [Server Deployment and Operations Pack](context/packs/server-deployment-and-operations.pack.md)
- [Testing and Diagnostics Pack](context/packs/testing-and-diagnostics.pack.md)
- [Dependency and Technology Selection Pack](context/packs/dependency-and-technology-selection.pack.md)
- [Documentation and ADR Governance Pack](context/packs/documentation-and-adr-governance.pack.md)

Context packs are derived routing aids only. They never override accepted ADRs or canonical documents.

## Authority Precedence

1. Accepted ADRs govern the specific decisions they record unless superseded.
2. Current product, domain, architecture, standards, and operations documents govern within their areas.
3. Context packs summarize and route agents to relevant canonical guidance; they do not override canonical sources.
4. Temporary plans, task prompts, issue discussions, implementation notes, and chat history are not canonical unless intentionally promoted into canonical documentation.

Do not quietly choose between conflicting canonical documents. Surface the conflict and correct or supersede the appropriate canonical source as part of the work. A context pack that conflicts with canonical documentation must be corrected.

## Canonical Document Metadata Standard

Every substantive canonical document created after this foundation task must begin with this metadata block:

```markdown
- Status: proposed | accepted | superseded | deprecated
- Last reviewed: YYYY-MM-DD
- Canonical for: <specific topic or invariant>
- Related ADRs: <links or none>
- Related docs: <links or none>
- Related tests: <paths or not yet implemented>
- Supersedes: <links or none>
```

README, index, and template files may use a simplified metadata block or omit it when they clearly serve as navigation rather than policy.

## Documentation Update Rule

Future changes must update relevant documentation in the same change set when they alter:

- Accepted product scope or explicit non-goals.
- Domain vocabulary or farm operational behavior.
- Offline or synchronization semantics.
- AI-assisted record trust or confirmation behavior.
- Privacy, visibility, data-sharing, or authorization behavior.
- Server, deployment, backup, or export behavior.
- Architectural boundaries or dependency rules.
- Repository-wide coding, testing, logging, security, or usability standards.

## Development Sequencing

This documentation foundation is intentionally being established before detailed implementation. Future prompts are expected to add:

- Technology-selection ADRs when implementation planning is ready.
- Implementation-specific standards only after accepted technology decisions.

Do not fill these future documents prematurely.
