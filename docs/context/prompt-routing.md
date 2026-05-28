# Prompt Routing

This document is the authoritative context-assembly guide for automated development prompts. It helps agents decide what kind of task they are doing, which packs to load, which canonical sources and standards govern, what decisions remain unavailable, and when work should be split or escalated.

## Universal Startup Sequence

For all non-trivial work:

```text
1. Read AGENTS.md.
2. Read docs/README.md.
3. Read docs/context/packs/index.pack.md.
4. Read docs/standards/change-impact-matrix.md.
5. Classify the task using this routing document.
6. Load only the materially relevant specialized context packs.
7. Read the canonical docs, accepted ADRs, standards, existing code, and tests named by those packs.
8. Perform the scoped work.
9. Verify behavior and review documentation/ADR/pack impact before completion.
```

## Task Classification Table

| Task category | Required specialized pack(s) | Primary canonical docs/ADRs/standards to read | Typical documentation impact |
| --- | --- | --- | --- |
| New or changed farm workflow | `product-and-domain`, possibly `mobile-field-capture` | Product scope/workflows, glossary, event catalog, relevant ADRs, naming/usability/testing standards | Product/domain updates likely |
| New or changed operational record | `product-and-domain`, `offline-sync`, `testing-and-diagnostics` | Event catalog, inventory rules, sync docs/ADR, testing standards | Domain/architecture/ADR review likely |
| Offline mobile persistence/status | `offline-sync`, `mobile-field-capture`, `testing-and-diagnostics` | Offline architecture, sync ADR/docs, usability/logging standards | Architecture/verification impact |
| Synchronization/retry/conflict/reconnect | `offline-sync`, `testing-and-diagnostics` | Sync ADR/docs, inventory rules, operations recovery docs | Architecture/operations/test impact |
| Voice-assisted recording | `ai-assisted-recording`, `mobile-field-capture`, `privacy-and-sharing` as needed | AI ADR/docs, field workflow, attachment/privacy docs | Product/domain/architecture/test impact |
| Photo-assisted count | `ai-assisted-recording`, `mobile-field-capture`, `privacy-and-sharing`, `offline-sync` as needed | AI/inventory/attachment/privacy docs | Domain/architecture/test/privacy impact |
| Need listing/publication/local sharing | `privacy-and-sharing`, `product-and-domain`, `offline-sync` if offline publication involved | Privacy ADR/docs, sourcing model, sync docs | Privacy/domain/architecture impact |
| Attachments/source captures | `privacy-and-sharing`, `ai-assisted-recording` or `server-deployment-and-operations` as applicable | Attachment, AI, privacy, export/backup docs | Privacy/operations impact |
| Identity/access/security behavior | `privacy-and-sharing`, `dependency-and-technology-selection` if evaluating mechanisms | Privacy architecture, security standards, readiness register | New ADR likely before durable choice |
| Server/deployment mode work | `server-deployment-and-operations`, `offline-sync`, `privacy-and-sharing` where relevant | Deployment/operations docs, portability ADR, privacy docs | Architecture/operations/ADR impact |
| Backup/export/restore/upgrade/migration | `server-deployment-and-operations`, `testing-and-diagnostics`, `privacy-and-sharing` | Operations docs, portability ADR, sync docs | Operations/verification/security impact |
| Defect diagnosis or regression fix | `testing-and-diagnostics` plus affected domain pack(s) | Testing/logging standards and applicable ADR/docs | Regression test and docs review |
| New dependency/provider/library | `dependency-and-technology-selection` plus affected functional pack | Dependency/security standards, readiness register, affected ADR/docs | ADR/privacy/deployment review if material |
| Technology selection or foundational implementation planning | `dependency-and-technology-selection`, `documentation-and-adr-governance`, affected domain packs | Readiness register, ADR policy, all affected constraints | New ADR required before acceptance |
| Documentation/ADR/context changes | `documentation-and-adr-governance` | Documentation standards, ADR policy, canonical sources | Context/metadata/link review |
| User research or validation update | `product-and-domain` plus relevant specialized pack | Validation plan documents | Product evidence/status update |

## Minimum-Sufficient Context Rules

- Use `index` plus only packs required by the task.
- Do not include a pack merely because the affected subsystem could theoretically interact with it.
- Include `privacy-and-sharing` whenever work may change external visibility, sensitive attachments, captures, exports, or access.
- Include `offline-sync` whenever work may change retained field work, status, retry, conflicts, or publication timing.
- Include `documentation-and-adr-governance` when making architecture/decision changes or selecting previously deferred technology.
- Include `testing-and-diagnostics` for bug fixes and behavior-changing implementation.

## Task-Splitting Guidance

Split tasks that simultaneously attempt multiple high-risk categories, such as:

- Selecting technology, implementing offline sync, adding AI capture, and introducing deployment configuration in one task.
- Changing privacy/sharing boundaries while adding network functionality and external providers.
- Adding server mode, backup, restore, and migration together without prior ADR/implementation sequencing.

Bounded vertical slices are allowed when necessary, but every relevant constraint must be handled explicitly.

## Stop and Escalation Conditions

Stop, report, or create an authorized decision/doc update rather than silently proceeding when:

- Canonical documents conflict materially.
- A requested implementation requires selecting a deferred foundational technology without authorization.
- A feature expands beyond first-slice scope without product update.
- A task would weaken an accepted ADR constraint.
- Privacy implications are undefined for proposed external data exposure.
- An AI feature would create confirmed effects without confirmation.
- A deployment or migration task lacks recoverability expectations.
- A dependency introduces material licensing/privacy/lock-in concerns not addressed by existing decisions.

## Prompt Assembly Examples

These are assembly examples, not complete task instructions. After selecting packs, read the canonical sources they name.

### Example A: Add a Manual Harvest Recording Workflow

```text
Baseline:
- AGENTS.md
- docs/README.md
- docs/context/packs/index.pack.md
- docs/standards/change-impact-matrix.md

Add:
- product-and-domain.pack.md
- mobile-field-capture.pack.md
- offline-sync.pack.md, if offline persistence/sync behavior changes
- testing-and-diagnostics.pack.md

Then read named canonical sources and affected implementation/tests.
```

### Example B: Implement or Review Synchronization Retry Behavior

```text
Baseline plus:
- offline-sync.pack.md
- testing-and-diagnostics.pack.md

Add privacy-and-sharing.pack.md only if publication, cross-farm visibility, or sensitive attachments are affected.
```

### Example C: Implement a Voice-Assisted Harvest Draft

```text
Baseline plus:
- ai-assisted-recording.pack.md
- mobile-field-capture.pack.md
- product-and-domain.pack.md
- privacy-and-sharing.pack.md, if audio retention/transfer/access is involved
- offline-sync.pack.md, if offline capture/confirmation/sync behavior is involved
- testing-and-diagnostics.pack.md
```

### Example D: Implement Need-Listing Publication

```text
Baseline plus:
- privacy-and-sharing.pack.md
- product-and-domain.pack.md
- offline-sync.pack.md, if pending offline publication is involved
- testing-and-diagnostics.pack.md
```

### Example E: Evaluate Server Language, Database, or Sync Technology

```text
Baseline plus:
- dependency-and-technology-selection.pack.md
- documentation-and-adr-governance.pack.md
- offline-sync.pack.md and/or server-deployment-and-operations.pack.md as relevant

Required:
- read decision-readiness register;
- evaluate against accepted ADR constraints;
- create a proposed/accepted ADR only when explicitly authorized and justified;
- do not implement the selection during an evaluation-only task.
```

### Example F: Add Backup/Export or Local-Server Capability

```text
Baseline plus:
- server-deployment-and-operations.pack.md
- privacy-and-sharing.pack.md
- offline-sync.pack.md where reconnect/pending data behavior may change
- testing-and-diagnostics.pack.md
```

### Example G: Documentation or ADR Review

```text
Baseline plus:
- documentation-and-adr-governance.pack.md
- specialized pack(s) only for the subject matter under review
```

## Completion Checklist

Future agents should report:

- Task classification and packs/canonical sources consulted.
- Accepted ADR constraints preserved.
- Files changed.
- Tests or verification performed.
- Documentation, ADR, and context-pack impact reviewed.
- Dependencies introduced or confirmation none.
- Unresolved decisions or known limitations.
