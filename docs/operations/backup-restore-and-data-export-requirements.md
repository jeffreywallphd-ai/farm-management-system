# Backup, Restore, and Data Export Requirements

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: backup, restore, export, portability, migration, sensitive backup handling, and data ownership requirements
- Related ADRs: [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [Operations README](README.md), [Deployment Modes](deployment-modes.md), [Local Farm Server Experience](local-farm-server-experience.md), [Upgrades, Migrations, and Recovery Requirements](upgrades-migrations-and-recovery-requirements.md), [Persistence and Attachment Storage](../architecture/persistence-and-attachment-storage.md), [Identity, Privacy, and Sharing](../architecture/identity-privacy-and-sharing.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines product and operational requirements for backup, restore, export, portability, and data ownership before real farm records become dependent on the platform.

It does not provide commands for unimplemented infrastructure.

## Standalone Mobile Pilot Requirement

Before farmers rely on a standalone mobile pilot for meaningful operational data, the pilot must provide a practical export/backup pathway.

The farmer must understand what is included in the export/backup, especially whether local setup/reference information, confirmed records, local history, private supply needs, photos, audio, provenance, AI drafts, and discarded drafts are included or excluded.

The pilot must not imply production-grade disaster recovery unless that recovery behavior is implemented and verified. Device loss, app uninstall, test build replacement, app update, local data corruption, and phone replacement are immediate pilot data-risk scenarios.

Export/backup format and implementation technology remain deferred to implementation planning and possible ADR work. The capability is now required by pilot scope; the mechanism is not selected here.

## Why Backup, Restore, and Export Are Foundational

The platform may eventually retain farm operational history, inventory observations, local sourcing records, sensitive photos/audio, AI capture provenance, sharing/publication history, membership, and configuration data.

Losing access to such data or trapping it in an inaccessible deployment would undermine farmer trust and the open-source mission.

## Data Ownership Posture

A farm must have a practical means to retrieve or back up meaningful standalone mobile pilot data before relying on the pilot operationally. The farm must eventually have a practical means to retrieve its operational data and associated farm-owned content in a usable form across later hosted or self-hosted operation.

This is a product requirement, not production legal ownership language.

## Backup, Restore, Export, Migration, and Synchronization Recovery

| Concept | Meaning |
| --- | --- |
| Backup | A recoverable copy intended to restore operation after loss, damage, corruption, or failure |
| Restore | Reconstructing a working system or farm dataset from a supported backup |
| Export | Retrieving farm data/content in a usable form for review, archival, portability, or migration |
| Migration | Moving compatible data or operation from one version or deployment arrangement to another |
| Synchronization recovery | Restoring correct handling of pending or accepted mobile/server work after an interruption or failure |

## Information Requiring Later Backup/Export Policy

| Information category | Backup requirement posture | Export requirement posture | Privacy sensitivity |
| --- | --- | --- | --- |
| Farm configuration/reference data | Required for meaningful standalone pilot reliance | Required for pilot export/backup | Moderate/private |
| Confirmed operational records | Required for meaningful standalone pilot reliance | Required for pilot export/backup | Private |
| Inventory observations/discrepancy history | Required | Required | Private/sensitive |
| Supply needs and listing history | Private pilot supply needs required if retained; listing history future only | Private pilot needs exportable if retained; listing export later | Mixed private/shared |
| Shared published listings | Future server-connected requirement only | Exportable with visibility metadata later | Shared but potentially sensitive |
| AI drafts | Pilot retention policy required; not necessarily retained indefinitely | Policy required | Sensitive/private |
| Source photos/audio | Required if retained as pilot product data | Exportable/deletable according to policy | Highly sensitive |
| Attachments deliberately shared with listings, later | Required if supported and retained | Exportable with sharing context | Potentially sensitive |
| Sync state/pending local records | Recovery requirement critical | Not necessarily ordinary export format | Operationally critical |
| Accounts/membership/access metadata | Required for restore where implemented | Policy required | Sensitive |
| Audit/publication history | Required once relied upon | Policy required | Sensitive |

## Hosted-Mode Requirements

Future hosted mode requires:

- Clear data export pathway.
- Protection against data loss through operator backup procedures.
- Clear handling of attachments and sensitive captures.
- Future policy for account closure/data deletion and export prior to deletion.
- Restoration/incident procedures appropriate to a managed service.
- No assumption that the farmer has direct infrastructure access.

This document does not create production service commitments before implementation exists.

## Local and Self-Hosted Requirements

Future local/self-hosted operation requires:

- Documented backup process before production use.
- Documented restore verification process.
- Backup should include the information needed to recover an operating farm dataset.
- User must understand whether attachments are included.
- Backups must be protected because they may contain private and sensitive data.
- Update processes should not proceed casually without a recovery path.
- Failure of local hardware must not imply permanent loss if users followed supported backup guidance.

## Export Portability Requirements

A future export should:

- Distinguish private operational records from intentionally shared listings.
- Preserve essential identifiers, timestamps, quantities, units, locations/items, and record relationships needed to understand farm history.
- Include or separately package user-owned attachments where permitted.
- Indicate provenance of AI-assisted records where relevant and appropriate.
- Avoid forcing a farm to remain on a hosted service merely to read its historical data.
- Use documented formats later selected for practicality and portability.

This document does not select CSV, JSON, archive format, database dump, or attachment packaging.

## Restore Integrity Requirements

Later restore behavior must ensure:

- Restored data retains operational-record history.
- Private/shared visibility classifications are not lost or widened during restore.
- Attachment associations remain intact where attachments are included.
- Pending/unsynchronized mobile records receive a considered recovery policy.
- Restoring from backup does not silently duplicate accepted synchronized records when devices later reconnect.
- Restore procedures are testable before release.

## Sensitive Backup Handling

Backups may contain private records, crop/inventory history, personal or contact information, sensitive photos/audio, listings and responses, and access/security metadata later.

Later implementation must define:

- Backup access protection.
- User warnings/guidance.
- Retention/deletion posture.
- Encryption or other protection decisions.
- Hosted operator responsibilities.
- Local user responsibilities.

This document does not select encryption technology.

## Required Later Verification Categories

Future implementation must verify:

- Backup creation and restore.
- Export completeness.
- Attachment inclusion/exclusion.
- Visibility preservation after restore.
- Synchronization replay/idempotency following restore.
- Local-server hardware-loss recovery scenarios.
- Hosted export scenarios.
- Sensitive-data redaction/handling review.
