# Context Pack: Documentation and ADR Governance

- Pack name: `documentation-and-adr-governance`
- Status: active
- Last reviewed: 2026-05-28
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents make documentation changes, ADR updates, architecture reviews, context-pack maintenance, technology-decision work, and anti-drift audits.

## Use When

- Writing or modifying canonical docs.
- Creating, updating, superseding, or reviewing ADRs.
- Reviewing architecture drift.
- Selecting previously deferred technology.
- Maintaining packs or routing.
- Preparing major implementation prompts.

## Do Not Use When

- The task is a narrow implementation change with no documentation, decision, or routing impact beyond normal source references.
- The task only needs one functional pack and no governance review.

## Core Guidance

- Accepted ADRs and canonical docs govern.
- Context packs derive from canonical sources.
- Documentation must change when durable behavior changes.
- ADRs record real decisions, not implementation summaries.
- Proposed/deferred decisions must not be implemented as accepted policy silently.
- Architecture docs describe current invariants, not phase history.
- Product documents distinguish evidence from hypotheses.
- Pack changes should be triggered only by canonical changes relevant to repeated task execution.

## Non-Negotiable Constraints

- Do not alter accepted ADR meaning without authorized supersession/update.
- Do not use context packs to create policy.
- Do not convert validation hypotheses or proposed ADRs into accepted implementation authority.

## Decisions Still Deferred

All topics listed as deferred in `docs/adr/decision-readiness-register.md` remain deferred until canonical ADR/product/architecture work changes them.

## Explicit Non-Goals / Overreach to Avoid

Do not create ADR sprawl, duplicate canonical documents inside packs, rewrite product scope to fit implementation convenience, or create implementation plans in a governance-only task.

## Canonical Source Documents and ADRs

- `docs/README.md`: documentation authority and metadata.
- `docs/adr/README.md`: ADR policy and status meanings.
- `docs/adr/decision-readiness-register.md`: accepted/proposed/deferred/excluded classifications.
- `docs/standards/documentation-standards.md`: documentation update rules.
- `docs/standards/ai-agent-development-standards.md`: agent behavior rules.
- `docs/standards/change-impact-matrix.md`: impact and escalation routing.
- Subject-specific canonical docs for the area under review.

## Required Standards

- `docs/standards/documentation-standards.md`
- `docs/standards/ai-agent-development-standards.md`
- `docs/standards/change-impact-matrix.md`

## Required Documentation Impact Review

Review metadata, Related ADRs, README indexes, prompt routing, affected context packs, and canonical source links whenever durable documentation or decision guidance changes.

## Required Verification Impact Review

Documentation-only governance work does not create tests, but it should identify verification categories required by any behavior changes it documents.

## Prompt Assembly Notes

Pair with specialized functional packs for the subject under review. For technology decisions, also load `dependency-and-technology-selection`.
