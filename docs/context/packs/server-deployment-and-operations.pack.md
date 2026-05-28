# Context Pack: Server Deployment and Operations

- Pack name: `server-deployment-and-operations`
- Status: active
- Last reviewed: 2026-05-28
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents work on server operation, deployment modes, local-server experience, hosting, export, backup, restore, upgrade, migration, recovery, and operational support.

## Use When

- Server implementation planning.
- Hosted, local, self-hosted, cooperative, or private-cloud mode.
- Installation, appliance, or farmer-usable local experience.
- Backup, export, restore, upgrade, or migration.
- Diagnostics for local/hosted operation.
- Data portability.
- Server availability and mobile sync destination concerns.

## Do Not Use When

- The task is only farm-domain behavior with no deployment/operations impact.
- The task is AI/provider selection without server/deployment implications.

## Core Guidance

- Mobile offline capability remains required in every deployment mode.
- Ordinary farmers must not be assumed to administer infrastructure.
- Hosted use and credible farmer-controlled/self-hosted operation remain compatible directions.
- Deployment priority and implementation technology remain unresolved unless later accepted.
- All deployment modes preserve privacy and intentional-sharing constraints.
- Backup, export, restore, upgrade, and recovery are foundational operating concerns.
- Sensitive attachments and pending offline work affect operations design.

## Non-Negotiable Constraints

- [ADR-0001](../../adr/ADR-0001-offline-first-field-operation.md): deployment mode does not remove offline field operation.
- [ADR-0004](../../adr/ADR-0004-private-by-default-intentional-sharing.md): deployment mode does not widen visibility.
- [ADR-0005](../../adr/ADR-0005-data-portability-and-recoverability.md): recoverability and exportability are required constraints.
- [ADR-0006](../../adr/ADR-0006-deployment-mode-compatibility.md): multi-mode compatibility is proposed, not Release 1 scope.

## Decisions Still Deferred

Server language, database, object storage, packaging, containers/installers/appliance, cloud provider, initial production mode, optional hosted backup, and server-to-server federation remain deferred.

## Explicit Non-Goals / Overreach to Avoid

Do not create fake install commands, production hosting commitments, local-server shipping promises, pricing/business model, federation, or infrastructure configuration in a docs-only or evaluation task.

## Canonical Source Documents and ADRs

- `docs/architecture/server-and-deployment-operating-model.md`: deployment-neutral architecture constraints.
- `docs/operations/deployment-modes.md`: operations-facing mode comparison.
- `docs/operations/local-farm-server-experience.md`: farmer-usable local operation target.
- `docs/operations/backup-restore-and-data-export-requirements.md`: backup/export/restore requirements.
- `docs/operations/upgrades-migrations-and-recovery-requirements.md`: upgrade/migration/recovery safety.
- `docs/product/deployment-and-data-control-validation-plan.md`: validation gates.

## Required Standards

- `docs/standards/security-and-privacy-engineering-standards.md`
- `docs/standards/dependency-and-supply-chain-standards.md`
- `docs/standards/testing-and-verification-standards.md`
- `docs/standards/logging-and-diagnostics-standards.md`
- `docs/standards/change-impact-matrix.md`

## Required Documentation Impact Review

Review architecture/operations docs, privacy docs, sync docs, and the readiness register when deployment mode, backup/export/restore, upgrade/migration, diagnostics, or server authority behavior changes.

## Required Verification Impact Review

Future implementation must verify server-unavailable mobile work, backup/restore, export completeness, migration safety, visibility preservation, restored reconnect/idempotency, local-server recovery, and privacy-safe diagnostics.

## Prompt Assembly Notes

Common companions: `offline-sync`, `privacy-and-sharing`, `testing-and-diagnostics`, and `dependency-and-technology-selection` for technical choices.
