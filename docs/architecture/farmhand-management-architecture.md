# Farmhand Management Architecture

- Status: accepted
- Last reviewed: 2026-06-03
- Canonical for: local farmhand directory, schedule, task-assignment, and farmhand work-board architecture boundaries
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md), [ADR-0015](../adr/ADR-0015-local-farm-planning-foundation.md)
- Related docs: [Farmhand Management](../product/farmhand-management.md), [Farmhand Management Domain Rules](../domain/farmhand-management-rules.md), [Planning Architecture](planning-architecture.md), [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md)
- Related tests: `apps/mobile/src/application/use-cases/farmhandUseCases.test.ts`, `apps/mobile/src/ui/navigationMenu.test.ts`, `apps/mobile/src/infrastructure/sqlite/migrations/harvestMigration.test.ts`
- Supersedes: none

## Boundary

Farmhand management is a local module inside the standalone Expo/React Native mobile app. It follows the existing repository, SQLite migration, Zod validation, and recovery-copy patterns.

Farmhand management does not introduce:

- server synchronization;
- authentication;
- authorization roles;
- worker accounts;
- push notifications;
- SMS or in-product messaging;
- payroll or timeclock systems;
- cloud calendar integration;
- automatic task assignment;
- companion app implementation.

## Storage Boundary

Farmhand management stores local SQLite records for:

- farmhands;
- recurring weekly schedule blocks;
- week-by-week schedule blocks.

Planning tasks store an optional farmhand reference so assignment remains part of the existing planning task model without introducing accounts, permissions, payroll, messaging, or synchronization.

The mobile schedule UI may batch-create several recurring or week-specific rows from one form interaction. Those batches remain ordinary schedule records in storage; they do not introduce a new schedule-group table, calendar integration, payroll model, or attendance model. The application use-case layer treats a saved batch as the farmhand's current schedule and replaces older recurring/week-specific rows for that farmhand to avoid conflicting current schedules.

The week-start setting is persisted with the farmhand schedule settings repository because it was introduced for farmhand scheduling, but the UI treats it as a farm-level date preference. Farm setup is the configuration surface, and shared mobile date pickers consume the same value so calendar grids, schedule day order, and Week Of calculations stay consistent.

## Task Board Boundary

Farmhand work boards are filtered projections over `planning_tasks` assigned to a selected farmhand. They live in the shared Farm work boards route, where the farmer can choose All work or a specific farmhand. When a farmhand is selected, only boards containing that farmhand's assigned work should be displayed. They use the same task statuses as the generic planning board.

Moving a card updates the planning task status. It does not create labor records, payroll records, attendance records, or completed farm events.

## Call-Link Boundary

The call action uses the operating system URL-opening behavior for `tel:` links. The app should format the phone link and handle failure locally. It does not place calls directly, read call status, send SMS, or store external contact-book state.

## Export Boundary

Farmhand directory, schedule, and task-assignment data are included in the local recovery copy. This export may contain personal contact and schedule data, so user-facing export language should continue treating recovery copies as private and sensitive.

## Implemented Mobile Route

The current mobile implementation uses `/farmhands` as the manager-facing route for the farmhand directory and schedules. It composes the farmhand repository through the existing route/provider pattern. Schedule entry and editing are opened from the selected farmhand's directory item so forms stay near the farmhand being changed. The schedule panel shows a single current schedule card, ordered by configured week start, and whole-schedule edits replace that farmhand's prior schedule rows. Farmhand work-board filtering is implemented in the shared Farm work boards route as a projection over assigned planning tasks, not separate board rows or copied task records.

## Future Companion-App Boundary

The local farmhand model may provide stable IDs for future farmhand projections. A companion app requires later accepted architecture for identity, permissions, synchronization, device trust, revocation, and worker-visible data minimization.
