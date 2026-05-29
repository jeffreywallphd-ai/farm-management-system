# Operations Documentation

`docs/operations/` is canonical for supported deployment and recovery procedures once implementation exists.

## Current Operations Documents

- [Deployment Modes](deployment-modes.md): proposed deployment choices, intended operators, farmer burden, and deployment-mode invariants.
- [Local Farm Server Experience](local-farm-server-experience.md): target experience for a farmer-usable local server, distinct from technical self-hosting.
- [Mobile Pilot Data-Safety Requirements](mobile-pilot-data-safety-requirements.md): accepted immediate authority for Mobile Pilot 1 local retention, export/backup, update/replacement warnings, and farmer reliance boundaries.
- [Backup, Restore, and Data Export Requirements](backup-restore-and-data-export-requirements.md): requirements for standalone mobile pilot export/backup plus later backup, restore, export, portability, and sensitive data handling.
- [Upgrades, Migrations, and Recovery Requirements](upgrades-migrations-and-recovery-requirements.md): standalone mobile pilot update/replacement safety plus later upgrade safety, migration expectations, sync repair, and failure recovery requirements.

These documents are proposed operational requirements and target experiences. They are not instructions for already implemented deployment modes.

Because this product may serve farms with unreliable connectivity and limited technical support, operational simplicity and recoverability are product requirements rather than optional administrative concerns.

The current accepted implementation target is Mobile Pilot 1. Use [Mobile Pilot Data-Safety Requirements](mobile-pilot-data-safety-requirements.md) as the accepted operations authority for current pilot data safety. Server deployment modes remain future-facing unless later ADR/product work authorizes them.

Accepted ADRs now govern key operations constraints, especially [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), and [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md). Proposed and deferred deployment choices are tracked in the [Decision Readiness Register](../adr/decision-readiness-register.md).

Operations-affecting implementation work must also consult the [Logging and Diagnostics Standards](../standards/logging-and-diagnostics-standards.md), [Security and Privacy Engineering Standards](../standards/security-and-privacy-engineering-standards.md), [Dependency and Supply Chain Standards](../standards/dependency-and-supply-chain-standards.md), and [Change Impact Matrix](../standards/change-impact-matrix.md).
