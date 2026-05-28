# Security and Privacy Engineering Standards

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: repository-wide private-by-default engineering obligations and sensitive-data review requirements
- Related ADRs: [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md)
- Related docs: [Privacy, Visibility, and Sharing Rules](../domain/privacy-visibility-and-sharing-rules.md), [Identity, Privacy, and Sharing](../architecture/identity-privacy-and-sharing.md), [Persistence and Attachment Storage](../architecture/persistence-and-attachment-storage.md), [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md), [Dependency and Supply Chain Standards](dependency-and-supply-chain-standards.md)
- Related tests: not yet implemented
- Supersedes: none

## Security and Privacy Engineering Posture

Privacy and security are behavioral requirements of the product, not deployment add-ons. Implementation must protect private farm operations, sensitive captures, sharing intent, exports, backups, and operational administration.

Hosted, local, cooperative, private-cloud, and technical self-hosted operating modes must preserve the same product-level private-by-default guarantees.

## Data Classification Categories

| Category | Engineering posture |
| --- | --- |
| Private operational records | Access only through authorized farm context |
| Inventory/discrepancy/history information | Sensitive private operational information |
| Internal supply needs | Private unless deliberately represented in a shared listing |
| Shared need/availability listing, when supported | Limited intentional representation only |
| AI drafts and correction/provenance data | Private by default |
| Source photos/audio | Sensitive private attachments |
| Export/backup artifacts | Sensitive content requiring protection |
| Authentication/security metadata later | Sensitive and non-loggable |
| Validation/research data | Must not contain sensitive real-world data without appropriate consent/governance |

## Minimum-Data Exposure Rule

Future implementation must:

- Transfer, expose, serialize, log, and share only data required for the authorized purpose.
- Avoid exposing internal records when a shared representation suffices.
- Avoid attaching sensitive source material to externally visible features by default.
- Keep internal operational details out of public/shared interfaces unless explicitly required and intentionally approved.

## Trust-Boundary Review Requirements

Any future change involving the following requires explicit privacy/security review:

- Authentication or membership.
- Local-network visibility.
- Listing publication.
- Attachments.
- AI capture.
- Exports or backups.
- Hosted operator access.
- Diagnostics/logging.
- Migration/restore.
- Device loss or revocation.
- Public/external endpoints.
- Third-party services or model APIs.

## Secrets and Credentials

- No committed secrets or credentials.
- No sensitive tokens or keys in docs, fixtures, logs, sample configuration, or prompts.
- Later runtime configuration must separate secrets from source-controlled policy/configuration.
- Future development prompts must not ask automated agents to embed secrets or expose them in diagnostics.

This standard does not select secret-management technology.

## Attachment and Capture Protection

- Photos/audio must be treated as sensitive by default.
- They must not gain automatic public or shared access.
- Later implementation must review local retention, server transfer, deletion, backup inclusion, export, and model-evaluation use.
- Test fixtures should use synthetic or safely authorized content.

## External Services and Model Providers

Future work must perform privacy and architecture review before transmitting private farm content, source captures, or sensitive record data to any external API or hosted model/provider.

Such work must document:

- What data leaves the farm/device/server.
- Why it is required.
- What user consent or configuration is required.
- What privacy boundary changes.
- What alternative local/private option exists or why it is not feasible.
- Whether an ADR and updated product/privacy documentation are required.

## Incident and Failure Posture

Later features will require procedures for accidental publication, lost device, compromised account/server, exposed backup/export, leaked attachment, hosted-service breach, and inappropriate operator access.

Full incident-response procedures are not part of this foundation. Future operations/security documentation must address the risks relevant to released features before production reliance.

## No Legal Overclaiming Rule

Engineering standards must not claim legal compliance, regulatory certification, guaranteed confidentiality, or production security maturity before such matters are intentionally assessed and supported.
