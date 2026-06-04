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

Farm work boards are local kanban-style views over existing planning tasks. The app creates a default board for each highest-level goal and a separate board for tasks that do not belong to a goal. The non-goal board may be hidden from the board selector when there are no non-goal tasks to show. A board does not create a second task system, does not copy farm events, and does not add workflow automation. Board columns are the existing task statuses, and moving a card updates the task status. Farmers should not need to create separate boards manually unless a later validated workflow requires it.

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

## Default Farm Work Packs

Farm setup may offer optional starter work packs so farmers do not have to create every common goal and task from scratch. Packs are selected by plain-language farm activities, such as market gardening, greenhouse seedlings, composting, chicken care, irrigation, harvest and wash/pack work, material ordering, and equipment maintenance. Each activity may provide separate administration/planning and farm-work packs so office decisions, records, ordering, and schedules are not mixed into hands-on field, livestock, greenhouse, harvest, and equipment tasks.

Each pack must use a consistent shape:

- stable pack ID;
- pack group of administration/planning work or farm work;
- farmer-facing setup question;
- short and full title;
- description;
- suggested-for tags;
- one or more root goal templates;
- subgoal templates under each root goal;
- concrete task templates under each subgoal;
- stable template keys for every created goal and task.

Pack-created records are ordinary local planning goals and tasks with template metadata. Farmers may edit titles, notes, dates, status, priorities, assignments, and instructions after adding them. Re-adding a pack should not duplicate records or overwrite farmer edits. Pack-created work should appear in Farm Planning and Farm Work Boards through the existing planning foundation and default board generation.

Farm setup should guide pack selection with separate cards for administration/planning packs and farm-work packs. Each pack should have its own add starter pack tasks action so farmers can make one pack decision at a time. Each pack may expose a collapsed outline of goals, subgoals, and tasks with checkboxes so farmers may add the whole pack or only the specific goal/task areas they want to start with. The outline should visually preserve hierarchy with goal, subgoal, and task levels. Selecting an individual task should show its parent subgoal and goal as included without selecting sibling tasks. Clicking a goal or subgoal checkbox should select or clear that whole branch until that branch has been added. Adding a selected task creates the parent goal and subgoal needed to organize that task, but the app should avoid creating empty pack branches when no task in that branch is selected.

Once any part of a starter pack is added, the pack is active by default. Farmers may later deactivate or reactivate the pack from Farm setup. Deactivation hides template-owned pack goals and tasks from Farm Planning and Farm Work Boards without deleting the stored planning rows, linked farm events, completion status, completion notes, or recovery-copy data. This keeps completed task history available for reports and exports while removing inactive pack work from day-to-day planning surfaces.

Once a starter-pack goal, subgoal, or task has been added, the setup outline should show that check as locked rather than allowing the farmer to uncheck and delete the created planning record. Subgoals and tasks that were not originally selected remain available to add later. Added subgoals and tasks may be individually deactivated or reactivated from the outline; deactivation hides that subgoal/task from planning and boards without deleting the underlying planning row or completed-work history. Root-level starter-pack goals do not need their own item-level deactivation control because whole-pack activation controls visibility for the root goal tree.

The first-launch setup flow should remain lightweight but guided: farm details are required, while farm places and starter work packs can be skipped and saved for later. The starter work pack selection interface should be available as the third onboarding step and again from Farm setup.

The initial starter pack activity areas are:

- Market garden administration and planning: crop list, bed/row estimates, seed and transplant needs, seeding calendar, transplant calendar, succession planning, and season notes.
- Market garden farm work: field/bed assignment, bed prep, direct seeding, transplanting, thinning, weeding, and crop-readiness scouting.
- Greenhouse seedling administration and planning: sowing list, greenhouse supply inventory, tray/label planning, and hardening-off windows.
- Greenhouse seedling farm work: tray and bench sanitation, tray filling, sowing, labeling, germination checks, watering, temperature checks, fertility, potting up, culling, hardening off, and transplant staging.
- Compost administration and planning: compost site choice, feedstock estimates, monitoring schedule, and finished-compost use planning.
- Compost farm work: carbon/nitrogen materials, pile building, covering, moisture checks, water adjustments, temperature checks, turning, odor/pest checks, finished-compost review, staging, and application records.
- Chicken care administration and planning: feed planning, egg-count records, bedding and nest supply review, coop deep-clean scheduling, and predator-repair follow-up.
- Chicken care farm work: feed, clean water, waterer cleaning, egg collection, flock health checks, ventilation, bedding, nest boxes, and predator protection.
- Irrigation administration and planning: supply checks, zone maps, schedule targets, and rain/heat adjustment planning.
- Irrigation farm work: line installation, leak testing, repairs, soil-moisture checks, irrigation decisions, run time, irrigation records, rain adjustment, heat/wind stress checks, and season-end removal or winterizing.
- Harvest and wash/pack administration and planning: harvest list, pack plan, label needs, and wash/pack supply review.
- Harvest and wash/pack farm work: handwashing setup, harvest bin/tool cleaning, harvest work, harvest quantity records, produce movement, washing, cooling, packing, labeling, sanitizing tools/totes/surfaces, storage checks, loading, and unsold/cull notes.
- Material ordering administration and planning: seed, potting mix, amendment, packaging, and harvest-supply inventory; order lists; supplier orders; cost notes; and low-stock follow-up.
- Material handling farm work: receiving, labeling, storage, and staging materials for upcoming work.
- Equipment maintenance administration and planning: seasonal maintenance checklists, repair needs, winterizing schedules, and parts orders.
- Equipment maintenance farm work: hand-tool inspection, sharpening, machinery cleaning, tire/fluid checks, greasing, pump checks, greenhouse system checks, wash/pack equipment cleaning, irrigation winterizing, and cover/tarp storage.

Default pack task content should be grounded in common Extension-style farm guidance and validated with farmers over time. The first pack set draws on public Extension guidance for vegetable crop planning, greenhouse transplant care, compost temperature/moisture/turning, small-flock poultry care, irrigation scheduling, produce harvest sanitation, handwashing, wash/pack cleaning, and equipment cleaning.

## Organic Certification Planning

Organic Certification uses the planning foundation while remaining a standalone feature.

Certification planning is visible only when organic certification pursuit/continuation is turned on in Farm setup. When pursuit is off, seeded certification planning records may remain stored locally but should be hidden from Farm Planning and Farm Work Boards.

The certification area should create two highest-level certification goals:

- Complete certification administration work.
- Complete certification farm work.

Certification administration work should include meaningful subgoals for profile setup, recordkeeping and audit trail administration, input approvals and restrictions, Organic System Plan practices/inputs/monitoring, and Organic System Plan recordkeeping/prevention procedures.

Certification farm work should include meaningful subgoals for land and transition status, input applications, seed and planting records, soil fertility and rotations, compost evidence, raw manure intervals, pest/weed/disease/mulch practices, lot traceability, and handling/storage/sales/mass balance.

Farmers may adjust target dates, desired start dates, due dates, priorities, assignments, and task statuses for certification goals and tasks.

Certification may open certification work boards for the administration and farm-work goal trees, but the farmer-facing Organic Certification area remains standalone. Certification boards use the same linked farm-event evidence layer rather than creating a separate evidence inbox.

Certification template tasks should be specific action items with expected evidence in the task notes. Administration tasks may cover review, setup, drafting, and collecting certifier-facing information. Farm-work tasks should be more atomic and assignment-ready: record the specific date, check the specific temperature, turn the pile, attach the label, record the lot code, link the planting event, record the cleaning step, run the mass-balance review, or write the discrepancy explanation. They should cover recordkeeping/audit trail setup, land transition and buffers, input approval/source documentation, input application evidence, seed commercial availability, seedling and planting-stock status, soil fertility, hot compost and cold/unfinished compost review, raw manure intervals, pest hierarchy, lot traceability, handling and storage commingling prevention, sale claim wording, mass-balance review, and Organic System Plan sections. Evidence review, package preview, package warnings, and report package export are handled by dedicated Organic Certification workflows rather than seeded standing checklist goals. Template tasks remain editable local planning tasks and must not become automatic compliance scoring or certifier-submission workflow.

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
