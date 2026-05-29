# ADR-0010: Mobile Pilot 1 Export and Recovery-Copy Mechanism

- Status: accepted
- Date: 2026-05-28
- Last reviewed: 2026-05-28
- Deciders: project owner and contributors
- Canonical for: Mobile Pilot 1 local export and recovery-copy mechanism
- Related docs: [Mobile Pilot 1 Implementation Scope](../product/mobile-pilot-1-implementation-scope.md), [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md), [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md), [Decision Readiness Register](decision-readiness-register.md)
- Supersedes: none
- Superseded by: none

## Context

Mobile Pilot 1 may contain meaningful farmer-created records before any server exists. Farmers need a practical way to retrieve or safeguard pilot data without cloud or server infrastructure.

The accepted data-safety requirements warn against calling a one-way export a full backup/restore unless import/restore exists and is tested.

## Decision

Use a versioned JSON export package for Mobile Pilot 1.

Generate export files locally on the device.

Use Expo FileSystem and Expo Sharing for the user-controlled save/share flow.

Include Mobile Pilot 1 farm setup/reference data and the three accepted operational record types in the export:

- `HarvestRecorded`
- `MaterialUseRecorded`
- `InventoryCountRecorded`

Do not call the feature full backup/restore unless import/restore exists and is tested.

Do not select cloud backup, server backup, production archive, encryption, or restore/import technology in this ADR.

## Rationale

Farmers must be able to retrieve pilot data before relying on Mobile Pilot 1 for meaningful records.

JSON preserves relationships among farm setup, locations, tracked items, quantities, units, identifiers, timestamps, privacy classifications, and records better than a simple CSV-only export.

Native share/save behavior provides a practical recovery-copy path without prematurely choosing server, cloud, or managed backup infrastructure.

This mechanism satisfies the accepted Mobile Pilot 1 data-safety requirement while keeping the pilot narrow.

## Alternatives Considered

### Alternative: CSV Export Only

- Benefits: easy to inspect in spreadsheets.
- Drawbacks: harder to preserve relationships, versioning, and nested farm reference data.
- Reason not selected: Mobile Pilot 1 export must preserve record meaning and relationships.

### Alternative: Cloud Backup

- Benefits: easier recovery after device loss if configured.
- Drawbacks: selects cloud/provider/security posture outside current scope.
- Reason not selected: server/cloud backup is deferred.

### Alternative: Database File Copy

- Benefits: simple implementation and complete local state snapshot.
- Drawbacks: less portable, less inspectable, and couples export to internal persistence layout.
- Reason not selected: export should be a farmer-retrievable package, not merely a storage artifact.

## Consequences

### Positive

- Mobile Pilot 1 gains a concrete recovery-copy direction.
- Export format can be versioned and validated at runtime.
- The mechanism remains local and user-controlled.

### Negative / Tradeoffs

- JSON export does not by itself provide restore/import.
- Users need clear wording about what the export includes and what risks remain.

### Risks and Mitigations

- Risk: users may assume an export is a full backup/restore.
- Mitigation: user-facing language must match implemented capability.
- Risk: exported files may disclose sensitive farm operations.
- Mitigation: privacy guidance and future tests must treat export files as private/sensitive.

## Validation and Revisit Conditions

Revisit this ADR if farmer testing shows JSON export is not understandable or sufficient, if restore/import becomes accepted scope, or if server/cloud backup is later authorized.

## Documentation and Test Impact

Documentation and context routing must identify versioned JSON, local generation, Expo FileSystem, and Expo Sharing as accepted Mobile Pilot 1 export/recovery-copy decisions.

Future implementation must verify export completeness, versioning, privacy classification preservation, and accurate user-facing wording.
