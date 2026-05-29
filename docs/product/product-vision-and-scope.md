# Product Vision and Scope

- Status: accepted
- Last reviewed: 2026-05-28
- Canonical for: product vision, product principles, intended users, accepted standalone mobile pilot scope, and product-scope boundaries
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [Product README](README.md), [Initial Vertical Slice](initial-vertical-slice.md), [Mobile Pilot 1 Implementation Scope](mobile-pilot-1-implementation-scope.md), [Field Workflows](field-workflows.md), [User Research and Validation](user-research-and-validation.md), [Local Coordination and Sharing Validation Plan](local-coordination-and-sharing-validation-plan.md), [Deployment and Data-Control Validation Plan](deployment-and-data-control-validation-plan.md), [Roadmap](roadmap.md)
- Related tests: not yet implemented
- Supersedes: none

## Product Statement

This project is an open-source, mobile-capable farm operations platform for small farms that makes practical recordkeeping easier in real working conditions, including places with poor or unavailable connectivity.

The first implemented farmer-testing pilot is a standalone offline-first mobile application. It should help farm owners and workers capture useful operational information during real work, review local activity history, test constrained AI-assisted draft workflows, and keep pilot data retrievable through practical export/backup before meaningful reliance.

Local coordination and sourcing remain important motivating future problems. They should be validated through discovery and later server-connected work, not built into the initial standalone mobile pilot.

## Problem Statement

Small farms may rely on memory, notebooks, spreadsheets, texts, phone calls, social media groups, or clunky software interfaces. These tools can work in isolation but make it difficult to see recent activity, track material use, or recognize operational needs.

Farm-management software can become burdensome when routine work must be translated into complex form entry. A tool that asks too much during real work in a field, greenhouse, barn, wash/pack space, or storage area is unlikely to become a reliable record.

Connectivity constraints mean field work cannot depend on immediate access to a remote server. The first pilot therefore validates the mobile field experience before server synchronization, multi-device operation, or in-product local-network sharing are implemented.

Sourcing inputs or coordinating with nearby farms remains a motivating direction. During the mobile pilot, private internal supply-need notes may be captured for discovery if scoped, but they are not published through the platform.

## Intended Users

| User group | Relevant needs | Pilot posture |
| --- | --- | --- |
| Small-farm owner/operator | Operational visibility, low-burden records, data control | Primary pilot user |
| Farm worker or family member | Fast mobile entry, offline operation, understandable local history | Primary pilot user |
| Trusted neighboring farm contact | Future needs/offers communication and coordination | Discovery subject, not in-product pilot participant |
| Cooperative, food hub, or regional organizer | Later shared sourcing or coordination across participating farms | Future validation subject |

The first pilot serves a single farm operating on a device-local mobile app. Multi-farm sharing, network participants, and response workflows are deferred.

## Product Principles

1. **Field-first usability**: Recording work should be practical while standing in a greenhouse, barn, field, storage shed, or wash/pack space.
2. **Standalone offline mobile first**: The first pilot must work without a live server and must clearly communicate local saved state.
3. **Records should reflect farmer actions and observations**: The system should capture what happened in farm-understandable terms rather than expose unnecessary internal data complexity.
4. **AI assistance must remain reviewable**: Voice and camera experiments may reduce entry burden, but they must remain drafts until the user confirms or corrects them.
5. **Private farm operations stay controlled by the farm**: Pilot records, internal supply needs, source captures, and drafts are private by default.
6. **Data must not be trapped casually**: Practical export/backup is required before farmers rely on the standalone mobile pilot for meaningful operational records.
7. **Future server compatibility without premature server construction**: Local records and boundaries should not block later synchronization, but server implementation is deferred until evidence justifies it.
8. **Solve concrete workflows before broad platform ambitions**: The pilot validates useful mobile recordkeeping and constrained assisted capture before marketplace, coordination, hosting, or server infrastructure work.

## Initial Product Areas

| Product area | Why it matters | Standalone mobile pilot posture |
| --- | --- | --- |
| Basic farm setup, locations, and tracked items | Needed to record activity meaningfully | Included minimally |
| Manual activity and observation recording | Core value proposition | Included narrowly |
| Local activity history | Lets farmers see recent work and assess usefulness | Included |
| Offline local retention | Required for realistic field operation | Included; technology deferred |
| Clear local saved state | Prevents confusion about whether work exists | Included |
| Practical export/backup | Prevents meaningful pilot data from being trapped on one device | Included before farmer reliance |
| Voice-assisted activity draft | Potential friction reducer | Constrained experiment, preferably one workflow first |
| Photo-assisted count draft | Potential friction reducer | Constrained experiment, preferably one item class first |
| Private internal supply-need note | Helps discover sourcing value | Optional private pilot workflow |
| Server synchronization and multi-device use | Future capability | Deferred from pilot |
| Need-listing publication and responses | Future local coordination capability | Deferred from pilot |
| Hosted/local/cooperative server operation | Future operating model direction | Deferred from pilot |

## Product Boundaries and Non-Goals

The standalone mobile pilot is not a generic farm ERP, marketplace, social network, accounting system, compliance platform, server product, or autonomous AI assistant.

The pilot must not include server synchronization, multi-device farm access, hosted/local/cooperative server implementation, in-product shared need-listing publication, listing responses, public sharing, payments, or marketplace/social functionality unless product scope and ADRs are intentionally revised.

The exact first buildable Mobile Pilot 1 inclusions and exclusions are defined in [Mobile Pilot 1 Implementation Scope](mobile-pilot-1-implementation-scope.md). The broader standalone pilot program is described in [Initial Vertical Slice](initial-vertical-slice.md).

## Open Questions

- Which manual activities are frequent enough to deserve first-class support?
- Which local history views help farmers during real work?
- Which records are burdensome enough that voice entry would help?
- Which constrained item category makes photo counting useful, if any?
- What export/backup experience feels understandable and sufficient for pilot reliance?
- Are farmers comfortable retaining source audio/photos, and under what policy?
- Do private supply-need notes reveal enough interest to justify later server-connected sourcing?
- Would farms prefer hosted access, a simple local installation, cooperative hosting, or another path after the mobile pilot proves value?
