# Product Vision and Scope

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: product vision, product principles, intended users, initial product areas, and product-scope boundaries
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md)
- Related docs: [Product README](README.md), [Initial Vertical Slice](initial-vertical-slice.md), [Field Workflows](field-workflows.md), [User Research and Validation](user-research-and-validation.md), [Local Coordination and Sharing Validation Plan](local-coordination-and-sharing-validation-plan.md), [Deployment and Data-Control Validation Plan](deployment-and-data-control-validation-plan.md), [Roadmap](roadmap.md)
- Related tests: not yet implemented
- Supersedes: none

## Product Statement

This project is an open-source, mobile-capable farm operations platform for small farms that makes practical recordkeeping and local coordination easier in real working conditions, including locations with poor or unavailable connectivity.

The product should help farm owners, workers, and trusted local collaborators capture useful operational information with less friction than form-heavy tools, while keeping private farm operations under the farm's control.

## Problem Statement

Small farms may rely on fragmented tools such as memory, notebooks, spreadsheets, texts, phone calls, social media groups, or clunky software interfaces. These tools can work in isolation but make it difficult to see recent activity, track material use, or connect operational needs with local coordination.

Farm-management software can become burdensome when routine work must be translated into complex form entry. A tool that asks too much during real work in a field, greenhouse, barn, wash/pack space, or storage area is unlikely to become a reliable record.

Sourcing inputs or coordinating with nearby farms can be informal, difficult to search, and disconnected from operational records. A low-material observation may not easily become a clear, intentional request to trusted local contacts.

Connectivity constraints mean field work cannot depend on immediate access to a remote server. The product value is not merely "more farm features"; it is making accurate operational capture and useful local coordination fast enough to use during real farm work.

These motivating observations are working assumptions to test until supported by systematic farmer interviews, workflow observation, or prototype use.

## Intended Users

| User group | Relevant needs |
| --- | --- |
| Small-farm owner/operator | Operational visibility, materials needs, low-burden records, data control |
| Farm worker or family member | Very fast field entry, mobile usability, offline operation |
| Trusted neighboring farm contact | Needs/offers communication and coordination |
| Cooperative, food hub, or regional organizer, later | Shared sourcing or coordination across participating farms |

The first release should primarily serve a single farm and its workers. Local coordination should be limited to a narrow initial workflow around intentionally shared material needs; offers remain deferred unless product scope is intentionally revised.

## Product Principles

1. **Field-first usability**: Recording work should be practical while standing in a greenhouse, barn, field, storage shed, or wash/pack space.
2. **Offline capability is foundational**: Core field workflows must remain usable without live connectivity.
3. **Records should reflect farmer actions and observations**: The system should capture what happened in farm-understandable terms rather than expose unnecessary internal data complexity.
4. **AI assistance must remain reviewable**: Future voice and camera features should reduce input burden without silently asserting unverified farm facts.
5. **Private farm operations stay controlled by the farm**: Local coordination features must rely on intentional sharing, not automatic exposure of operational information.
6. **Open-source and deployable in multiple settings**: The product should remain compatible with farms or organizations that need control over their own deployment and data.
7. **Solve concrete workflows before broad platform ambitions**: The first release must validate useful farm activity recording and one coordination pathway rather than attempt every farm-management function.

Hosted use and farmer-controlled operation are both compatible with the product direction. Deployment priority requires validation, and data control includes practical export and recovery expectations. Ordinary farmers should not be forced to administer infrastructure to use the product.

## Initial Product Areas

| Product area | Why it matters | Initial release status |
| --- | --- | --- |
| Farm locations and basic tracked items | Needed to record activity meaningfully | Included in first slice |
| Activity and observation recording | Core value proposition | Included in first slice |
| Offline use and later synchronization | Required for realistic field operation | Included in first slice |
| Voice-assisted activity drafts | Potential differentiator | Narrow proof in first slice |
| Camera-assisted counting drafts | Potential differentiator | Narrow proof in first slice |
| Material sourcing / local needs listing | Original motivating coordination issue | One narrow workflow in first slice |
| Broader farm-to-farm communication | Valuable but may expand scope quickly | Limited/deferred |
| Advanced planning, compliance, commerce, accounting, recommendations | Potential future areas | Explicitly deferred |

## Product Boundaries and Non-Goals

The initial release is not a generic farm ERP, marketplace, social network, accounting system, compliance platform, or autonomous AI assistant. It should prove a narrow offline-capable activity recorder, limited AI-assisted draft workflows, and one intentionally shared local-sourcing pathway that keeps private operational records under farm control.

The detailed first-slice inclusions and exclusions are defined in [Initial Vertical Slice](initial-vertical-slice.md).

## Open Questions

- Which activities are recorded most often today?
- Which records are burdensome enough that voice entry would help?
- Which categories of farm materials are most difficult to source locally?
- What information would farmers share with neighboring farms?
- Which camera-counting task would provide clear value and be feasible under real conditions?
- What offline failures currently create frustration?
- Would farms prefer hosted access, a simple local installation, cooperative hosting, or different options depending on circumstances?
