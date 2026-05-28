# ADR-0004: Farm Operational Data Is Private by Default and Sharing Is Intentional

- Status: accepted
- Date: 2026-05-28
- Last reviewed: 2026-05-28
- Deciders: project owner and contributors
- Canonical for: private-by-default farm data and intentional limited shared representations
- Related docs: [Privacy, Visibility, and Sharing Rules](../domain/privacy-visibility-and-sharing-rules.md), [Sourcing and Local Network Model](../domain/sourcing-and-local-network-model.md), [Identity, Privacy, and Sharing](../architecture/identity-privacy-and-sharing.md), [Synchronization Architecture](../architecture/synchronization-architecture.md), [Local Coordination and Sharing Validation Plan](../product/local-coordination-and-sharing-validation-plan.md)
- Supersedes: none
- Superseded by: none

## Context

The product connects private farm operational recordkeeping with a narrow local-sourcing workflow. Farmers must be able to trust that internal records, inventory observations, AI drafts, and sensitive captures do not become visible outside the farm by accident.

Coordination does not require exposing the private records that motivated a request.

## Decision

Operational records, inventory counts, discrepancies, internal needs, AI drafts, source captures, and sensitive attachments are private by default.

Local-network participation does not grant access to private farm operational data. A private supply need is separate from a shared need listing. A shared listing contains only information intentionally selected for sharing.

Synchronization of private records to an authorized server is not publication. AI cannot automatically select audience or publish information. Source audio/photos are not automatically included in shared listings. An offline-created publication request remains pending rather than externally visible until accepted synchronization.

## Rationale

Adoption depends on farmers trusting that operational data is not exposed unintentionally. Sourcing coordination can share selected needs without disclosing internal inventory, usage history, worker identity, or sensitive photos/audio. Hosted, local, and cooperative modes must preserve the same privacy boundary.

## Alternatives Considered

### Alternative: Local Network Members Can See Farm Operational Context

- Benefits: easier broad collaboration.
- Drawbacks: exposes sensitive farm data and undermines trust.
- Reason not selected: coordination should use intentionally shared representations.

### Alternative: Low Inventory Automatically Publishes a Need

- Benefits: faster sourcing workflow.
- Drawbacks: discloses shortages and operational context without consent.
- Reason not selected: publication must be intentional and understandable.

## Consequences

### Positive

- Privacy and sharing behavior is predictable across deployment modes.
- Need listings can be useful without revealing internal records.
- Sensitive AI captures and attachments remain protected by default.

### Negative / Tradeoffs

- Listing workflows require explicit review/publication steps.
- Later access-control, storage, sync, export, and diagnostics must preserve visibility boundaries.

### Risks and Mitigations

- Risk: users may misunderstand what is shared.
- Mitigation: later UI and tests must make private, pending, published, withdrawn, and failed states clear.

## Validation and Revisit Conditions

Farmer validation may refine listing fields and audiences. Public marketplaces, automatic shortage publication, or broader sharing require product-scope revision and a superseding decision.

## Documentation and Test Impact

Future tests must cover private-record non-publication, listing data minimization, offline pending publication, source-capture privacy, attachment visibility, and synchronization visibility boundaries.

This ADR does not decide authentication technology, permissions/role system, visibility-policy implementation, attachment access mechanism, encryption, audit-log implementation, or consent workflow.
