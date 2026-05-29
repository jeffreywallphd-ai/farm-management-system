# Local Farm Server Experience

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: farmer-usable local server target experience, local-operation motivations, and distinction from technical self-hosting
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0006](../adr/ADR-0006-deployment-mode-compatibility.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [Decision Readiness Register](../adr/decision-readiness-register.md)
- Related docs: [Operations README](README.md), [Deployment Modes](deployment-modes.md), [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md), [Backup, Restore, and Data Export Requirements](backup-restore-and-data-export-requirements.md), [Deployment and Data-Control Validation Plan](../product/deployment-and-data-control-validation-plan.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines what a genuinely farmer-usable local server experience should eventually mean, distinct from developer or technical administrator self-hosting.

"Self-hosted" is insufficient if it still requires farmers to administer infrastructure they do not understand.

The standalone mobile pilot does not include local server implementation. This document remains future-facing guidance for later server-connected work if farmer evidence and ADRs justify it.

## Why Local Farm Operation May Matter

Local farm operation may matter when:

- A farm has weak or unreliable internet.
- Multiple workers may share local connectivity through farm Wi-Fi.
- A farm wants records stored on hardware it controls.
- A farm wants continuity during external service outages.
- A farm is cautious about hosted storage of sensitive operations/captures.
- A farm participates in local coordination but wants internal records controlled locally.

These motivations require further farmer validation.

## Intended User Experience

```text
Acquire or install local farm server
-> Complete guided setup
-> Create or connect farm administration context
-> Pair/configure mobile devices through an understandable process
-> Record work on mobile offline as usual
-> Synchronize with local server when reachable
-> View system health, backup status, and update status through simple controls
-> Export or restore farm data through documented guided workflows
```

This document does not specify QR codes, installers, appliances, operating systems, or networking mechanisms as final.

## Simplicity Requirements

A simplified local-farm mode must eventually minimize or hide:

- Database administration.
- Command-line setup.
- Container administration.
- Certificate generation.
- Port configuration.
- Storage-path configuration.
- Backup scripting.
- Complex upgrade steps.
- Manual recovery procedures.

If some complexity cannot be hidden safely, it must be explained honestly and may limit whether the mode is appropriate for ordinary farms.

## Distinction From Technical Self-Hosting

| Concern | Simplified local farm server | Technical self-hosted deployment |
| --- | --- | --- |
| Intended operator | Ordinary farm user or lightly technical helper | Technical administrator |
| Setup expectation | Guided/packaged/appliance-like later | Administrator-oriented documentation acceptable |
| Infrastructure visibility | Minimized | May be explicit |
| Updates | Guided/controlled later | Documented administrator process |
| Backups | Simple and prominent | Administrator-managed with supported procedure |
| Diagnostics | Human-readable health/status | More detailed operational tools acceptable |
| First-release commitment | To be validated/prioritized | Eventual open-source pathway required |

## Local Synchronization During Internet Outage

If mobile devices can reach a local farm server on the local network, the product may eventually allow synchronization within the farm even when external internet is unavailable.

This could improve multi-worker operation in remote areas. It requires later architectural decisions concerning authentication, local connectivity, server discovery, external network participation, backup, and conflict handling. It must not be represented as implemented or accepted until intentionally decided.

## Local Server Data Ownership Expectations

- Farm-owned records and permitted attachments must be recoverable/exportable.
- Local-server loss or hardware failure must be addressed through backup/restore guidance before real reliance.
- Local operation does not remove the need for privacy protections.
- External sharing remains intentional and separately configured.
- Any optional hosted backup or network connection must be understandable and controlled.

## Questions Requiring Validation

- Do farms actually want local server operation, or is offline mobile plus hosted synchronization sufficient?
- Is local synchronization during internet outage valuable for farms with multiple workers?
- Would farms maintain a small on-site device if setup were simple?
- Who would help farms with hardware failure, updates, or networking?
- Would an optional managed backup reduce concern about local-only operation?
- What data-control concerns influence hosted versus local preference?
- Which recovery steps would be acceptable to nontechnical users?
