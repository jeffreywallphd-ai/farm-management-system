# ADR-0014: Organic Certification Readiness Module

- Status: accepted
- Date: 2026-06-02
- Last reviewed: 2026-06-02
- Deciders: product owner
- Canonical for: adding a local USDA organic certification readiness module without certifier-replacement claims
- Related docs: [Product Vision and Scope](../product/product-vision-and-scope.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Organic Certification Readiness](../product/organic-certification-readiness.md), [Organic Certification Domain Rules](../domain/organic-certification-rules.md), [Organic Certification Architecture](../architecture/organic-certification-architecture.md), [Mobile Pilot 1 Implementation Scope](../product/mobile-pilot-1-implementation-scope.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md)
- Supersedes: none
- Superseded by: none

## Context

The product roadmap now explicitly authorizes a complete USDA organic certification readiness toolset. Earlier product documents excluded regulatory/compliance reporting from the standalone mobile pilot, so this decision records the scope change before implementation.

The module must support U.S. National Organic Program readiness, evidence organization, local records, and inspection-oriented reports. It must not claim to certify a farm, replace an accredited certifier, provide legal advice, submit records to USDA or a certifier, or make final compliance determinations.

The relevant Phase 1 official anchors are:

- 7 CFR Part 205 is the USDA organic regulatory framework.
- 7 CFR 205.103 requires certified operations to keep auditable, traceable records for at least five years.
- 7 CFR 205.101 describes exempt operations and recordkeeping obligations for those exemptions.
- 7 CFR 205.201 requires an Organic System Plan for non-exempt operations intending to represent products as organic and identifies required plan content.
- USDA AMS describes the Organic System Plan as central to certification, submitted to an accredited certifier, and updated yearly.

## Decision

Build an Organic Certification Readiness module as a local, offline-first evidence and reporting layer over the existing farm app.

The module will:

- Store organic certification readiness data locally in SQLite behind repository/use-case boundaries.
- Reuse existing farm, farm-place, tracked-item, farm-note, attachment, local history, and recovery-copy patterns where appropriate.
- Keep certification readiness records private/device-local unless the farmer intentionally exports a recovery or report package.
- Produce readiness reports and export data for farmer/certifier preparation.
- Clearly state that reports help organize records for certifier review and do not replace certification or legal determinations.
- Add strict phase-by-phase implementation, with Phase 1 limited to organic operation profile, certification scopes, dashboard/status display, and a basic Organic Profile Report.

The module will not:

- Add cloud sync, authentication, server APIs, certifier submission, analytics, background upload, or public sharing.
- Automatically create organic compliance records from AI, voice, or photos without user confirmation.
- Treat generated readiness status as a legal or certifier decision.
- Implement later organic phases before their relevant canonical docs and tests are updated.

## Rationale

USDA organic certification work is record-heavy and field-evidence-heavy. The existing app direction already emphasizes quick local capture, farm places, voice/photo notes, local storage, and farmer-controlled export. A local readiness layer fits that direction while avoiding premature server/certifier integration.

Phase-by-phase implementation reduces risk because later phases, such as inputs, seeds, manure, pest hierarchy, traceability, OSP generation, and full export packages, have distinct regulatory requirements and should be verified against official sources before coding.

## Alternatives Considered

### Alternative: Keep compliance out of scope

- Benefits: Preserves the earlier narrow pilot boundary.
- Drawbacks: Conflicts with the newly supplied roadmap and misses a high-value recordkeeping use case for organic and transitioning farms.
- Reason not selected: The product owner explicitly authorized the complete organic certification roadmap.

### Alternative: Build certifier submission or compliance determination

- Benefits: Could seem more complete to users.
- Drawbacks: Requires legal, certifier, identity, integration, and liability decisions that are not accepted; conflicts with local-first privacy and no-server constraints.
- Reason not selected: The app should organize evidence and reports, not replace certifiers or make legal determinations.

## Consequences

### Positive

- Organic readiness becomes an accepted product area.
- Local records and reports can support inspection preparation without server infrastructure.
- Organic features can reuse existing offline/mobile/export architecture.

### Negative / Tradeoffs

- Documentation and tests must expand substantially as each phase is implemented.
- The app must use careful wording to avoid overclaiming compliance.
- Later phases will add more data model and migration surface area.

### Risks and Mitigations

- Risk: Regulatory drift or inaccurate interpretation.
  Mitigation: Use official USDA/eCFR sources for each phase and cite reviewed requirements in canonical docs.
- Risk: User mistakes readiness reports for certification.
  Mitigation: Keep visible non-replacement language in setup, dashboard, and reports.
- Risk: Organic evidence becomes sensitive operational data.
  Mitigation: Preserve local/private defaults and export-only sharing.

## Validation and Revisit Conditions

Revisit if:

- The app needs direct certifier submission, cloud backup, multi-device access, or hosted reporting.
- USDA/NOP rules materially change the records or scope categories implemented.
- Farmer testing shows that organic readiness should be separated from the general farm-note workflow.

## Documentation and Test Impact

This decision requires:

- New product, domain, architecture, and context documentation for organic certification readiness.
- Updates to product-scope documents that previously excluded compliance reporting.
- Phase-specific tests for local persistence, validation, dashboard visibility, reports, export inclusion, and no-certifier-replacement language.
