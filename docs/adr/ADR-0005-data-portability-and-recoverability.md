# ADR-0005: Data Portability and Recoverability Are Required Operating Constraints

- Status: accepted
- Date: 2026-05-28
- Last reviewed: 2026-05-28
- Deciders: project owner and contributors
- Canonical for: exportability, backup/restore, migration safety, and recoverability as operating-model constraints
- Related docs: [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md), [Persistence and Attachment Storage](../architecture/persistence-and-attachment-storage.md), [Deployment Modes](../operations/deployment-modes.md), [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md), [Upgrades, Migrations, and Recovery Requirements](../operations/upgrades-migrations-and-recovery-requirements.md), [Deployment and Data-Control Validation Plan](../product/deployment-and-data-control-validation-plan.md)
- Supersedes: none
- Superseded by: none

## Context

The platform may eventually hold farm operational history, inventory observations, sourcing records, AI provenance, source captures, attachments, shared-listing history, and access metadata. Losing or trapping this information would undermine farmer trust and the open-source/data-control direction.

The product aims to support hosted convenience and credible farmer-controlled operation.

## Decision

Farm-owned operational data must eventually be recoverable and exportable across supported server operating modes.

Open-source and data-control goals require practical exportability of farm operational records and retained farm-owned content according to policy. Self-hosted/local operation requires supported backup and restore behavior before farms rely on it operationally. Hosted operation must eventually provide credible export and data-recovery expectations.

Upgrades and migrations must preserve operational meaning and privacy/visibility classification. Pending offline work and synchronization idempotency must be considered in restore/migration behavior. Backup/export artifacts are potentially sensitive and require later protection policy.

## Rationale

Farm operational history may become important to day-to-day operation. Data loss, lock-in, failed migration, or inaccessible recovery would make the product untrustworthy. Deployment flexibility is not credible without recoverability and portability.

## Alternatives Considered

### Alternative: Treat Export and Backup as Later Nice-to-Haves

- Benefits: simpler early implementation planning.
- Drawbacks: risks lock-in and unrecoverable farm records.
- Reason not selected: data-control is a core product direction.

### Alternative: Only Technical Self-Hosted Users Handle Recovery

- Benefits: pushes complexity to administrators.
- Drawbacks: leaves ordinary hosted/local users without practical recovery expectations.
- Reason not selected: recoverability must be a product-level requirement.

## Consequences

### Positive

- Technology selection must consider portability and recovery.
- Hosted and farmer-controlled modes can be evaluated against the same data-control expectations.
- Upgrade and restore scenarios become part of safety planning.

### Negative / Tradeoffs

- Backup, export, restore, and migration features add operational design burden.
- Sensitive data in exports/backups creates security and privacy responsibilities.

### Risks and Mitigations

- Risk: early prototypes may be mistaken for production-safe data stores.
- Mitigation: documentation must distinguish validation environments from production-ready backup/export/recovery support.

## Validation and Revisit Conditions

Farmer validation may refine which deployment modes and export experiences matter most. This decision should be revisited only if the project abandons farmer data-control goals, which would require broad product-governance review.

## Documentation and Test Impact

Future implementation must define and test export completeness, backup/restore, attachment handling, visibility preservation, migration safety, and restored-server reconnect/idempotency.

This ADR does not decide data/export formats, backup mechanism, restore workflow, encryption mechanism, local server packaging, hosted operator obligations beyond architectural requirement, or migration tooling.
