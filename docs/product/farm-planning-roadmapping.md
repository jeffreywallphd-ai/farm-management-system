# Farm Planning and Roadmapping

- Status: accepted
- Last reviewed: 2026-06-04
- Canonical for: local farm planning, roadmap, goal/subgoal, assignment-ready task, and work-board product behavior
- Related ADRs: [ADR-0015](../adr/ADR-0015-local-farm-planning-foundation.md), [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [Organic Certification Readiness](organic-certification-readiness.md), [Field Workflows](field-workflows.md), [Farm Planning Domain Rules](../domain/farm-planning-rules.md), [Planning Architecture](../architecture/planning-architecture.md)
- Related tests: `apps/mobile/src/application/use-cases/planningUseCases.test.ts`, `apps/mobile/src/ui/screens/PlanningScreenModel.test.ts`
- Supersedes: none

## Product Goal

Farm planning helps farmers turn future intent into practical local work. It supports long-term goals, subgoals, concrete assignment-ready tasks, desired start dates, target completion dates, and optional task instructions without requiring cloud calendars, office-heavy project management, or worker accounts.

The first vertical slice is Organic Certification planning. The Organic Certification area remains a standalone feature, but its goals and tasks use the shared planning foundation.

## Product Loop

```text
Create goal
-> break into subgoals
-> create or adjust tasks
-> add desired start/target dates and optional instructions
-> review tasks on farm work boards
-> link notes/records when useful
-> update task status
-> export recovery copy
```

## Planning Concepts

Goals represent outcomes the farmer wants to move toward. Goals can have child goals, allowing broad outcomes to be chunked into subgoals.

Tasks are concrete work items sized for practical completion. They may include an optional desired start date, optional target completion date, optional assigned farmhand, and optional local recorded/photo instructions. Task instruction media helps explain planned work; completed-work evidence should be captured as linked farm events.

Goals and tasks may optionally reference a local farm place. When a goal has a place, task creation inside that goal should limit place choices to that place or places embedded inside it so the farmer does not accidentally plan work in an unrelated area.

Farm work boards are local kanban-style views over existing planning tasks. The app creates a default board for each highest-level goal and a separate board for tasks that do not belong to a goal. A board does not create a second task system, does not copy farm events, and does not add workflow automation. Board columns are the existing task statuses, and moving a card updates the task status. Farmers should not need to create separate boards manually unless a later validated workflow requires it.

On mobile, boards should favor a board selector, one visible work view at a time, stacked task cards, large labeled actions, and optional work-in-progress limits. Work views may be a single status or a farmer-friendly grouped view such as all incomplete work or all currently workable tasks. Board task cards should be collapsed by default, include the current status in the card title, and allow only one open task card at a time to keep the mobile page scannable. Open task cards should show the task description, farm place when set, desired start date, target completion date, task instruction media, and linked farm events. The farmer can record a farm event from a task card inline without leaving the board; that event remains a normal voice/photo farm event linked back to the task.

## Generic Planning Area

The generic Planning area should support ordinary farm planning such as field prep, infrastructure work, crop planning, sales prep, equipment maintenance, and general farm improvements.

Its primary screen should begin with three large choices:

- Create a goal with tasks;
- Create a single task;
- Review planned work.

Create a goal with tasks should focus the farmer on one highest-level goal tree at a time. It should show the goals/subgoals form and the task form for that tree only. The goal/task hierarchy is the only preview in this mode, and task goal choices must stay inside the current highest-level goal tree.

Create a single task should show only the task form for work that does not belong to a goal yet.

Review planned work should show no forms by default. It should list highest-level goals and non-goal tasks under separate headings. Choosing a goal opens that goal tree for focused editing, including the selected goal form plus its associated subgoals and tasks with inline edit actions. Choosing a non-goal task opens that single task for editing.

## Organic Certification Planning

Organic Certification uses the planning foundation while remaining a standalone feature.

The certification area should create a certification goal with meaningful subgoals:

- Set up certification profile.
- Document land and transition status.
- Review input approvals and restrictions.
- Track input applications and evidence.
- Organize seed and planting records.
- Document soil fertility and crop rotation practices.
- Manage compost evidence.
- Track raw manure applications and harvest intervals.
- Document pest, weed, disease, and mulch practices.
- Prepare lot traceability records.
- Review handling, storage, sales, and mass balance.
- Draft OSP practices, inputs, and monitoring.
- Document OSP recordkeeping and prevention procedures.

Farmers may adjust target dates, desired start dates, due dates, priorities, assignments, and task statuses for certification goals and tasks.

Certification may open a certification work board for the certification goal tree, but the farmer-facing Organic Certification area remains standalone. Certification boards use the same linked farm-event evidence layer rather than creating a separate evidence inbox.

Certification template tasks should be specific action items with expected evidence in the task notes. They should cover recordkeeping/audit trail setup, land transition and buffers, input approval/source documentation, input application evidence, seed commercial availability, seedling and planting-stock status, soil fertility, hot compost and cold/unfinished compost review, raw manure intervals, pest hierarchy, lot traceability, handling and storage commingling prevention, sale claim wording, mass-balance review, and Organic System Plan sections. Evidence review, package preview, package warnings, and report package export are handled by dedicated Organic Certification workflows rather than seeded standing checklist goals. Template tasks remain editable local planning tasks and must not become automatic compliance scoring or certifier-submission workflow.

The former `Prepare inspection evidence` and `Generate certification or renewal package` certification subgoals were transitional planning aids. Dedicated evidence-review and package-generation workflows now own that work, so those two seeded subgoals and their template-owned tasks are removed from the planning template rather than duplicated as both system workflow and manual checklist work. Evidence gaps that need farmer action may still create farmer-editable follow-up tasks, but the standing evidence/package checklist stays out of seeded goals.

## Non-Goals

This planning work does not add:

- server sync;
- authentication;
- worker accounts;
- calendar integration;
- push notifications;
- background reminders;
- payroll or labor tracking;
- automatic AI task creation;
- compliance scoring;
- certifier submission;
- drag-and-drop desktop project management.

## Completion Standard

The planning foundation is complete when:

- goals can have child goals;
- tasks can be created, edited, statused, and associated with goals;
- tasks can include desired start dates, target completion dates, optional farmhand assignments, and optional local audio/photo instructions;
- tasks/goals can link to local farm notes and organic records;
- default farm work boards exist for highest-level goals and non-goal tasks;
- task cards can update status and start linked farm-event capture;
- recovery export includes planning data;
- Organic Certification creates and displays certification-specific goals/subgoals/tasks while remaining a standalone feature;
- tests cover hierarchy, task editing, instruction media, certification templates, export, and local-only boundaries.
