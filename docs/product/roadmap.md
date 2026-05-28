# Product Roadmap

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: product sequencing, conditional future opportunities, and product scope-change rules
- Related ADRs: [Decision Readiness Register](../adr/decision-readiness-register.md)
- Related docs: [Product Vision and Scope](product-vision-and-scope.md), [Initial Vertical Slice](initial-vertical-slice.md), [Field Workflows](field-workflows.md), [User Research and Validation](user-research-and-validation.md), [Deployment and Data-Control Validation Plan](deployment-and-data-control-validation-plan.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This roadmap provides product sequencing only. It is not an implementation task list or a technical architecture document.

## Roadmap Principle

Roadmap order is driven by validated farmer usefulness and trustworthy offline operation, not by building the broadest possible feature set.

## Foundation Stage

The current stage is documentation and validation. It should:

- Establish product, domain, architecture, ADR, standards, and AI-context foundations.
- Interview or observe farmers and workers.
- Test assumptions around record burden, offline constraints, sourcing, voice, and photo counting.
- Test assumptions around hosted, local, cooperative, backup, export, and recovery preferences.
- Keep future implementation aligned to the first vertical slice instead of broad farm-management ambitions.

## Release 1: Offline Farm Activity Recorder

Release 1 should implement the first vertical slice described in [Initial Vertical Slice](initial-vertical-slice.md):

- Basic farm setup for one farm context.
- Basic locations and tracked items.
- Manual recording for a small set of farm activities.
- Recent activity history and understandable synchronization status.
- Offline retention of field work until connectivity permits synchronization.
- Narrow voice-assisted draft experiment.
- Narrow photo-count draft experiment.
- One intentionally shared local-sourcing need workflow.

Release 1 should generate practical feedback for domain modeling, offline/sync architecture, AI-confirmation rules, privacy boundaries, and deployment planning.

## Possible Release 2: Improved Operational Records and Local Needs Coordination

Potential scope, dependent on validation:

- Refined inventory visibility.
- More usable material needs and offers.
- Improved activity history.
- Expanded but still controlled voice workflows.
- Practical worker roles and permissions.
- Basic local communication tied to listings.

These items are not accepted scope until supported by evidence and reflected in updated product documentation.

## Possible Release 3: Broader Farm Operations Support

Potential scope only if evidence supports it:

- Additional crop workflows.
- Equipment maintenance.
- Shared purchase coordination.
- Supplier directory.
- More robust reporting and export.
- Enhanced local or cooperative deployment.

Release 3 should not become a generic farm ERP without a deliberate scope revision.

## Long-Term Possibilities, Not Commitments

Long-term possibilities may include:

- Integrations with other agricultural or market systems.
- Cooperative infrastructure.
- Advanced analytics.
- Additional computer-vision workflows.
- Traceability or compliance support where justified.
- Managed hosting or support services.

These are possibilities rather than accepted scope.

## Scope-Change Rule

Expanding product scope should require:

- Evidence or strong user need.
- Update to product documents.
- Review of affected domain, architecture, privacy, and offline constraints.
- An ADR when the change introduces a durable product-technical decision.
