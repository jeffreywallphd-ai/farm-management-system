# Context Pack: Farm Planning

- Pack name: `planning`
- Status: active
- Last reviewed: 2026-06-04
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents implement local farm planning, goals, subgoals, assignment-ready tasks, and organic-certification planning without introducing server-connected project management.

## Use When

- Adding or changing planning goals, subgoals, tasks, or planning links.
- Retrofitting organic certification checklist/planning behavior onto the shared planning foundation.
- Adding planning recovery export or planning reports.
- Changing the Planning screen mode flow or review/create scoping.

## Core Guidance

- ADR-0015 accepts a local planning foundation.
- Goals may have child goals.
- Goals and tasks may reference local farm places; task place choices should be scoped to a goal's place and embedded places when the goal has a place.
- Tasks are future/current work, not completed operational records.
- Tasks may have desired start dates, target completion dates, optional farmhand assignment, and optional local instruction audio/photos.
- Farm work boards are local kanban-style views over planning tasks, with default boards for highest-level goal trees and non-goal tasks.
- Default boards should be enough for the current mobile workflow; do not expose separate manual board creation unless later product validation adds that need.
- Board columns are existing task statuses; moving a card updates task status and does not create a completed farm record.
- Board views may group statuses for mobile scanning, but grouped views are UI filters rather than stored task statuses.
- Board task cards should stay collapsed by default, include current status in the title, and show linked farm events as collapsed cards inside the open task.
- Farm events linked from task cards should be captured inline from the board and remain normal voice/photo farm events and certification evidence source captures.
- Farmhand management may add local private farmhand records and structured task assignment, but it must remain a local planning extension rather than accounts, auth, payroll, messaging, or sync.
- Farmhand schedules may be batch-entered from same-time multi-day or different-time day/time rows inside the selected farmhand's directory item, but storage remains ordinary local schedule records.
- The farmhand screen should show one current schedule card per farmhand; saving a whole recurring or week-by-week schedule replaces older schedule rows for that farmhand instead of accumulating conflicting schedules.
- Farm setup owns the week-start preference. Calendar pickers, schedule day order, and Week Of calculations should use that shared local preference.
- Farmhand task-board views belong in the shared Farm work boards screen as All/farmhand filtering over planning tasks; do not create a separate farmhand task-board system.
- Organic Certification should use planning records while remaining a standalone certification feature.
- Organic certification template subgoals should be split when approvals, applications, compost logs, manure intervals, traceability, handling, mass-balance, OSP narratives, or prevention procedures need different evidence.
- Remove template-owned certification goals when dedicated organic workflows replace them; evidence review and package generation should not remain as duplicate standing manual goals. The certification template no longer seeds the former evidence-prep or package-generation goals.
- The generic Planning screen should offer Create a goal with tasks, Create a single task, and Review planned work as the primary choices.
- Goal-with-tasks mode should stay focused on one highest-level goal tree; single-task mode should show only a task form; review mode should list goals and non-goal tasks without forms by default.
- Editing a goal from review mode should expose the focused goal tree so the selected goal, subgoals, and associated tasks can be edited inline near the relevant item.
- Do not add cloud calendars, notifications, auth, multi-device assignment, sync, analytics, automatic AI task generation, desktop drag/drop assumptions, or a generic workflow engine.

## Canonical Source Documents and ADRs

- `docs/adr/ADR-0015-local-farm-planning-foundation.md`
- `docs/product/farm-planning-roadmapping.md`
- `docs/domain/farm-planning-rules.md`
- `docs/architecture/planning-architecture.md`
- `docs/product/farmhand-management.md`
- `docs/domain/farmhand-management-rules.md`
- `docs/architecture/farmhand-management-architecture.md`
- `docs/product/organic-certification-readiness.md`
- `docs/domain/organic-certification-rules.md`
- `docs/architecture/organic-certification-architecture.md`

## Required Verification

- Goal hierarchy and cycle prevention.
- Desired start date, target completion date, and instruction media persistence.
- Task creation/edit/status changes.
- Default planning board generation and board task filtering.
- Grouped board filters and collapsed task/event cards.
- Board task cards showing description, farm place, and target completion date.
- Recovery export.
- Certification template creation without duplicate records.
- Planning screen scoping for focused goal trees, non-goal tasks, and selector options.
- Local-only/privacy boundary checks.
