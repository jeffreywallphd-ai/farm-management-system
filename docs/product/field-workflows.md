# Field Workflows

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: representative farmer-facing workflows that motivate the initial product slice
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md)
- Related docs: [Product Vision and Scope](product-vision-and-scope.md), [Initial Vertical Slice](initial-vertical-slice.md), [User Research and Validation](user-research-and-validation.md), [Local Coordination and Sharing Validation Plan](local-coordination-and-sharing-validation-plan.md), [Deployment and Data-Control Validation Plan](deployment-and-data-control-validation-plan.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document describes representative real-world farmer workflows in plain operational language. These workflows should guide later domain modeling, user-interface design, offline architecture, and acceptance testing.

This document does not define database schemas, API contracts, synchronization mechanics, or implementation architecture.

## Workflow 1: Record a Harvest in the Field Without Reception

- Actor: farm worker, family member, or owner/operator.
- Physical/work context: field, bed, greenhouse, tunnel, or other production area with poor or unavailable reception.
- Problem or trigger: produce is harvested and the worker wants to record crop, quantity, unit, and location before details are forgotten.
- Desired user action: quickly record the harvest at or near the harvest location.
- Expected outcome: the harvest activity is saved, visible to the farm, and marked appropriately if it awaits synchronization.
- Why it matters: harvest records are high-value operational records and are easy to lose when entry is delayed.
- Online/offline relevance: included workflow must remain usable without live connectivity.
- Confidence status: known motivation; exact frequency and required fields require validation.
- Initial-release status: included.

### Scenario: Record a Harvest While Offline

Given a worker has access to the farm and previously available location/crop information  
And the worker currently has no network reception  
When the worker records a harvest activity  
Then the record should be retained locally  
And the worker should be able to see that it awaits synchronization  
And the work should not be lost merely because connectivity is unavailable

This remains true whether the farm later uses hosted synchronization, a local farm server, a cooperative server, or another supported operating mode.

## Workflow 2: Record Material Use During Production Work

- Actor: farm worker, family member, or owner/operator.
- Physical/work context: greenhouse, field, barn, wash/pack space, storage area, or animal-care area.
- Problem or trigger: a worker uses potting mix, feed, seed, soil amendment, row cover, packaging, or another tracked input.
- Desired user action: quickly note what material was used, approximate quantity, and where or why it was used.
- Expected outcome: material use is captured as an operational activity and can later inform inventory awareness or sourcing needs.
- Why it matters: material use is often noticed in the moment, while later reconstruction is unreliable.
- Online/offline relevance: included workflow must remain usable without live connectivity.
- Confidence status: known motivation; exact material categories require validation.
- Initial-release status: included.

### Scenario: Record Material Use During Field Work

Given a worker is using a tracked material during farm work  
And connectivity is unavailable or unreliable  
When the worker records material use  
Then the record should be retained locally  
And the worker should be able to review the activity later  
And the material note should not require office entry before it is useful

## Workflow 3: Record Movement of Farm Items

- Actor: farm worker, family member, or owner/operator.
- Physical/work context: movement between field, greenhouse, tunnel, barn, storage, wash/pack, or other farm locations.
- Problem or trigger: seedling flats, harvested crates, supplies, equipment, or another tracked item moves from one location to another.
- Desired user action: record what moved, from where, to where, and in what approximate quantity if relevant.
- Expected outcome: the farm has a recent movement record that helps workers understand where items are.
- Why it matters: misplaced farm items create wasted time and unreliable inventory awareness.
- Online/offline relevance: included workflow must remain usable without live connectivity.
- Confidence status: working assumption; specific movement patterns require validation.
- Initial-release status: included.

### Scenario: Record Item Movement

Given a worker moves a tracked item between known farm locations  
When the worker records the movement  
Then the record should show the item, origin, destination, and practical quantity when relevant  
And the activity should remain available even if recorded offline

## Workflow 4: Record an Inventory Observation or Count

- Actor: farm worker, family member, or owner/operator.
- Physical/work context: storage area, greenhouse, barn, wash/pack space, or field edge.
- Problem or trigger: a worker sees that only a limited quantity remains or counts standardized items such as flats or crates.
- Desired user action: record an observation or count without performing a full reconciliation process.
- Expected outcome: the observation is available for later review and may support a low-material sourcing workflow.
- Why it matters: practical inventory awareness often begins with observations, not formal inventory audits.
- Online/offline relevance: manual observation must work offline; camera assistance is only a constrained proof-of-concept.
- Confidence status: working assumption; value and count categories require validation.
- Initial-release status: included manually; camera assistance proof-of-concept only.

### Scenario: Record a Low-Material Observation

Given a worker notices that a tracked material appears low  
When the worker records an inventory observation  
Then the observation should be saved with the material, practical quantity or note, and location when relevant  
And the worker should not be forced to publish or share the observation

## Workflow 5: Use Voice to Create a Reviewable Activity Draft

- Actor: farm worker, family member, or owner/operator.
- Physical/work context: hands are occupied, wet, dirty, gloved, or otherwise inconvenient for typing.
- Problem or trigger: typing a full record would interrupt work, but the worker can speak a short activity note such as "Harvested eighteen pounds of kale from bed four."
- Desired user action: initiate voice capture and review the interpreted draft.
- Expected outcome: the system proposes fields for a structured record, and the user confirms, edits, or rejects the draft.
- Why it matters: voice may reduce entry friction for common activity records.
- Online/offline relevance: offline expectations for voice processing require later architecture decisions; product behavior must preserve review and confirmation.
- Confidence status: working assumption; usefulness requires prototype validation.
- Initial-release status: narrow proof-of-concept.

The product expectation is a draft-and-confirm workflow, not automatic unreviewed record creation.

### Scenario: Confirm a Voice Draft

Given a worker speaks a short activity note  
When the system proposes an interpreted activity draft  
Then the worker should be able to confirm, edit, or reject it  
And only confirmed information should become an activity record

## Workflow 6: Use a Photo to Draft a Count of a Constrained Item Type

- Actor: farm worker, family member, or owner/operator.
- Physical/work context: greenhouse, wash/pack space, storage area, or other place with visually regular items.
- Problem or trigger: a worker needs to count a constrained item type such as seedling flats or harvest crates.
- Desired user action: choose the item type, capture a photo, review the proposed count, correct it if needed, and confirm the observation.
- Expected outcome: the confirmed count becomes an inventory observation.
- Why it matters: repeated counting may be a good test of whether camera assistance saves time in real farm conditions.
- Online/offline relevance: capture should fit field work; processing and sync mechanics require later architecture decisions.
- Confidence status: working assumption; feasibility requires real photo tests.
- Initial-release status: narrow proof-of-concept.

Arbitrary farm-object recognition and disease diagnosis are not part of this workflow.

### Scenario: Confirm a Photo Count Draft

Given a worker selects a constrained item type to count  
When the worker captures a photo and receives a proposed count  
Then the worker should be able to confirm or correct the count  
And only the confirmed count should become an observation

## Workflow 7: Convert a Low-Material Observation Into a Sourcing Need

- Actor: farm owner/operator or authorized worker.
- Physical/work context: storage area, greenhouse, barn, wash/pack space, or anywhere a shortage is noticed.
- Problem or trigger: a material appears low and the farm may need to source more locally.
- Desired user action: choose to create a narrow need listing from the observation, entering only information intended for sharing and selecting the intended audience concept where supported.
- Expected outcome: a need listing is shared with a trusted local network after publication succeeds, without exposing private inventory levels, source captures, or unrelated operational records.
- Why it matters: this connects an operational moment to the original sourcing and coordination motivation.
- Online/offline relevance: creation may happen in the field; offline publication remains pending until synchronization and acceptance.
- Confidence status: known motivation; willingness to share details requires validation.
- Initial-release status: included in a narrow form.

### Scenario: Share a Narrow Sourcing Need

Given a farmer has recorded or noticed a low-material condition  
When the farmer chooses to create a sourcing need  
Then the farmer should control the text and details shared  
And private inventory levels and unrelated activity records should remain private by default  
And if publication is requested while offline, the listing should not be represented as visible to others until synchronization succeeds

## Workflow 8: Communicate Around a Posted Need or Offer

- Actor: trusted neighboring farm contact, owner/operator, or later cooperative organizer.
- Physical/work context: after a need or offer has been intentionally shared.
- Problem or trigger: a neighboring farm may be able to help, respond, or ask a practical follow-up question.
- Desired user action: use a minimal response or contact path tied to the listing.
- Expected outcome: the listing can lead to practical coordination without creating a general social platform.
- Why it matters: a need listing is only useful if it can produce a clear next step.
- Online/offline relevance: response exchange likely depends on connectivity; offline drafting may be considered later.
- Confidence status: working assumption; preferred response method requires validation.
- Initial-release status: minimal or deferred.

The smallest useful interaction should be a listing-specific response/contact mechanism. General feeds, public marketplaces, payments, ratings, broad messaging, and social-network behavior are deferred.

## Operating Scenario: Internet Outage While Local Work Continues

- Actor: farm worker, owner/operator, or local farm administrator later.
- Physical/work context: farm has poor external internet or an outage.
- Desired user action: continue supported mobile recording; synchronize later with the configured server when reachable.
- Expected outcome: private field work remains retained locally. If a future local server is reachable on farm Wi-Fi, local synchronization may become possible after later validation and architecture decisions.
- Initial-release status: validation target; local-server operation is not assumed shipped by this workflow document.
