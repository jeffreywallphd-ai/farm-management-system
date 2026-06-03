# Farm Planning Domain Rules

- Status: accepted
- Last reviewed: 2026-06-02
- Canonical for: local planning domain vocabulary and behavior
- Related ADRs: [ADR-0015](../adr/ADR-0015-local-farm-planning-foundation.md)
- Related docs: [Farm Planning and Roadmapping](../product/farm-planning-roadmapping.md), [Planning Architecture](../architecture/planning-architecture.md), [Organic Certification Domain Rules](organic-certification-rules.md)
- Related tests: `apps/mobile/src/application/use-cases/planningUseCases.test.ts`
- Supersedes: none

## Core Terms

| Term | Meaning |
| --- | --- |
| Planning goal | A farmer-entered future outcome or roadmap item. |
| Subgoal | A planning goal with a parent goal. Subgoals chunk large goals into meaningful smaller outcomes. |
| Planning period | A selected time box for organizing work, such as day, week, two weeks, month, season, year, or custom. |
| Planning task | A concrete work item that can be planned, statused, and later assigned. |
| Farm work board | A local kanban-style view over planning tasks for a highest-level goal tree or for non-goal tasks. |
| Responsible person | A local text field identifying who may handle a task. It is not an authenticated account or permission. |
| Planning link | A local relationship from a goal or task to another local record such as a farm note, farm place, crop, organic record, or report. |
| Planning place | An optional local farm-place reference on a goal or task. It helps scope planned work without adding maps, GIS, or scheduling automation. |

## Goal Rules

- Goals belong to one local farm.
- Goals may have a parent goal from the same farm.
- A goal must not be its own parent.
- Goal hierarchy must not contain cycles.
- Goal status is planning status, not proof that farm work happened.
- Completing a goal does not automatically complete child goals or tasks unless a later explicit workflow is added.
- A goal may reference a local farm place. Child goal and task place choices may be narrowed to that place and embedded child places.

## Task Rules

- Tasks are future or current work, not historical operational records.
- Task completion means the farmer marked the task done; it does not create a harvest, material use, inventory count, farm note, organic record, or certification determination.
- Tasks may be associated with a goal, a planning period, both, or neither.
- Tasks may reference a local farm place. When a task belongs to a goal with a place, the task place should stay within the goal place or embedded child places.
- Task status is one of `notStarted`, `ready`, `inProgress`, `blocked`, `done`, or `canceled`.
- Task priority is one of `low`, `normal`, `high`, or `urgent`.
- `responsiblePerson` is a farmer-entered label only. It must not imply accounts, authentication, payroll, or access control.

## Board Rules

- Boards belong to one local farm.
- The app may create default boards for highest-level goals and for non-goal tasks.
- A goal board includes tasks attached to the board's goal or any child goal inside that goal tree.
- A non-goal board includes tasks with no goal.
- Board columns are task statuses. Moving a card updates the task status; it does not create an operational record.
- Work-in-progress limits are farmer guidance only. They warn about crowded active columns but do not block saving or moving tasks.
- Recording a farm event from a board task creates a normal local voice/photo farm event and a planning link to that task.
- Boards must not copy farm-note media or become a separate certification evidence inbox.

## Period Rules

- Planning periods are local farmer-selected time boxes.
- Periods may overlap.
- Period assignment is planning intent, not a calendar commitment.
- The app may provide common period types but must allow a custom date range.

## Organic Certification Rules

- Organic certification planning tasks use the shared planning foundation.
- Organic Certification must still present a standalone certification experience.
- Certification task status is readiness/work status, not a compliance finding.
- Farm notes remain the source evidence layer. Planning tasks may link to notes, and organic evidence links may give notes certification meaning.

## Privacy Rule

Planning data is private farm operational planning data. It can reveal future production plans, certification gaps, staffing needs, and operational priorities. It must remain local/private unless intentionally exported.
