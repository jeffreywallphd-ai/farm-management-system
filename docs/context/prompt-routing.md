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
| Implement Mobile Pilot 1 app shell or structure | `mobile-field-capture`, `dependency-and-technology-selection`, `documentation-and-adr-governance` as needed | ADR-0008, `apps/mobile/README.md`, `docs/product/mobile-pilot-1-implementation-scope.md`, coding/dependency standards | Authorized structure work; do not implement workflows accidentally |
| Implement Mobile Pilot 1 setup/reference data | `product-and-domain`, `mobile-field-capture`, `offline-sync`, `testing-and-diagnostics` | ADR-0007, ADR-0009, ADR-0011, `docs/product/mobile-pilot-1-implementation-scope.md`, offline architecture, persistence architecture, usability/testing standards | Authorized for farm profile, farmer-facing farm places, crops, materials, countable items only |
| Implement Mobile Pilot 1 manual record core | `product-and-domain`, `mobile-field-capture`, `offline-sync`, `testing-and-diagnostics` | ADR-0007, ADR-0008, ADR-0009, ADR-0010, ADR-0011, `docs/product/mobile-pilot-1-implementation-scope.md`, `docs/domain/mobile-pilot-1-operational-records.md`, `apps/mobile/README.md`, offline architecture, testing/usability standards | Harvest, material use, inventory count, unified history, and recovery-copy export are implemented; further record types require scope authorization |
| Implement Mobile Pilot 1 voice/photo farm-event capture | `product-and-domain`, `mobile-field-capture`, `offline-sync`, `privacy-and-sharing`, `ai-assisted-recording`, `testing-and-diagnostics` | ADR-0007, ADR-0008, ADR-0009, ADR-0010, ADR-0011, ADR-0012, `docs/product/mobile-pilot-1-implementation-scope.md`, `docs/product/field-workflows.md`, offline architecture, persistence/attachment storage, mobile pilot data-safety requirements | Authorized for local voice/photo source capture, event timeline, and recovery package only; AI interpretation, server sync, auth, sharing, and cloud backup remain deferred |
| Implement Mobile Pilot 1 local export/backup | `server-deployment-and-operations`, `offline-sync`, `mobile-field-capture`, `testing-and-diagnostics`, `privacy-and-sharing` | ADR-0005, ADR-0007, ADR-0010, ADR-0011, `docs/operations/mobile-pilot-data-safety-requirements.md`, `apps/mobile/README.md`, offline architecture, privacy docs | Authorized pilot data-safety work |
| Implement planting/movement/equipment/supply-need record | `product-and-domain`, `documentation-and-adr-governance` | ADR-0007, roadmap, initial vertical slice, proposed event catalog | Not Mobile Pilot 1; requires scoped product update or later increment authorization |
| Implement AI interpretation of voice/photo capture | `ai-assisted-recording`, `mobile-field-capture`, `product-and-domain`, `privacy-and-sharing` as needed | ADR-0003, ADR-0007, ADR-0012, AI domain/architecture docs, validation plan | Deferred until capture-first evidence and later scope/ADR review |
| Implement server sync/publication/deployment | `documentation-and-adr-governance`, `dependency-and-technology-selection`, affected feature packs | ADR-0007, readiness register, sync/server/deployment docs | Deferred; requires later ADR/product authorization |
| Standalone mobile pilot implementation | `product-and-domain`, `mobile-field-capture`, `offline-sync`, `testing-and-diagnostics` | ADR-0007, initial vertical slice, field workflows, offline architecture, export/backup operations docs | Product/architecture/operations/test impact |
| Mobile local history/persistence/export/backup | `offline-sync`, `mobile-field-capture`, `server-deployment-and-operations`, `testing-and-diagnostics`, `privacy-and-sharing` as needed | ADR-0007, ADR-0009, ADR-0010, ADR-0011, ADR-0005, offline architecture, mobile pilot data-safety doc, backup/export docs, upgrade/recovery docs | Operations/privacy/verification impact |
| Mobile voice/photo source capture | `ai-assisted-recording`, `mobile-field-capture`, `product-and-domain`, `privacy-and-sharing`, `offline-sync`, `testing-and-diagnostics` as needed | ADR-0012, ADR-0001, ADR-0004, persistence/attachment storage, mobile pilot data-safety docs | Active next Mobile Pilot 1 scope when limited to local capture, timeline, and recovery package without AI interpretation |
| New or changed farm workflow | `product-and-domain`, possibly `mobile-field-capture` | Product scope/workflows, glossary, event catalog, relevant ADRs, naming/usability/testing standards | Product/domain updates likely |
| New or changed operational record | `product-and-domain`, `offline-sync`, `testing-and-diagnostics` | Event catalog, inventory rules, sync docs/ADR, testing standards | Domain/architecture/ADR review likely |
| Offline mobile persistence/status | `offline-sync`, `mobile-field-capture`, `testing-and-diagnostics` | Offline architecture, sync ADR/docs, usability/logging standards | Architecture/verification impact |
| Synchronization/retry/conflict/reconnect | `offline-sync`, `testing-and-diagnostics` | Sync ADR/docs, inventory rules, operations recovery docs | Architecture/operations/test impact |
| Voice-assisted recording | `ai-assisted-recording`, `mobile-field-capture`, `privacy-and-sharing` as needed | AI ADR/docs, field workflow, attachment/privacy docs | Product/domain/architecture/test impact |
| Photo-assisted count | `ai-assisted-recording`, `mobile-field-capture`, `privacy-and-sharing`, `offline-sync` as needed | AI/inventory/attachment/privacy docs | Domain/architecture/test/privacy impact |
| Need listing/publication/local sharing | `privacy-and-sharing`, `product-and-domain`, `offline-sync` if offline publication involved | Privacy ADR/docs, sourcing model, sync docs | Privacy/domain/architecture impact |
| Server synchronization implementation | `offline-sync`, `documentation-and-adr-governance`, `dependency-and-technology-selection`, `testing-and-diagnostics` | ADR-0007, ADR-0002, synchronization architecture, readiness register | Deferred; requires later product/ADR authorization |
| Need-listing publication or farm-to-farm communication | `privacy-and-sharing`, `product-and-domain`, `documentation-and-adr-governance` | ADR-0007, ADR-0004, sourcing/privacy docs, validation plan | Deferred; requires later product/ADR authorization |
| Hosting/local-server/cooperative implementation | `server-deployment-and-operations`, `documentation-and-adr-governance`, `dependency-and-technology-selection` | ADR-0007, ADR-0006, deployment/operations docs, readiness register | Deferred; requires later product/ADR authorization |
| Attachments/source captures | `privacy-and-sharing`, `ai-assisted-recording` or `server-deployment-and-operations` as applicable | Attachment, AI, privacy, export/backup docs | Privacy/operations impact |
| Identity/access/security behavior | `privacy-and-sharing`, `dependency-and-technology-selection` if evaluating mechanisms | Privacy architecture, security standards, readiness register | New ADR likely before durable choice |
| Server/deployment mode work | `server-deployment-and-operations`, `offline-sync`, `privacy-and-sharing` where relevant | Deployment/operations docs, portability ADR, privacy docs | Architecture/operations/ADR impact |
| Backup/export/restore/upgrade/migration | `server-deployment-and-operations`, `testing-and-diagnostics`, `privacy-and-sharing` | Operations docs, portability ADR, sync docs | Operations/verification/security impact |
| Defect diagnosis or regression fix | `testing-and-diagnostics` plus affected domain pack(s) | Testing/logging standards and applicable ADR/docs | Regression test and docs review |
| New dependency/provider/library | `dependency-and-technology-selection` plus affected functional pack | Dependency/security standards, readiness register, affected ADR/docs | ADR/privacy/deployment review if material |
| Technology selection or foundational implementation planning | `dependency-and-technology-selection`, `documentation-and-adr-governance`, affected domain packs | Readiness register, ADR policy, all affected constraints | New ADR required before acceptance |
| ORM, server sync, AI capture, cloud backup, authentication, or deployment tooling | `dependency-and-technology-selection`, `documentation-and-adr-governance`, affected functional packs | ADR-0008 through ADR-0011, readiness register, affected architecture/docs | Deferred unless later ADR/product authorization exists |
| Documentation/ADR/context changes | `documentation-and-adr-governance` | Documentation standards, ADR policy, canonical sources | Context/metadata/link review |
| User research or validation update | `product-and-domain` plus relevant specialized pack | Validation plan documents | Product evidence/status update |

## Minimum-Sufficient Context Rules

- Use `index` plus only packs required by the task.
- Do not include a pack merely because the affected subsystem could theoretically interact with it.
- Use `docs/product/mobile-pilot-1-implementation-scope.md`, `docs/domain/mobile-pilot-1-operational-records.md`, and `docs/operations/mobile-pilot-data-safety-requirements.md` for first implementation prompts.
- Include `privacy-and-sharing` whenever work may change external visibility, sensitive attachments, captures, exports, or access.
- Include `offline-sync` whenever work may change retained field work, status, retry, conflicts, or publication timing.
- Include `documentation-and-adr-governance` when making architecture/decision changes or selecting previously deferred technology.
- Include `testing-and-diagnostics` for bug fixes and behavior-changing implementation.
- Treat server synchronization, need-listing publication, farm-to-farm communication, and hosted/local/cooperative server implementation as deferred unless the task explicitly includes product/ADR authorization.

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
- offline-sync.pack.md, if local persistence, local history, future-sync-compatible identity, or recovery behavior changes
- testing-and-diagnostics.pack.md

Then read named canonical sources and affected implementation/tests.

For Mobile Pilot 1, also read:

- docs/product/mobile-pilot-1-implementation-scope.md
- docs/domain/mobile-pilot-1-operational-records.md
- docs/operations/mobile-pilot-data-safety-requirements.md
```

### Example B: Implement or Review Local Mobile Retention or Export/Backup

```text
Baseline plus:
- offline-sync.pack.md
- testing-and-diagnostics.pack.md
- server-deployment-and-operations.pack.md, if export/backup/recovery is affected
- privacy-and-sharing.pack.md, if sensitive records, captures, or export contents are affected

This is active pilot scope when limited to local mobile behavior.
```

### Example C: Implement a Voice-Assisted Harvest Draft

```text
Baseline plus:
- ai-assisted-recording.pack.md
- mobile-field-capture.pack.md
- product-and-domain.pack.md
- privacy-and-sharing.pack.md, if audio retention/transfer/access is involved
- offline-sync.pack.md, if local capture/confirmation/history/export behavior is involved
- testing-and-diagnostics.pack.md

This is Mobile Pilot 2 or later, not a Mobile Pilot 1 implementation task.
```

### Example D: Evaluate Future Need-Listing Publication

```text
Baseline plus:
- privacy-and-sharing.pack.md
- product-and-domain.pack.md
- documentation-and-adr-governance.pack.md

Required:
- treat implementation as deferred from the standalone mobile pilot;
- read ADR-0007 and the local coordination validation plan;
- update product/ADR scope before any implementation prompt.
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
- offline-sync.pack.md where local retention, future reconnect, or pending data behavior may change
- testing-and-diagnostics.pack.md

Mobile pilot export/backup is active scope; local-server capability is deferred and requires later authorization.
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
