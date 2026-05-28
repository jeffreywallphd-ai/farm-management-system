# Context Pack: Dependency and Technology Selection

- Pack name: `dependency-and-technology-selection`
- Status: active
- Last reviewed: 2026-05-28
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents evaluate or introduce dependencies, external services, providers, runtimes, infrastructure components, or previously deferred technology choices.

## Use When

- Adding a package.
- Selecting server/mobile/database/sync/storage technology.
- Adding an AI/model provider or runtime.
- Adding identity, cloud, analytics, notification, storage, backup, CI, security, or deployment tooling with operational implications.
- Performing technology-selection ADR work.

## Do Not Use When

- A task uses existing accepted technology without adding dependency/provider choices.
- A documentation-only change has no technology or dependency implications.

## Core Guidance

- Dependency or technology selection must serve an approved current need.
- Deferred technology choices cannot be selected casually during unrelated feature work.
- Evaluate licensing, maintenance, vulnerabilities, offline impact, privacy/data transmission, deployment burden, portability, resource use, and replaceability.
- Core open-source behavior must not depend on proprietary/source-restricted infrastructure without explicit decision treatment.
- External AI/provider use involving private farm data or captures requires privacy/architecture review.

## Non-Negotiable Constraints

- [ADR-0001](../../adr/ADR-0001-offline-first-field-operation.md): technology must preserve offline field operation.
- [ADR-0003](../../adr/ADR-0003-ai-interpretations-require-confirmation.md): AI technology must preserve confirmation boundary.
- [ADR-0004](../../adr/ADR-0004-private-by-default-intentional-sharing.md): providers/dependencies must not widen data exposure.
- [ADR-0005](../../adr/ADR-0005-data-portability-and-recoverability.md): technology must support recoverability/portability.

## Decisions Still Deferred

Server language, mobile framework, web framework, local/server persistence, sync protocol/vendor, storage backend, AI model/runtime/provider, identity/auth/security, deployment packaging, cloud provider, observability stack, test tooling, export format, and migration tooling remain deferred unless later ADRs accept them.

## Explicit Non-Goals / Overreach to Avoid

Do not smuggle technology selection into feature work. Do not add proprietary lock-in, external sensitive-data transmission, or farmer infrastructure burden without explicit ADR/product/architecture treatment.

## Canonical Source Documents and ADRs

- `docs/adr/decision-readiness-register.md`: deferred technology and product-priority decisions.
- `docs/adr/README.md`: ADR policy.
- `docs/standards/dependency-and-supply-chain-standards.md`: dependency review factors.
- `docs/standards/security-and-privacy-engineering-standards.md`: external-service data review.
- `docs/architecture/server-and-deployment-operating-model.md`: deployment compatibility constraints.
- Affected feature pack/docs for the technology area.

## Required Standards

- `docs/standards/dependency-and-supply-chain-standards.md`
- `docs/standards/security-and-privacy-engineering-standards.md`
- `docs/standards/documentation-standards.md`
- `docs/standards/change-impact-matrix.md`

## Required Documentation Impact Review

Technology selection usually requires ADR review. Update affected architecture, operations, standards, and context packs only after the canonical decision changes.

## Required Verification Impact Review

Future implementation must verify accepted ADR constraints plus dependency-specific security, license, privacy, offline, deployment, and operational behavior.

## Prompt Assembly Notes

Pair with `documentation-and-adr-governance` for decision work and with the functional pack affected by the technology, such as `offline-sync`, `ai-assisted-recording`, or `server-deployment-and-operations`.
