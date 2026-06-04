# Farmhand Management Domain Rules

- Status: accepted
- Last reviewed: 2026-06-03
- Canonical for: farmhand directory, schedules, and task-assignment domain behavior
- Related ADRs: [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0015](../adr/ADR-0015-local-farm-planning-foundation.md)
- Related docs: [Farmhand Management](../product/farmhand-management.md), [Farm Planning Domain Rules](farm-planning-rules.md), [Privacy, Visibility, and Sharing Rules](privacy-visibility-and-sharing-rules.md)
- Related tests: `apps/mobile/src/application/use-cases/farmhandUseCases.test.ts`, `apps/mobile/src/infrastructure/sqlite/migrations/harvestMigration.test.ts`
- Supersedes: none

## Core Terms

| Term | Meaning |
| --- | --- |
| Farmhand | A person locally recorded as helping with farm work. |
| Farmhand contact | Private local contact information for a farmhand, starting with phone number. |
| Farmhand schedule | A local work-availability or planned-work-time record for a farmhand. |
| Recurring weekly schedule | A repeating weekly pattern such as Monday and Wednesday mornings. |
| Week-by-week schedule | A schedule block saved for a specific calendar week. |
| Farmhand assignment | A local relationship from a planning task to one farmhand. |
| Farmhand work board | A filtered task-board view showing tasks assigned to one farmhand. |

## Farmhand Rules

- Farmhands belong to one local farm.
- A farmhand must have a name.
- A phone number is optional but, when present, is private personal contact data.
- A farmhand may be active or inactive.
- Inactive farmhands remain resolvable for existing schedules and task assignments.
- Deleting farmhand history should not be the default first workflow because existing task and schedule context may depend on the farmhand.

## Phone Rules

- The app may provide a call action that asks the operating system to open the default phone app.
- The app must not silently call, text, upload, publish, or create external contact records.
- Phone number display and call-link formatting should avoid leaking numbers in logs or diagnostics.

## Schedule Rules

- Farmhand schedules are local planning context.
- A schedule does not prove work happened.
- A schedule does not calculate pay, attendance, overtime, or compliance records.
- Recurring weekly schedules may have an effective start date and optional end date.
- Week-by-week schedule blocks apply to a specific calendar date.
- Mobile schedule entry may let a farmer create several recurring or week-specific schedule rows at once. Each saved row remains a normal local schedule block.
- The mobile UI should present one current schedule per farmhand. Saving a recurring schedule replaces existing recurring and week-by-week schedule rows for that farmhand; saving a week-by-week schedule does the same.
- Existing rows can still be retained in recovery exports until replaced, but current schedule display should use the most recent coherent schedule set and should not ask the farmer to edit individual days as separate records.
- The configured week start is a farm-level date preference surfaced in farm setup and should govern app date pickers, day order, and Week Of calculations.
- Week-by-week entry may use a `Week Of` date plus selected weekdays; the saved block date is the computed calendar date for each selected day in that configured work week.
- The current mobile workflow should prevent overlapping current schedules for the same farmhand by replacing the farmhand's prior schedule when a new schedule is saved.

## Task Assignment Rules

- A planning task may be assigned to one farmhand.
- Assignment is planning intent, not authorization.
- Assignment does not create an account, login, notification, message, or completed operational record.
- Completing an assigned task means the task status changed; it does not prove labor occurred.
- Farm events linked from assigned tasks remain normal local farm events.

## Privacy Rule

Farmhand data is private farm operational and personal data. It may reveal worker identity, phone numbers, availability, schedules, staffing gaps, and future farm operations. It must remain local/private unless intentionally exported by the farmer through the recovery-copy flow.

## Future Companion-App Rule

A future farmhand app or farmhand mode must not be treated as authorized by local farmhand records alone. It requires later decisions for identity, farm membership, permissions, synchronization, device access, and worker-visible data minimization.
