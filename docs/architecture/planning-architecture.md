# Planning Architecture

- Status: accepted
- Last reviewed: 2026-06-04
- Canonical for: local planning architecture boundaries
- Related ADRs: [ADR-0015](../adr/ADR-0015-local-farm-planning-foundation.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md)
- Related docs: [Farm Planning and Roadmapping](../product/farm-planning-roadmapping.md), [Farm Planning Domain Rules](../domain/farm-planning-rules.md), [Organic Certification Architecture](organic-certification-architecture.md)
- Related tests: `apps/mobile/src/application/use-cases/planningUseCases.test.ts`, `apps/mobile/src/infrastructure/sqlite/migrations/harvestMigration.test.ts`
- Supersedes: none

## Boundary

Planning is a local module inside the existing standalone Expo/React Native mobile app. It uses the same repository, SQLite migration, Zod validation, and recovery-copy patterns as the rest of the mobile pilot.

Planning does not introduce a server, synchronization protocol, authentication, background job, notification service, cloud calendar, analytics, or workflow engine.

## Storage Boundary

Planning adds local SQLite storage for:

- planning goals;
- planning tasks;
- planning links;
- planning boards;
- farm work pack activation state;
- farm work pack item activation state for added starter-pack subgoals and tasks.

Goals support parent/child relationships by storing an optional `parent_goal_id`. Goals and tasks may also store an optional local `place_id` reference to `farm_locations` so planning screens can scope work to farm places. Cycle prevention and place ownership validation are enforced in the use-case/repository boundary.

Tasks store optional desired start dates, target completion dates, assigned farmhand references, and local task instruction attachment metadata. Task instruction audio/photos are private local task context copied into app-owned local storage before save. Completed-work evidence remains a normal linked farm event; planning links do not copy farm note audio, photos, transcripts, organic evidence media, or other linked records.

Planning links store only IDs and local relationship metadata.

Planning boards store local board title, scope, optional goal reference, optional work-in-progress limit, and timestamps. They are saved views over `planning_tasks`, not a separate task membership or workflow-engine table. Goal boards derive their cards from the associated highest-level goal tree. The non-goal board derives its cards from tasks with no `goal_id`.

## Organic Certification Boundary

Organic Certification may create default certification planning goals and tasks from templates. Those records are normal planning records with certification source metadata. Organic Certification screens may filter and present those records in certification-specific language.

The organic certification template may create more than one highest-level certification goal. The current certification template uses separate administration and farm-work root goals so the shared default-board generator can create separate local boards for those goal trees without adding certification-specific board storage.

Certification planning visibility is controlled by the local organic operation profile. Missing profiles and `notOrganic` profiles hide template-owned certification goal trees and tasks from Farm Planning and Farm Work Boards. The records may remain in SQLite and recovery copies; the UI filter prevents inactive certification work from appearing until the farmer turns certification pursuit back on from Farm setup.

Existing Organic System Plan section records remain OSP narrative records. New inspection-prep checklist behavior should use planning tasks rather than creating a second task system.

Dedicated organic evidence-review and package-generation workflows should not be duplicated as seeded standing planning goals. When template-owned certification goals are retired, repository delete operations may remove those template records while preserving ordinary farmer-created tasks.

## Default Farm Work Pack Boundary

Farm setup may apply local starter work packs for common farm work. A pack is local template data with a stable pack ID, administration/planning or farm-work group, setup question, suggested-for tags, goal templates, subgoal templates, task templates, and stable template keys. Applying a pack writes ordinary planning goals and tasks through the same planning use cases and repository used by farmer-created planning work.

Pack-created records use `farmWorkTemplate` source metadata so the app can distinguish starter-pack records from farmer-created records and organic certification template records. The template metadata supports duplicate prevention and future pack maintenance; it is not a plugin runtime, remote package manager, marketplace, sync channel, or community code execution mechanism.

Farm setup stores one local activation row per added starter pack. The activation row controls whether template-owned pack goal trees appear in Farm Planning and Farm Work Boards. Deactivation is a UI visibility filter, not a destructive delete or task-status mutation. Planning rows, task completion data, linked farm events, and recovery-copy export remain intact so reports can still use past work.

Farm setup also stores local item activation rows for added starter-pack subgoals and tasks when a farmer deactivates or reactivates them. Added item checkboxes are locked in the setup outline because the underlying planning rows already exist. Unadded subgoals and tasks remain selectable later. Item deactivation filters those template-owned rows out of Farm Planning and Farm Work Boards while preserving the rows for reporting and recovery export. Root starter-pack goal visibility remains controlled by the pack activation row.

Partial pack application is supported by creating only the parent goals, subgoals, and selected task templates needed for the farmer's chosen starter work. The Farm setup UI groups packs into administration/planning and farm-work sections and submits additions one pack at a time. The same stable template-key path is used for later additions so rerunning a pack can add missing selected tasks without overwriting farmer-edited existing rows.

Future community-developed packs should use the same data shape and local validation path. Loading packs from outside the bundled app, signing packs, distributing packs, or syncing pack catalogs is deferred and would require separate product and architecture review.

## Export Boundary

Planning records, including planning boards, farm work pack activation state, and starter-pack item activation state, are included in the existing local recovery copy. Exporting planning records does not publish, sync, assign, or notify anyone.

## Future Compatibility

The task model includes an optional local farmhand reference for the implemented farmhand-management slice. That reference is not an account, role, authorization mechanism, notification target, or synchronization identity.
