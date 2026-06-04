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
- planning boards.

Goals support parent/child relationships by storing an optional `parent_goal_id`. Goals and tasks may also store an optional local `place_id` reference to `farm_locations` so planning screens can scope work to farm places. Cycle prevention and place ownership validation are enforced in the use-case/repository boundary.

Tasks store optional desired start dates, target completion dates, assigned farmhand references, and local task instruction attachment metadata. Task instruction audio/photos are private local task context copied into app-owned local storage before save. Completed-work evidence remains a normal linked farm event; planning links do not copy farm note audio, photos, transcripts, organic evidence media, or other linked records.

Planning links store only IDs and local relationship metadata.

Planning boards store local board title, scope, optional goal reference, optional work-in-progress limit, and timestamps. They are saved views over `planning_tasks`, not a separate task membership or workflow-engine table. Goal boards derive their cards from the associated highest-level goal tree. The non-goal board derives its cards from tasks with no `goal_id`.

## Organic Certification Boundary

Organic Certification may create default certification planning goals and tasks from templates. Those records are normal planning records with certification source metadata. Organic Certification screens may filter and present those records in certification-specific language.

Existing Organic System Plan section records remain OSP narrative records. New inspection-prep checklist behavior should use planning tasks rather than creating a second task system.

Dedicated organic evidence-review and package-generation workflows should not be duplicated as seeded standing planning goals. When template-owned certification goals are retired, repository delete operations may remove those template records while preserving ordinary farmer-created tasks.

## Export Boundary

Planning records, including planning boards, are included in the existing local recovery copy. Exporting planning records does not publish, sync, assign, or notify anyone.

## Future Compatibility

The task model includes an optional local farmhand reference for the implemented farmhand-management slice. That reference is not an account, role, authorization mechanism, notification target, or synchronization identity.
