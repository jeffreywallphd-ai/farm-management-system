# ADR-0011: Mobile Pilot 1 Runtime Boundary Validation

- Status: accepted
- Date: 2026-05-28
- Last reviewed: 2026-05-28
- Deciders: project owner and contributors
- Canonical for: Mobile Pilot 1 runtime validation at input, persistence, and export/import boundaries
- Related docs: [Mobile Pilot 1 Implementation Scope](../product/mobile-pilot-1-implementation-scope.md), [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md), [Coding Standards](../standards/coding-standards.md), [Testing and Verification Standards](../standards/testing-and-verification-standards.md), [Decision Readiness Register](decision-readiness-register.md)
- Supersedes: none
- Superseded by: none

## Context

Mobile Pilot 1 will use TypeScript, local persistence, and local JSON export. Static typing helps implementation, but farmer-created data, persisted rows, migrations, and exported/imported packages still cross runtime boundaries.

The project needs explicit boundary validation without turning schemas into a competing source of domain authority.

## Decision

Use Zod for runtime validation at input, persistence-boundary, and export/import-boundary edges in Mobile Pilot 1.

TypeScript remains the implementation language, but TypeScript alone is not runtime validation.

Zod schemas must not replace domain documents or become the sole source of operational-record meaning.

Do not create broad validation frameworks beyond Mobile Pilot 1 needs.

## Rationale

Runtime validation protects local record creation and export integrity.

Explicit schemas support later import/restore validation if that capability becomes accepted.

Zod keeps boundary validation close to TypeScript types without adding a larger framework.

Keeping schemas subordinate to canonical domain documents prevents code artifacts from silently redefining record meaning.

## Alternatives Considered

### Alternative: TypeScript Types Only

- Benefits: no runtime dependency.
- Drawbacks: does not validate user input, database rows, export files, or future import data at runtime.
- Reason not selected: Mobile Pilot 1 data safety requires runtime boundary checks.

### Alternative: Custom Validation Utilities

- Benefits: no external dependency and complete control.
- Drawbacks: higher risk of inconsistent ad hoc validation.
- Reason not selected: Zod provides a small, common validation approach suitable for the pilot.

### Alternative: Broad Validation Framework

- Benefits: may offer more features and integrations.
- Drawbacks: unnecessary abstraction and dependency weight for the first pilot.
- Reason not selected: Mobile Pilot 1 needs explicit boundary validation, not a platform-wide validation framework.

## Consequences

### Positive

- Input, persistence, and export boundaries can fail clearly and predictably.
- Future import/restore work can reuse versioned validation concepts.
- Tests can target validation behavior once implementation exists.

### Negative / Tradeoffs

- Zod schemas require maintenance alongside domain and persistence changes.
- Contributors must avoid treating schemas as stronger authority than canonical docs.

### Risks and Mitigations

- Risk: schemas drift from accepted operational-record semantics.
- Mitigation: changes to record meaning must update canonical docs first and then schemas/tests.
- Risk: validation grows into a broad framework prematurely.
- Mitigation: keep Zod use focused on Mobile Pilot 1 boundary validation.

## Validation and Revisit Conditions

Revisit this ADR if Zod proves inadequate for export/import validation, if later tooling requires a different schema strategy, or if validation concerns expand beyond Mobile Pilot 1.

## Documentation and Test Impact

Documentation and context routing must identify Zod as accepted for Mobile Pilot 1 runtime boundary validation only.

Future implementation must test validation failures at input, persistence, and export/import boundaries once those behaviors exist.
