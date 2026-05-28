# ADR-0006: Keep Architecture Compatible With Multiple Server Operating Modes

- Status: proposed
- Date: 2026-05-28
- Last reviewed: 2026-05-28
- Deciders: project owner and contributors
- Canonical for: proposed compatibility with hosted, local, technical self-hosted, cooperative, and private-cloud operating modes
- Related docs: [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md), [Deployment Modes](../operations/deployment-modes.md), [Local Farm Server Experience](../operations/local-farm-server-experience.md), [Deployment and Data-Control Validation Plan](../product/deployment-and-data-control-validation-plan.md)
- Supersedes: none
- Superseded by: none

## Context

The product direction values both low-friction use and farmer data control. Farms and organizations may differ in connectivity, support capacity, hosting preference, and privacy posture.

However, the repository does not yet contain farmer validation proving which operating mode should ship first or how much local/cooperative operation should be prioritized.

## Decision

Proposed: the architecture should remain compatible with managed hosted service, simplified single-farm local operation, technical self-hosting, and later cooperative/private-cloud operation.

This proposal does not commit every mode to Release 1, and it does not prioritize implementation sequence.

## Rationale

Avoiding exclusive dependence on permanent public-cloud connectivity supports open-source and data-control goals. Avoiding exclusive dependence on complex self-hosting supports ordinary farmer adoption.

## Alternatives Considered

### Alternative: Hosted-Only Architecture

- Benefits: simpler user onboarding and operations.
- Drawbacks: weakens farmer-controlled operation and portability goals.
- Reason not selected: current product direction requires credible farmer-controlled pathways.

### Alternative: Self-Hosted-Only Architecture

- Benefits: maximizes infrastructure control.
- Drawbacks: imposes technical burden many farms may reject.
- Reason not selected: ordinary farmers should not have to administer infrastructure.

## Consequences

### Positive

- Future technical decisions can be evaluated against multiple operating modes.
- The project can validate hosted, local, and cooperative preferences without immediate architectural dead ends.

### Negative / Tradeoffs

- Compatibility constraints may complicate server, storage, identity, update, and backup choices.
- Some choices may need to wait for validation and later ADRs.

### Risks and Mitigations

- Risk: compatibility language may be mistaken for Release 1 scope.
- Mitigation: decision-readiness register and product docs must keep implementation priority deferred pending validation.

## Validation and Revisit Conditions

Move this ADR to accepted only after the project confirms that multi-mode compatibility is an implementation constraint it is ready to carry, or supersede it with a narrower deployment strategy after validation.

## Documentation and Test Impact

Future deployment, packaging, backup, and support work should consult this proposal but must not treat it as accepted Release 1 scope. Later tests depend on the modes actually implemented.

This ADR does not decide server language, deployment packaging, containerization, cloud provider, local-server packaging, identity mechanism, migration approach, or hosting business model.
