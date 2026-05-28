# Deployment Modes

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: operations-facing deployment mode comparison, intended user burden, and deployment-mode invariants
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0006](../adr/ADR-0006-deployment-mode-compatibility.md)
- Related docs: [Operations README](README.md), [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md), [Local Farm Server Experience](local-farm-server-experience.md), [Backup, Restore, and Data Export Requirements](backup-restore-and-data-export-requirements.md), [Deployment and Data-Control Validation Plan](../product/deployment-and-data-control-validation-plan.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document gives an operations-facing overview of intended deployment choices in language understandable to prospective users, contributors, and later system operators.

It is not installation documentation for an implemented product. It defines intended operating experiences and constraints.

## Why Deployment Choice Matters for Farms

Farms may differ in connectivity, data-control preference, technical capacity, need for multi-worker synchronization, participation in a local network or cooperative, willingness to pay for managed convenience, and availability of on-site hardware or support.

The product should not require every farm to make the same infrastructure choice.

## Deployment Mode Comparison

| Mode | Who runs the server? | What the farmer manages | Offline field recording | Appropriate for |
| --- | --- | --- | ---: | --- |
| Managed hosted service | Service operator | Account/app use only | Required | Farms wanting minimal setup |
| Single-farm local server | Farm, through simplified local setup | Basic setup, backups/updates with guided tools later | Required; local sync may be possible without internet | Farms valuing local control or facing poor internet |
| Technical self-hosting | Farm/organization administrator | Server configuration and maintenance | Required | Technical users and open-source deployments |
| Cooperative/regional hosting | Trusted organization | Participation and farm-specific settings | Required | Networks coordinating selected shared needs |
| Private cloud | Farm group/organization | Infrastructure administration or contracted support | Required | Organizations needing controlled hosting |

Release 1 implementation priority is not finalized by this document.

## Ordinary Farmer Experience Requirement

- A farmer using hosted mode should not install infrastructure.
- A farmer using a future simplified local-server mode should not be expected to install or understand developer tools.
- Technical self-hosting may use administrator-focused installation methods later.
- Documentation must clearly distinguish "supported for technical administrators" from "usable by ordinary farmers."

## Deployment-Mode Invariant Table

| Requirement | Hosted | Single-farm local | Technical self-hosted | Cooperative/private cloud |
| --- | ---: | ---: | ---: | ---: |
| Offline mobile recording remains supported | Required | Required | Required | Required |
| Private operational records private by default | Required | Required | Required | Required |
| Intentional sharing boundary preserved | Required | Required if sharing enabled | Required if sharing enabled | Required |
| Export pathway | Required eventually | Required eventually | Required eventually | Required eventually |
| Backup/restore responsibility clear | Operator obligation later | Farm-guided tooling later | Admin documentation later | Operator/admin obligation later |
| Sensitive attachments protected | Required | Required | Required | Required |
| Farmer must administer Docker/database directly | No | No in simplified mode | Possibly, if selected later | Not ordinary participant responsibility |

## Deployment Modes Not Yet Promised

This document defines compatible intended modes and requirements. It is not a promise that every mode ships in the first release, and it does not define production hosting, local-server packaging, cooperative hosting, or private-cloud operation as completed functionality.
