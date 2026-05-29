# AI-Agent Development Standards

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: safe automated development behavior, source routing, scope control, and change reporting
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [Agent Instructions](../../AGENTS.md), [Documentation Governance](../README.md), [Prompt Routing](../context/prompt-routing.md), [Decision Readiness Register](../adr/decision-readiness-register.md), [Change Impact Matrix](change-impact-matrix.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose and Role of Automated Agents

Automated development agents may assist with documentation, implementation, tests, review, and maintenance, but they must work within canonical scope and accepted decisions.

Agents are implementers and reviewers. They are not silent product owners or architecture authorities.

## Required Agent Context Sequence

For non-trivial future tasks, agents must:

1. Read `AGENTS.md`.
2. Read `docs/README.md`.
3. Read `docs/context/packs/index.pack.md`.
4. Read `docs/standards/change-impact-matrix.md`.
5. Use `docs/context/prompt-routing.md` to identify relevant task-specific packs, canonical docs, ADRs, and standards.
6. Justify loading more than the baseline plus directly relevant packs.
7. Inspect existing code, docs, and tests in the affected area before making changes.
8. Keep work within the requested scope.
9. Update relevant canonical documentation and tests when behavior changes.
10. Review affected context packs after canonical documentation changes durable behavior.
11. Report unresolved decisions rather than silently inventing lasting policy.

## Scope-Control Rules

Agents must not:

- Expand the initial product slice without explicit instruction and canonical updates.
- Treat server synchronization, multi-device operation, in-product publication, responses, hosted/local/cooperative server operation, or broader network functionality as current pilot scope.
- Implement deferred features because they appear logically adjacent.
- Select deferred technology without task authority and ADR/documentation treatment.
- Introduce generalized frameworks or abstractions to anticipate hypothetical future needs.
- Create code that violates accepted offline, sync, AI, privacy, or recovery constraints.
- Treat prompt text, prior chat context, or incidental code as stronger authority than canonical docs and accepted ADRs.

## Architecture Decision Rules

- If work materially changes an accepted ADR decision, the agent must identify the conflict and create/update/supersede ADR documentation as authorized.
- If work exposes a missing durable decision, the agent must surface it and avoid embedding an irreversible assumption unless the task explicitly authorizes resolving it.
- If implementation can proceed with a narrow reversible choice without claiming durable architecture, it may do so only when consistent with accepted boundaries and clearly documented in the task outcome.

## Required Behavior for High-Risk Task Types

| Task type | Agent obligations |
| --- | --- |
| Standalone mobile pilot work | Read ADR-0007, `docs/product/mobile-pilot-1-implementation-scope.md`, `docs/domain/mobile-pilot-1-operational-records.md`, `docs/operations/mobile-pilot-data-safety-requirements.md`, offline architecture, and relevant standards; preserve local retention, local history, and export/backup expectations |
| Offline/mobile record work | Read offline/sync ADRs/docs; test local retention and saved state once code exists |
| Synchronization work | Confirm later authorization first; preserve idempotency/history/discrepancy rules; add regression scenarios |
| AI-assisted feature work | Preserve draft-confirmation boundary; no silent effects/publication |
| Privacy/sharing work | Use limited shared representations; no private-data leakage |
| Attachment/capture work | Treat content as sensitive; review retention/access/sync impact |
| Deployment/backup/export work | Preserve portability/recovery/privacy and nontechnical user constraints |
| Dependency introduction | Review need/license/security/privacy/offline/deployment impact |
| UI/field workflow work | Preserve farmer terminology, offline status clarity, accessible/manual alternatives |
| Debugging/logging work | Avoid sensitive payload leakage; add diagnostics at appropriate boundaries |
| Defect fix | Add regression test when practical and document affected invariant |

## Change-Report Requirements

Future implementation tasks should report:

- Files changed.
- Behavior implemented or corrected.
- Canonical docs and ADRs consulted.
- Tests/verification run.
- Documentation updated or rationale for no update.
- Dependencies introduced or confirmation none added.
- Deferred decisions encountered.
- Known remaining limitations.

## Prohibited Agent Shortcuts

Agents must not:

- Use "temporary" bypasses that violate privacy or trust boundaries.
- Save AI output as confirmed data to avoid implementing review.
- Use last-write-wins for quantity/history behavior without accepted policy.
- Treat sync success as publication.
- Embed credentials or sensitive sample data.
- Add large dependencies/frameworks without justification.
- Suppress tests or errors to obtain a passing build.
- Delete or rewrite docs to hide inconsistency.
- Produce fake operations instructions for unimplemented features.

## Relationship to `AGENTS.md` and Context Packs

`AGENTS.md` is the concise entry route. This standard provides fuller agent-working rules. Task-specific context packs provide minimum-sufficient execution context, but canonical docs and accepted ADRs remain authoritative. Pack changes follow canonical updates and must not substitute for them.
