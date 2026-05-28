# Context Pack: Mobile Field Capture

- Pack name: `mobile-field-capture`
- Status: active
- Last reviewed: 2026-05-28
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents work on user-facing mobile workflows involving activity entry, field conditions, capture initiation, offline-state communication, manual alternatives, and usability.

## Use When

- Manual activity entry.
- Mobile field UI.
- Location/item selection.
- Offline state display.
- Voice/photo capture entry points.
- Confirmation screens.
- Practical usability validation.

## Do Not Use When

- Pure server persistence or deployment work has no user-facing behavior.
- Broad AI model selection is unconnected to mobile interaction.
- The task is only documentation navigation.

## Core Guidance

- Interactions occur during real farm work with limited attention, poor connectivity, glare, gloves, dirt, wet hands, noise, and physical movement.
- Frequent workflows must be fast and understandable.
- Farmer language governs user-facing concepts.
- Offline, saved, sync, publication, and attention status must be distinguishable.
- Assisted capture must have manual alternatives.
- This pack does not authorize a mobile framework or final UI system.

## Non-Negotiable Constraints

- [ADR-0001](../../adr/ADR-0001-offline-first-field-operation.md): field recording must not depend on live connectivity.
- [ADR-0003](../../adr/ADR-0003-ai-interpretations-require-confirmation.md): assisted capture requires review/confirmation.
- [ADR-0004](../../adr/ADR-0004-private-by-default-intentional-sharing.md): private/shared state must be understandable.

## Decisions Still Deferred

Mobile framework, UI toolkit, visual design system, exact screen flows, offline AI requirement, and accessibility tooling remain deferred.

## Explicit Non-Goals / Overreach to Avoid

Do not build office-first workflows, make voice/camera the only path, hide pending states, or use technical sync/deployment jargon as ordinary farmer language.

## Canonical Source Documents and ADRs

- `docs/product/field-workflows.md`: representative field workflows.
- `docs/product/initial-vertical-slice.md`: included first-slice capabilities.
- `docs/architecture/offline-first-mobile-architecture.md`: mobile local-retention responsibilities.
- `docs/domain/glossary.md`: farmer-facing terminology.
- `docs/architecture/ai-assisted-capture-boundaries.md`: assisted capture flow where relevant.

## Required Standards

- `docs/standards/accessibility-and-field-usability-standards.md`
- `docs/standards/naming-and-domain-language-standards.md`
- `docs/standards/testing-and-verification-standards.md`
- `docs/standards/change-impact-matrix.md`

## Required Documentation Impact Review

Review product workflows, domain terminology, offline architecture, AI docs, and privacy docs if UI behavior changes workflow meaning, confirmation, status, or visibility.

## Required Verification Impact Review

Future implementation must verify mobile workflow usability, offline status clarity, manual alternatives, accessibility basics, and interruption/failure recovery.

## Prompt Assembly Notes

Common companions: `product-and-domain` for workflow meaning, `offline-sync` for state changes, `ai-assisted-recording` for voice/photo, and `testing-and-diagnostics` for verification.
