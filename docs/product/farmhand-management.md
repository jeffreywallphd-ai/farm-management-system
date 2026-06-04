# Farmhand Management

- Status: accepted
- Last reviewed: 2026-06-03
- Canonical for: local farmhand directory, schedule, task assignment, and farmhand work-board product behavior
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0015](../adr/ADR-0015-local-farm-planning-foundation.md)
- Related docs: [Farm Planning and Roadmapping](farm-planning-roadmapping.md), [Farmhand Management Domain Rules](../domain/farmhand-management-rules.md), [Farmhand Management Architecture](../architecture/farmhand-management-architecture.md), [Privacy, Visibility, and Sharing Rules](../domain/privacy-visibility-and-sharing-rules.md)
- Related tests: `apps/mobile/src/application/use-cases/farmhandUseCases.test.ts`, `apps/mobile/src/ui/components/TimeFieldModel.test.ts`, `apps/mobile/src/ui/navigationMenu.test.ts`, `apps/mobile/src/infrastructure/sqlite/migrations/harvestMigration.test.ts`
- Supersedes: none

## Product Goal

Farmhand management helps a farmer keep local contact information, schedules, and assigned work understandable on the same device used for farm planning and farm-event capture.

The feature is intentionally small and field-oriented:

- simple farmhand directory;
- tap-to-call phone action;
- recurring and week-by-week schedule entry;
- assignment of existing planning tasks to farmhands;
- farmhand-focused task board filtering inside the shared Farm work boards page.

## Product Loop

```text
Add farmhand
-> Add regular or week-by-week schedule
-> Assign planning tasks
-> Review assigned work through Farm work boards by choosing All or a farmhand
-> Record linked farm event when work happens
-> Export recovery copy
```

## Farmhand Directory

The farmhand directory stores private local information about people who help with farm work.

The first supported fields are:

- name;
- phone number;
- optional notes;
- active or inactive status.

Phone numbers are displayed with a large call action. Tapping the call action should ask the operating system to open the default phone app using the device's normal call confirmation behavior. The farm app must not make calls itself, send SMS messages, create contact records, or upload phone numbers.

## Schedules

Farmhand schedules support two farmer-friendly entry styles:

- recurring weekly schedule for regular work patterns;
- week-by-week schedule for farms where staffing changes often.

Schedules are planning context, not payroll or attendance records. They do not prove the person worked, calculate wages, or create completed operational records.

Farm setup lets farmers save whether their work week starts on Sunday or Monday. Date pickers, day selectors, and week-by-week entry should follow that local choice across the app.

Recurring schedule examples:

- Mondays, Wednesdays, and Fridays from 8:00 AM to 2:00 PM;
- Saturdays from 7:00 AM to noon through a date range.

Recurring schedule entry supports:

- same start/end time across several selected weekdays, saved as the farmhand's current recurring schedule;
- different start/end times by weekday, where the farmer adds several day/time rows before saving.

Week-by-week entry follows the same two-mode pattern. Its date field is `Week Of`, represents the configured start date of that work week, and each selected day/time row is saved as part of the farmhand's current week-specific schedule for the computed calendar date.

The first mobile implementation shows one current schedule per farmhand. If a schedule exists, the farmer sees a coherent schedule card ordered by the configured week start and edits the whole recurring or week-by-week schedule from that card. Saving a schedule replaces older schedule rows for that farmhand so the UI does not accumulate conflicting current schedules. Copying a prior week remains a future ergonomic enhancement, not part of the completed local farmhand slice.

## Task Assignment

Farmhand assignments use the accepted planning task foundation. A task may be assigned to one farmhand. The assignment is local planning intent only.

Assigning a task does not:

- notify the farmhand;
- grant access to the farm record;
- create an account;
- create a completed work record;
- publish the task outside the farm.

Farmers may still leave a local responsible-person label on older or informal tasks. Farmhand assignment is the structured local path for future companion-app compatibility.

## Farmhand Work Boards

Farmhand work boards are filtered views over existing planning tasks. They do not copy tasks or create a second task system.

The shared Farm work boards page should show:

- a selector for All work or one farmhand;
- only boards that contain work for the selected farmhand when a farmhand is selected;
- assigned tasks grouped by existing task status;
- one status column at a time on small screens;
- large actions to update status and record a linked farm event.

## Future Companion App Readiness

The data model should be ready for a future farmhand app or farmhand mode, but this feature does not implement that companion experience.

Before farmhands can use their own app or device, the project needs later accepted decisions for:

- identity and authentication;
- farm invitation or membership;
- permissions and access boundaries;
- synchronization;
- device revocation;
- worker-visible data minimization.

## Non-Goals

This feature does not add:

- payroll;
- wage calculations;
- timeclock or attendance records;
- HR compliance records;
- worker accounts;
- farmhand login;
- push notifications;
- SMS or in-product messaging;
- cloud calendar sync;
- automatic task assignment;
- server synchronization;
- companion app implementation.

## Completion Standard

The local farmhand feature is complete when:

- farmhands can be created, edited, listed, and marked inactive;
- phone numbers can open the device phone app through an explicit call action;
- recurring and week-by-week schedules can be saved in same-time and different-time batch entry modes, then reviewed and edited as one current schedule per farmhand;
- planning tasks can be assigned to farmhands;
- task boards can be viewed from All work or a selected farmhand's perspective on the shared Farm work boards page;
- recovery export includes farmhand, schedule, and task-assignment data;
- tests cover validation, local persistence, task assignment, schedule projection, board filtering, export, and local-only privacy boundaries.

## Current Mobile Implementation

The Expo mobile app exposes farmhand management at `/farmhands`. The screen includes local farmhand creation/editing, phone call handoff through the device dialer, and per-farmhand schedule panels opened from each Farmhand directory item. Each panel shows only the selected farmhand's current schedule; the schedule form appears only when no schedule exists or when the farmer taps `Edit schedule`. Recurring and week-specific schedule entry/editing appears inside the selected farmhand's bounding box instead of as page-level schedule cards. Schedule time fields use AM/PM picker controls for entry while preserving the existing local `HH:MM` schedule value in storage. Farm setup owns schedule week-start setup. The shared Farm work boards route exposes the farmhand selector and filters boards/tasks for All work or a selected farmhand.

Planning task forms include an `Assigned farmhand` selector while preserving the older responsible-person note as informal local text. Recovery-copy export includes farmhand directory records, recurring schedules, week-specific schedule blocks, and assigned-farmhand task references.
