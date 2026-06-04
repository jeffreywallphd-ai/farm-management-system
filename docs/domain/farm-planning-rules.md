# Farm Planning Domain Rules

- Status: accepted
- Last reviewed: 2026-06-04
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
| Planning task | A concrete work item that can be planned, statused, and later assigned. |
| Farm work board | A local kanban-style view over planning tasks for a highest-level goal tree or for non-goal tasks. |
| Farm work pack | An optional starter template selected in Farm setup that creates ordinary local planning goals and tasks for a common farm-work area. |
| Assigned farmhand | An optional local reference from a task to a farmhand record. It is not an authenticated account or permission. |
| Desired start date | An optional farmer-entered date indicating when work should ideally begin. It is not a calendar appointment or reminder. |
| Planning link | A local relationship from a goal or task to another local record such as a farm note, farm place, crop, organic record, or report. |
| Planning place | An optional local farm-place reference on a goal or task. It helps scope planned work without adding maps, GIS, or scheduling automation. |
| Task instructions | Optional local audio/photo attachments that describe how to do a task. They are private task context, not completed-work evidence. |

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
- Tasks may be associated with a goal or may stand alone.
- Tasks may reference a local farm place. When a task belongs to a goal with a place, the task place should stay within the goal place or embedded child places.
- Task status is one of `notStarted`, `inProgress`, `blocked`, `done`, or `canceled`.
- Task priority is one of `low`, `normal`, `high`, or `urgent`.
- A task may have an optional desired start date and an optional target completion date.
- A task may have an optional assigned farmhand reference. Assignment must not imply accounts, authentication, payroll, notification delivery, or access control.
- A task may include optional recorded instructions and instruction photos. These attachments help explain planned work; evidence of completed work should remain a normal linked farm event.

## Board Rules

- Boards belong to one local farm.
- The app may create default boards for highest-level goals and for non-goal tasks.
- A goal board includes tasks attached to the board's goal or any child goal inside that goal tree.
- A non-goal board includes tasks with no goal.
- The board selector may hide the non-goal board when there are no non-goal tasks to display.
- Board columns are task statuses. Moving a card updates the task status; it does not create an operational record.
- Board views may group multiple statuses for scanning, such as all incomplete work or all workable tasks, without creating new stored statuses.
- Work-in-progress limits are farmer guidance only. They warn about crowded active columns but do not block saving or moving tasks.
- Recording a farm event from a board task creates a normal local voice/photo farm event and a planning link to that task.
- Farm events linked to a task may be displayed on the board as collapsed event cards with their normal farm-note details and media.
- Boards must not copy farm-note media or become a separate certification evidence inbox.

## Default Farm Work Pack Rules

- Farm work packs are optional. A farmer chooses which packs match what the farm does.
- Farm setup owns the guided pack-selection workflow.
- Packs belong to either administration/planning work or farm work so records, ordering, schedules, and decisions stay distinct from hands-on farm tasks.
- A pack must create ordinary planning goals and tasks, not completed operational records.
- Pack-created records must use stable template keys and a planning source that distinguishes them from farmer-created records.
- Each pack should provide its own add starter pack tasks action in Farm setup.
- Farmers may add selected tasks from a pack rather than the full pack. The app may create parent goals and subgoals needed for selected tasks, but should not create empty pack branches.
- Added pack goals, subgoals, and tasks should be treated as created planning records, not reversible checkbox drafts. The setup UI may show their checks as locked.
- Subgoals and tasks that were not added remain addable later.
- Re-adding a pack must not create duplicate template-owned goals or tasks.
- Re-adding a pack should preserve farmer edits to already-created template records.
- Pack-created records are active by default when added.
- Farmers may deactivate or reactivate an added pack from Farm setup.
- Deactivation hides template-owned pack goals and tasks from Farm Planning and Farm Work Boards without deleting the records.
- Farmers may deactivate or reactivate added starter-pack subgoals and tasks individually. Root goal visibility is controlled by the whole-pack activation state.
- Deactivated pack records, including done tasks, completion notes, linked farm events, and setup state, remain available for reporting and recovery export.
- Packs must not add sync, notifications, cloud calendars, accounts, payroll, automatic AI task generation, or a workflow engine.

## Organic Certification Rules

- Organic certification planning tasks use the shared planning foundation.
- Organic Certification must still present a standalone certification experience.
- Certification task status is readiness/work status, not a compliance finding.
- Seeded organic certification planning may use separate highest-level goals for certification administration work and certification farm work. These roots create ordinary planning goal trees and default boards rather than a separate certification task system.
- Seeded certification tasks may include expected-evidence guidance in notes so farmers can see the concrete records, farm-note links, labels, logs, reports, or certifier instructions to gather.
- Farm-work certification tasks should be split into direct actions when the work is operationally distinct, such as separate temperature checks, compost turns, lot-code assignment, cleaning records, and mass-balance discrepancy explanations.
- Seeded certification subgoals should stay small enough that a farmer can understand the record set to gather. Broad regulatory areas may be split into separate planning subgoals when approvals, applications, compost logs, manure intervals, traceability, handling, mass-balance, OSP narratives, or prevention procedures need different evidence.
- Template-owned certification goals are removed when a dedicated organic workflow takes over that work, such as evidence review or package generation. Farmer-created follow-up tasks may remain normal planning tasks.
- Farm notes remain the source evidence layer. Planning tasks may link to notes, and organic evidence links may give notes certification meaning.

## Privacy Rule

Planning data is private farm operational planning data. It can reveal future production plans, certification gaps, staffing needs, and operational priorities. It must remain local/private unless intentionally exported.
