# Logging and Diagnostics Standards

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: privacy-safe diagnostics, structured failure visibility, and operational supportability expectations
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [Synchronization Architecture](../architecture/synchronization-architecture.md), [Identity, Privacy, and Sharing](../architecture/identity-privacy-and-sharing.md), [Upgrades, Migrations, and Recovery Requirements](../operations/upgrades-migrations-and-recovery-requirements.md), [Security and Privacy Engineering Standards](security-and-privacy-engineering-standards.md)
- Related tests: not yet implemented
- Supersedes: none

## Diagnostics Purpose

Logs and diagnostics exist to identify local pilot save/export/backup failures, later retries and synchronization issues, migration problems, attachment failures, privacy-boundary violations, and local/hosted operational problems.

Diagnostics must support troubleshooting without making private farm contents a routine part of logs. Logs are not an acceptable substitute for user-visible status where a farmer needs to know whether work is saved, synchronized, published, or requires attention.

## Structured Diagnostics Requirement

Future implementation should use structured, consistently identifiable diagnostic events rather than scattered ad hoc text logging for important boundaries.

| Diagnostic category | Examples |
| --- | --- |
| Application lifecycle | Startup, shutdown, configuration validation |
| Local record lifecycle | Retained locally, local save failed, confirmation transition, export/backup status |
| Synchronization | Submission attempted, accepted, retry scheduled, rejected, attention required |
| Publication | Publication requested, accepted, withdrawn, failed |
| Attachment transfer | Queued, transferred, failed, removed |
| AI-assisted capture | Capture initiated, draft produced, confirmation/rejection, interpretation failure, without sensitive payload logging |
| Backup/export/restore | Started, completed, failed, validation result |
| Upgrade/migration | Migration started, completed, failed, rollback/recovery state |
| Access/privacy boundary | Access denied, prohibited exposure prevented, redaction applied |
| Health/operations | Server reachable/unreachable, local server health, storage concern |

## Minimum Context for Significant Diagnostic Events

Future structured events should carry only appropriate fields such as stable event category/name, severity, timestamp, operation type, deployment/client/server context where necessary, correlation/request/sync attempt identifier, duration, outcome, normalized failure category, non-sensitive opaque reference, and retry/attention state.

This standard does not define an exact schema or logging library.

## Sensitive Information Prohibited From Ordinary Logs

Ordinary logs must not include by default:

- Source audio contents.
- Source photos.
- Full speech transcripts.
- Full AI prompts or inferred payloads.
- Detailed farm operational record contents.
- Precise location data.
- Inventory quantities unless explicitly required for secured troubleshooting and appropriately redacted.
- Farmer personal/contact information.
- Credentials, tokens, secrets, cryptographic keys.
- Full attachment contents.
- Backup contents.
- Listing content beyond what is necessary and permitted for a controlled diagnostic context.

## Offline and Sync Diagnostics Requirements

Later diagnostic coverage must help troubleshoot:

- Locally retained work that has not synchronized.
- Repeated transmission and idempotency outcomes.
- Server rejection or requires-attention outcomes.
- Extended server unavailability.
- Attachment pending or failed transfer.
- Publication pending versus published state.
- Restore/reconnect duplicate-prevention behavior.
- Client/server version incompatibility or migration concerns later.

## Farmer-Facing Status Versus Operator Diagnostics

| Need | Appropriate output |
| --- | --- |
| Farmer needs to know whether work is safe or shared | Clear user-visible status |
| Technical operator needs failure diagnosis | Structured privacy-safe diagnostics |
| Automated agent debugging a defect | Targeted logs/test evidence with sensitive content excluded |
| Hosted/local incident response later | Operational diagnostics governed by privacy/security policy |

Raw technical logging must not be the only indication available to the user that records are pending or publication failed.

## Verbosity and Redaction Principle

Later implementations may support increased diagnostic detail where appropriate without disabling privacy protection. Debug/trace modes must not become an excuse to dump sensitive records, captures, or credentials.

## Deferred Tooling

This standard does not select logging library, metrics/tracing system, hosted monitoring provider, local diagnostics dashboard, alerting system, or redaction implementation.
