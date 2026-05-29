# Context Documentation

`docs/context/` helps automated development agents and human prompt authors assemble accurate, minimum-sufficient context for a task.

Context packs are optimized summaries and routing aids. They do not replace canonical documents or accepted ADRs. They reduce unnecessary prompt size while surfacing the constraints most likely to be violated. Future prompts should include only the packs materially relevant to the work.

## Authority Hierarchy

1. Accepted ADRs govern recorded durable decisions.
2. Canonical product, domain, architecture, standards, and operations docs govern their subject matter.
3. The decision-readiness register identifies proposed/deferred topics agents must not treat as settled.
4. Context packs route and summarize; they never override.
5. Task prompts may narrow work but may not silently rewrite canonical policy.

## Baseline Context Rule

For every non-trivial automated development task, begin with:

```text
AGENTS.md
docs/README.md
docs/context/packs/index.pack.md
docs/context/prompt-routing.md
docs/standards/change-impact-matrix.md
```

Then add only the relevant specialized pack(s), accepted ADRs, canonical documents, standards, and affected source/tests required for that task.

## Pack Inventory

| Pack | Purpose | Typical use |
| --- | --- | --- |
| `packs/index.pack.md` | Baseline project constraints and routing rules | Every non-trivial implementation/review task |
| `packs/product-and-domain.pack.md` | Product scope and farmer-centered domain behavior | New workflows, record types, terminology, first-slice scope |
| `packs/offline-sync.pack.md` | Offline retention, future-sync compatibility, synchronization constraints, idempotency, discrepancy behavior | Mobile offline data, local history, future sync, reconnect, conflicts |
| `packs/mobile-field-capture.pack.md` | Field workflow and practical mobile interaction constraints | Activity entry UI, offline state UX, capture initiation |
| `packs/ai-assisted-recording.pack.md` | Voice/photo draft-confirmation trust boundary | Transcription, counting, AI-assisted capture |
| `packs/privacy-and-sharing.pack.md` | Private-by-default and intentional sharing constraints | Listings, visibility, attachments, identities |
| `packs/server-deployment-and-operations.pack.md` | Mobile export/backup plus future hosted/local/self-hosted operations and recoverability | Export, backup, upgrades, future server/deployment |
| `packs/testing-and-diagnostics.pack.md` | Verification and privacy-safe diagnostics obligations | Tests, defect fixes, logs, incident diagnosis |
| `packs/dependency-and-technology-selection.pack.md` | Dependency review and deferred technology decision discipline | New libraries, providers, technical stack evaluation |
| `packs/documentation-and-adr-governance.pack.md` | Canonical documentation and decision updates | Docs, ADRs, architecture changes, reviews |

## Pack Selection Restraint

- Do not load every pack by default.
- Most implementation tasks should use `index` plus one or two relevant specialized packs.
- Cross-cutting or high-risk tasks may require more, but prompt assembly should justify each inclusion.
- When a task grows to require many unrelated packs, reconsider whether the work should be split into narrower tasks.

## Pack Line Budget

Each individual context pack must remain at or below 200 physical lines unless a documented exception is justified. Prefer links to canonical documents over long repeated summaries.

## Maintenance Rule

- Update a pack only when a canonical source changes in a way material to repeated task execution.
- Do not edit packs instead of updating canonical documentation.
- Review affected packs whenever an accepted ADR, canonical standard, or high-risk architecture rule changes.
- The [Change Impact Matrix](../standards/change-impact-matrix.md) and [Prompt Routing](prompt-routing.md) guide pack-update needs.
