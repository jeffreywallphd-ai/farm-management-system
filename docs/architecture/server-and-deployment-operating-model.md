# Server and Deployment Operating Model

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: server operating modes, deployment-mode architecture constraints, mobile/server relationship, data portability, and deployment-neutral product invariants
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0006](../adr/ADR-0006-deployment-mode-compatibility.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [System Overview](system-overview.md), [Offline-First Mobile Architecture](offline-first-mobile-architecture.md), [Synchronization Architecture](synchronization-architecture.md), [Persistence and Attachment Storage](persistence-and-attachment-storage.md), [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md), [Deployment Modes](../operations/deployment-modes.md), [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md), [Deployment and Data-Control Validation Plan](../product/deployment-and-data-control-validation-plan.md)
- Related tests: not yet implemented
- Supersedes: none

## Architecture Purpose

The platform is intended to serve farms with varying internet availability, technical capacity, desire for local control, need for multi-device use, interest in coordination with nearby farms, and willingness to use a managed hosted service.

The system must therefore avoid being designed exclusively for permanent cloud connectivity or complex technical self-hosting. Deployment choices must preserve offline mobile recording, private-by-default farm data, intentional publication, data recovery, and exportability.

## Operating Model Overview

The first implemented pilot is standalone mobile and does not include a server. The following operating model describes future server-connected expansion that the pilot should not foreclose.

```text
Mobile Field Client
|-- Works offline for supported field-recording workflows
|-- Retains confirmed operational records locally
|-- May synchronize later when a permitted server feature exists
`-- May communicate with hosted, local, cooperative, or private-cloud server mode

Server Operating Mode
|-- Receives and distributes permitted synchronized records
|-- Supports farm-private operational context
|-- Supports intentional shared-listing publication where enabled
|-- Retains server-side durable data and attachments as permitted
|-- Provides future administration/export/recovery boundaries
`-- May be operated by a managed host, a farm, or a trusted organization
```

The same product-level privacy, synchronization, AI-confirmation, attachment, backup, and export invariants apply across deployment modes.

## Deployment Modes

| Mode | Intended operator | Typical user experience | Why it matters | First-release posture |
| --- | --- | --- | --- | --- |
| Managed hosted service | Project operator or hosting provider | Farmer creates account/uses app; no server administration | Lowest adoption barrier | Likely important, but implementation sequencing deferred |
| Single-farm local server | Individual farm, with simple setup experience | Farm installs or activates local service; mobile devices connect/sync locally where possible | Data control and weak internet environments | Important design target; exact initial release inclusion deferred |
| Technical self-hosted server | Technically capable farm/organization/contributor | Administrator configures and maintains server using documented infrastructure tooling | Open-source credibility and flexibility | Required eventual pathway |
| Cooperative/regional server | Cooperative, food hub, nonprofit, extension initiative, or trusted regional organization | Multiple farms participate with private data boundaries plus controlled shared coordination | Supports local agricultural network value | Future/conditional on validation |
| Private-cloud organizational deployment | Farm group or organization | Organization runs server on chosen infrastructure | Controlled hosted alternative | Future/compatible direction |

These are operating modes the architecture should not foreclose. This document does not commit all modes to Release 1. The product-validation plan must help determine prioritization. Public cloud hosting and managed hosting are not the only valid modes. A local server does not eliminate mobile offline requirements.

## First-Slice Deployment Posture

The first implemented pilot requires:

- A standalone mobile field experience capable of offline local record capture.
- Local activity history and understandable local saved state.
- Practical mobile export/backup before farmers rely on real operational data.
- No assumption that ordinary farm users will administer developer infrastructure.

The first pilot does not require a synchronization-capable server environment. Implementation planning and ADR work must authorize any later server sequence after evidence justifies it.

## Hosted-Service Architecture Implications

A future hosted mode must preserve these requirements:

- The farmer does not administer server infrastructure.
- Mobile offline behavior remains supported.
- Hosted storage of private farm data follows privacy/access rules.
- Hosted operation provides data export and eventual account/data-removal policy.
- Source captures and attachments require clear retention/access rules.
- Hosting operator access and operational diagnostics require explicit governance later.
- Managed hosting may be a sustainable service around an open-source core, but business-model decisions are outside this task.

## Single-Farm Local-Server Architecture Implications

A farmer-usable local mode should eventually mean:

- A farm can operate its own server with minimal technical burden.
- Devices on an available local network may synchronize with the local server even when external internet is unavailable, if the later implementation supports that topology.
- Setup should eventually resemble an appliance or ordinary application setup rather than developer infrastructure administration.
- Backup, restore, updates, device connection/pairing, and diagnostics are understandable.
- Local operation still requires secure access boundaries and does not excuse poor privacy behavior.
- Local operation may later optionally synchronize outward or participate in a network, but that is not assumed here.

## Technical Self-Hosting Architecture Implications

Technical self-hosting exists to:

- Provide a credible open-source deployment path.
- Support technical farms, cooperatives, organizations, and contributors.
- Permit use on controlled infrastructure.
- Provide documented configuration, upgrade, backup, and recovery expectations.

Later technical self-hosting may reasonably support container-based installation or other administrator-facing approaches, but this prompt does not select the implementation.

## Cooperative and Private-Cloud Architecture Implications

Future cooperative or private-cloud operation must preserve:

- Multiple farms may use one operated server while preserving private farm boundaries.
- Only intentional listings or permitted coordination data cross farm boundaries.
- Operator/admin access to data requires explicit future governance.
- Local-network value must be validated before substantial investment.
- Cooperative hosting does not mean all participant records are mutually visible.

## Mobile-to-Server Relationship Across Deployment Modes

| Concern | Required behavior across modes |
| --- | --- |
| Offline field entry | Works according to existing offline-first architecture |
| Local retention of confirmed records | Required regardless of server mode |
| Synchronization destination | A permitted configured server instance, implementation deferred |
| Shared-listing publication | Effective only after synchronized/accepted by server authority for audience |
| Server reachability | Mobile must tolerate periods where configured server is unavailable |
| Server switching/migration | Later requirement; must not be rendered impossible by architecture |
| Device/server trust establishment | Deferred identity/security implementation decision |
| Cached data freshness | User must not be misled about current shared state while offline/disconnected |

## Server Responsibilities

| Responsibility | Required meaning |
| --- | --- |
| Farm context authority | Maintain synchronized authorized farm context and membership boundary later |
| Operational record acceptance | Accept valid synchronized records idempotently and preserve history |
| Change distribution | Provide permitted updates to authorized devices |
| Shared publication boundary | Make only intentionally published representations available to appropriate audiences |
| Attachment handling | Retain and serve permitted content under privacy rules |
| Synchronization outcomes | Return acceptance/failure/attention statuses without silent loss |
| Administration/export | Support eventual data ownership, export, backup, and recovery functions |
| Diagnostics/health | Support operators in diagnosing failures without leaking sensitive content |
| Upgrade/migration safety | Preserve durable records and required classifications across versions |

This document does not design modules or APIs.

## Server Authority and Offline Limitations

- The server is authoritative for synchronized shared state, accepted publication, authorized cross-device distribution, and later multi-party coordination.
- The mobile client remains capable of immediate offline private record capture.
- A local mobile record that has not synchronized may not yet appear on other devices.
- A local farm server that is unreachable behaves, from the mobile device perspective, like any unavailable sync target.
- A shared listing cannot become visible to others solely through local device retention.
- A cooperative/server operator must not be treated as permission to expose private records.

## Local-Network-Without-Internet Scenario

A farm may have usable local Wi-Fi or a local network even when internet access is unavailable. A future local-server mode should be evaluated for the ability to let farm devices synchronize locally in that situation, while remaining compatible with later external synchronization, backup, or network participation where intentionally configured.

This is an architectural opportunity requiring later technical decision and user validation, not a completed feature commitment.

## Open-Source and Portability Implications

- Core farm operations must not depend exclusively on a proprietary hosted service.
- User-owned operational records should be exportable.
- Attachments should be recoverable/exportable according to policy.
- Technical self-hosting must remain feasible.
- Deployment decisions should avoid avoidable lock-in.
- Optional managed services may exist later without weakening the open-source core or user data-control posture.

This task does not choose a license or business model.

## Deployment-Mode Privacy Invariants

1. Hosted mode does not weaken private-by-default behavior.
2. Local-server mode does not automatically expose all farm data to all local-network users.
3. Cooperative mode does not merge private farm contexts.
4. Shared listings remain intentionally published representations.
5. Sensitive attachments and AI captures remain protected regardless of server operator.
6. Backups and exports contain sensitive data and require future access/handling safeguards.
7. Diagnostics must support operation without routine exposure of sensitive content.

## Architecture Decisions Deliberately Deferred

- Server implementation language.
- Server framework.
- Server executable/package shape.
- Local and hosted database technology.
- Local-server embedded versus external database approach.
- Storage/object-store technology.
- Operating-system targets.
- Mobile-server discovery/pairing mechanism.
- Containerization.
- Installer/appliance packaging.
- Cloud provider.
- HTTPS/certificate/network setup.
- Authentication/offline session mechanism.
- Authorization implementation.
- Multi-tenant implementation.
- Server migration format.
- Hosted-service pricing/business model.
- Operator/support access policy.
- External synchronization between independent server instances.

## Future Implementation Verification Categories

Future implementation must verify:

- Server unreachable while mobile retains offline records.
- Synchronization to a configured server after reconnect.
- Local-network server operation during internet loss, if implemented.
- Private data isolation across farms in cooperative/hosted modes.
- Intentional shared-listing publication boundary.
- Hosted export capability.
- Local backup/restore recovery.
- Upgrade/migration preservation.
- Attachment recovery/access-boundary behavior.
- Diagnostic redaction and supportability.
- Migration between server modes, if later supported.
