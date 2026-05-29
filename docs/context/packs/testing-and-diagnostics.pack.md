# Context Pack: Testing and Diagnostics

- Pack name: `testing-and-diagnostics`
- Status: active
- Last reviewed: 2026-05-28
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents work on defects, regression fixes, tests, verification strategy, logs, diagnostics, observability, failure-state clarity, recovery validation, and incident-oriented debugging.

## Use When

- Adding or updating tests.
- Fixing bugs.
- Debugging failures.
- Adding logs, metrics, traces, or diagnostics.
- Handling sync failures.
- Migration/recovery work.
- Privacy/security incident prevention.
- Operational readiness review.

## Do Not Use When

- A task is purely editorial and has no behavior, verification, or diagnostics impact.
- A task is only dependency evaluation with no test/logging implications.

## Core Guidance

- Protect farmer-relevant behavior and accepted ADR invariants, not vanity coverage.
- Add regression tests for meaningful defects when practical.
- High-risk scenarios include mobile local retention, local saved-state clarity, export/backup failure, app update/replacement data loss, duplicate future sync effects, privacy exposure, AI auto-confirmation, publication state, attachment leakage, restore/migration failure, and sensitive diagnostics.
- Diagnostics must be structured and privacy-safe.
- User-visible status is required where farmers need to know whether pilot work is saved locally, exported/backed up, synchronized later, published later, or failed.
- Do not expose sensitive payloads in logs, fixtures, screenshots, or debugging artifacts.

## Non-Negotiable Constraints

- [ADR-0001](../../adr/ADR-0001-offline-first-field-operation.md): verify offline field operation.
- [ADR-0002](../../adr/ADR-0002-history-preserving-idempotent-synchronization.md): verify idempotency/history/discrepancy behavior.
- [ADR-0003](../../adr/ADR-0003-ai-interpretations-require-confirmation.md): verify draft-before-confirmation.
- [ADR-0004](../../adr/ADR-0004-private-by-default-intentional-sharing.md): verify privacy and intentional sharing.
- [ADR-0005](../../adr/ADR-0005-data-portability-and-recoverability.md): verify recovery/export behavior when implemented.

## Decisions Still Deferred

Test framework, CI platform, coverage tooling, browser/mobile automation, logging library, metrics/tracing stack, alerting system, and redaction implementation remain deferred.

## Explicit Non-Goals / Overreach to Avoid

Do not add tooling or CI in a docs-only task. Do not log full farm records, source captures, transcripts, credentials, exact sensitive quantities, or backup contents.

## Canonical Source Documents and ADRs

- `docs/standards/testing-and-verification-standards.md`: verification categories and scenarios.
- `docs/standards/logging-and-diagnostics-standards.md`: diagnostic categories and redaction.
- `docs/standards/security-and-privacy-engineering-standards.md`: sensitive-data handling.
- `docs/standards/change-impact-matrix.md`: required impact routing.
- Affected product/domain/architecture/operations docs for the behavior under test.

## Required Standards

- `docs/standards/testing-and-verification-standards.md`
- `docs/standards/logging-and-diagnostics-standards.md`
- `docs/standards/security-and-privacy-engineering-standards.md`
- `docs/standards/accessibility-and-field-usability-standards.md` where UI is involved.

## Required Documentation Impact Review

Review canonical docs and packs for the affected feature when a defect reveals wrong documented behavior, missing verification requirements, or diagnostics that change user/operator expectations.

## Required Verification Impact Review

Future implementation must add appropriate domain, use-case, sync, privacy, AI boundary, mobile workflow, operations, redaction, or migration tests depending on the defect/change.

## Prompt Assembly Notes

This pack is usually paired with the pack governing the feature being tested or debugged rather than loaded alone.
