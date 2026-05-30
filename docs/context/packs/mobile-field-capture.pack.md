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
- Mobile Pilot 1 has an implemented manual foundation for harvest, material use, and inventory count plus export/backup usability.
- ADR-0012 accepts the next farmer-shareable pilot direction: quick local voice memo and optional photo farm-event capture.
- Phase 1 setup/reference screens exist under `apps/mobile`; Phase 2 adds manual harvest entry; Phase 3 adds manual material use, inventory count, unified local activity history/detail, and expanded recovery-copy export.
- The implemented manual record screens cover exactly `HarvestRecorded`, `MaterialUseRecorded`, and `InventoryCountRecorded`.
- The next capture screens should emphasize one primary `Record farm note` action, local save, optional light context, and later timeline review.
- Record forms should present farm-place paths such as `Field 1 > Bed 1` when nested places exist, avoiding generic or technical location wording.
- Future mobile screens should reuse the established earthy theme tokens and small UI component foundation.
- ADR-0008 accepts Expo, React Native, TypeScript, development builds, and EAS/internal distribution for Mobile Pilot 1.
- AI transcription, photo-count inference, or structured interpretation of captures remains later scope and must not be pulled into the local capture implementation.
- Local saved state and local history must be understandable in the standalone pilot.
- Export/backup usability is part of pilot data trust before meaningful reliance.
- Sync, publication, and attention states apply later only when server-connected scope is authorized.
- Manual entry and constrained AI draft experiments must have manual alternatives.
- Real farmer pilot testing should guide expansion.
- This pack does not authorize UI implementation beyond accepted Mobile Pilot 1 scope or select a final visual design system.

## Non-Negotiable Constraints

- [ADR-0001](../../adr/ADR-0001-offline-first-field-operation.md): field recording must not depend on live connectivity.
- [ADR-0003](../../adr/ADR-0003-ai-interpretations-require-confirmation.md): assisted capture requires review/confirmation.
- [ADR-0004](../../adr/ADR-0004-private-by-default-intentional-sharing.md): private/shared state must be understandable.

## Decisions Still Deferred

UI toolkit beyond the current small in-app component foundation, offline AI requirement, and accessibility tooling remain deferred. ADR-0008 selects the Mobile Pilot 1 framework only.

## Explicit Non-Goals / Overreach to Avoid

Do not build office-first workflows, make voice/camera the only path, hide pending states, or use technical sync/deployment jargon as ordinary farmer language.

## Canonical Source Documents and ADRs

- `docs/product/field-workflows.md`: representative field workflows.
- `docs/product/initial-vertical-slice.md`: included first-slice capabilities.
- `docs/product/mobile-pilot-1-implementation-scope.md`: exact current Pilot 1 scope.
- `docs/architecture/offline-first-mobile-architecture.md`: mobile local-retention responsibilities.
- `docs/operations/mobile-pilot-data-safety-requirements.md`: export/backup and update/replacement safety.
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
