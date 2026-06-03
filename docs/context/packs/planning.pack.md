# Context Pack: Farm Planning

- Pack name: `planning`
- Status: active
- Last reviewed: 2026-06-02
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents implement local farm planning, goals, subgoals, planning periods, tasks, and organic-certification planning without introducing server-connected project management.

## Use When

- Adding or changing planning goals, subgoals, planning periods, tasks, or planning links.
- Retrofitting organic certification checklist/planning behavior onto the shared planning foundation.
- Adding planning recovery export or planning reports.
- Changing the Planning screen mode flow or review/create scoping.

## Core Guidance

- ADR-0015 accepts a local planning foundation.
- Goals may have child goals.
- Goals and tasks may reference local farm places; task place choices should be scoped to a goal's place and embedded places when the goal has a place.
- Planning periods are farmer-selected time boxes.
- Tasks are future/current work, not completed operational records.
- Farm work boards are local kanban-style views over planning tasks, with default boards for highest-level goal trees and non-goal tasks.
- Board columns are existing task statuses; moving a card updates task status and does not create a completed farm record.
- Farm events linked from task cards remain normal voice/photo farm events and certification evidence source captures.
- `responsiblePerson` is local text only, not an account or permission.
- Organic Certification should use planning records while remaining a standalone certification feature.
- The generic Planning screen should offer Create a goal with tasks, Create a single task, and Review planned work as the primary choices.
- Goal-with-tasks mode should stay focused on one highest-level goal tree; single-task mode should show only a task form; review mode should list goals and non-goal tasks without forms.
- Do not add cloud calendars, notifications, auth, multi-device assignment, sync, analytics, automatic AI task generation, desktop drag/drop assumptions, or a generic workflow engine.

## Canonical Source Documents and ADRs

- `docs/adr/ADR-0015-local-farm-planning-foundation.md`
- `docs/product/farm-planning-roadmapping.md`
- `docs/domain/farm-planning-rules.md`
- `docs/architecture/planning-architecture.md`
- `docs/product/organic-certification-readiness.md`
- `docs/domain/organic-certification-rules.md`
- `docs/architecture/organic-certification-architecture.md`

## Required Verification

- Goal hierarchy and cycle prevention.
- Period selection.
- Task creation/edit/status changes.
- Default planning board generation and board task filtering.
- Recovery export.
- Certification template creation without duplicate records.
- Planning screen scoping for focused goal trees, non-goal tasks, and selector options.
- Local-only/privacy boundary checks.
