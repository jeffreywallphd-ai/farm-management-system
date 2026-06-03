# ADR-0015: Local Farm Planning Foundation

- Status: accepted
- Last reviewed: 2026-06-02
- Canonical for: local mobile planning, roadmap, goal, subgoal, planning-period, and task foundation
- Related docs: [Farm Planning and Roadmapping](../product/farm-planning-roadmapping.md), [Farm Planning Domain Rules](../domain/farm-planning-rules.md), [Planning Architecture](../architecture/planning-architecture.md), [Organic Certification Readiness](../product/organic-certification-readiness.md)
- Related tests: `apps/mobile/src/application/use-cases/planningUseCases.test.ts`, `apps/mobile/src/infrastructure/sqlite/migrations/harvestMigration.test.ts`
- Supersedes: none

## Context

The mobile app now supports completed local work records and organic certification readiness records. Farmers also need to plan future work: long-term goals, short-term tasks, certification preparation, and later assignment-ready work items.

The existing organic system planning and inspection-readiness checklist behavior created useful task-like records, but those records were specific to organic certification. The product direction is to generalize planning while keeping Organic Certification as a standalone feature that quietly uses the shared planning foundation.

## Decision

Add a local planning foundation to the standalone mobile app.

The foundation includes:

- goals;
- parent/child goal hierarchy for subgoals;
- selectable planning periods;
- tasks sized for practical completion within a selected period;
- local links from goals/tasks to farm notes, farm places, tracked items, organic records, and reports;
- a local responsible-person text field for future farmhand assignment compatibility.

Organic Certification will be the first vertical slice. Certification screens may create and display certification-specific goals, subgoals, and tasks, but the farmer should experience certification as a standalone feature rather than a filtered generic planner.

## Boundaries

This decision does not authorize:

- cloud calendars;
- push notifications;
- background reminders;
- authentication or worker accounts;
- multi-device assignment;
- server synchronization;
- automatic AI task generation;
- compliance scoring;
- certifier submission;
- a generic workflow engine.

The planning foundation is local, farmer-controlled, and exportable through the existing recovery-copy mechanism.

## Rationale

Goals and subgoals support long-term farm planning without requiring dense project-management screens. Planning periods support farmer-friendly short-term work chunks such as today, this week, two weeks, month, season, year, or a custom range. Tasks provide the lowest shared unit for both planning and future assignment-ready work, while a text responsible-person field avoids prematurely implementing identity or authorization.

Certification planning can reuse this foundation while preserving organic-specific language, templates, reports, and review workflows.

## Consequences

Positive:

- Planning has one local model instead of several checklist-like subsystems.
- Organic certification can present meaningful subgoals and timelines without becoming generic.
- Future assignment workflows have a stable task-level foundation.
- Recovery export can include open work, not only completed records.

Tradeoffs:

- The app now stores future-intent data as well as completed work.
- Planning UI must stay simple to avoid project-management clutter.
- Existing organic inspection-readiness records need compatibility treatment while new certification tasks use planning records.

## Validation

Implementation must verify:

- goal hierarchy;
- task editing and status changes;
- selectable planning periods;
- certification template creation without duplicate goals/tasks;
- recovery export;
- local-only/privacy boundaries;
- organic certification planning reports without compliance scoring.
