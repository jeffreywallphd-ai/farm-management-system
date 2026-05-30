# Field Workflows

- Status: accepted
- Last reviewed: 2026-05-28
- Canonical for: representative farmer-facing workflows that motivate the standalone mobile pilot
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0012](../adr/ADR-0012-voice-photo-first-farm-event-capture-pilot.md)
- Related docs: [Product Vision and Scope](product-vision-and-scope.md), [Initial Vertical Slice](initial-vertical-slice.md), [User Research and Validation](user-research-and-validation.md), [AI-Assisted Capture Validation Plan](ai-assisted-capture-validation-plan.md), [Local Coordination and Sharing Validation Plan](local-coordination-and-sharing-validation-plan.md), [Deployment and Data-Control Validation Plan](deployment-and-data-control-validation-plan.md)
- Related tests: [Harvest use-case tests](../../apps/mobile/src/application/use-cases/harvestUseCases.test.ts), [Manual record use-case tests](../../apps/mobile/src/application/use-cases/manualRecordUseCases.test.ts), [Manual record validation tests](../../apps/mobile/src/domain/validation/manualRecordValidation.test.ts), [Phase 3 manual smoke test](../../apps/mobile/src/testing/phase-3-manual-smoke-test.md)
- Supersedes: none

## Purpose

This document describes representative real-world farmer workflows in plain operational language. These workflows should guide later domain modeling, user-interface design, offline architecture, and acceptance testing.

The current pilot is standalone mobile. This document does not define database schemas, API contracts, synchronization mechanics, server behavior, or implementation architecture.

The mobile app now presents record locations as farmer-facing farm places. Farm places can have a type and optional parent relationship, so record forms can show paths such as `Field 1 > Bed 2`, `Greenhouse 1 > Bench 1`, or `Wash/Pack > Cooler` without requiring GIS maps or crop-planning geometry.

## Workflow Status Summary

| Workflow | Status |
| --- | --- |
| Voice/photo farm-event capture | Mobile Pilot 1B accepted next implementation scope |
| Manual harvest | Mobile Pilot 1 included |
| Manual material use | Mobile Pilot 1 included |
| Manual inventory count | Mobile Pilot 1 included |
| Planting/transplanting | Candidate later workflow |
| Item movement | Candidate later workflow |
| Equipment issue | Candidate later workflow |
| Private supply need | Candidate later discovery workflow |
| Voice transcription or structured draft | Later experiment after capture-first evidence |
| Photo-count inference draft | Later experiment after capture-first evidence |
| Shared need publication | Future server-connected scope |

## Workflow 1: Capture a Farm Event Note With Voice and Photos

- Status: Mobile Pilot 1B accepted next implementation scope.
- Actor: farm worker, family member, or owner/operator.
- Physical/work context: field, greenhouse, tunnel, wash/pack area, storage area, barn, vehicle, or any place where work happens.
- Problem or trigger: something worth remembering happens, but a structured form would interrupt the work.
- Desired user action: tap `Record farm note`, speak a short memo, optionally attach photos, add light context if useful, and save.
- Expected pilot outcome: the event is saved locally, appears in a local timeline, remains private/device-local, and is included in a recovery package.
- Implementation note: this workflow captures source audio/photos for later review. It does not transcribe, infer fields, count objects, create operational records automatically, upload data, or synchronize.
- Why it matters: this tests whether farmers capture useful information more readily when the capture flow matches field conditions.
- Online/offline relevance: capture and local review must remain usable without reception.
- Future server note: server storage, synchronization, and shared visibility remain deferred.

### Scenario

```markdown
Given the worker is in the field without reliable reception
When the worker records a quick farm note and optionally attaches photos
Then the event is saved on the device
And the event appears in the local timeline
And the app does not imply transcription, cloud upload, or sharing
```

## Workflow 2: Record a Harvest in the Field Without Reception

- Status: Mobile Pilot 1 included.
- Actor: farm worker, family member, or owner/operator.
- Physical/work context: field, bed, greenhouse, tunnel, or other production area with poor or unavailable reception.
- Problem or trigger: produce is harvested and the worker wants to record crop, quantity, unit, and farm place before details are forgotten.
- Desired user action: quickly record the harvest at or near the harvest location.
- Expected pilot outcome: the harvest activity is saved locally, visible in local history, and clearly identified as stored on the device.
- Implementation note: Phase 3 includes manual harvest entry in unified local activity history/detail and recovery-copy export for all implemented manual records.
- Why it matters: harvest records are high-value operational records and are easy to lose when entry is delayed.
- Online/offline relevance: included workflow must remain usable without live connectivity or server availability.
- Future server note: a later server-connected version may synchronize the retained record, but synchronization state is not part of the standalone pilot.
- Confidence status: known motivation; exact fields and frequency require farmer validation.

### Scenario

```markdown
Given the worker has the mobile app open in the field
And no network connection is available
When the worker records a harvest and saves it
Then the harvest remains available in local activity history
And the app indicates that the record is stored locally on this device
And the worker does not need to re-enter the harvest because a server was unavailable
```

## Workflow 3: Record Material Use During Work

- Status: Mobile Pilot 1 included.
- Actor: worker applying or consuming a material/input.
- Physical/work context: greenhouse, storage area, wash/pack area, field, barn, or tunnel.
- Problem or trigger: the worker uses a material and wants the farm to retain what was used, where, and how much.
- Desired user action: record material, quantity/unit, use context, and optional note.
- Expected pilot outcome: the material-use activity is saved locally and contributes to local history or local expected inventory where supported.
- Implementation note: Phase 3 implements manual material-use entry, read-only detail, unified local history, and recovery-copy export. It does not implement automatic inventory deduction or supply recommendations.
- Why it matters: material-use records are easy to omit after work is finished.
- Future server note: later synchronization must preserve the confirmed local record without duplicate effects, but no server submission is part of the pilot.

## Workflow 4: Move Items or Materials

- Status: candidate later standalone-mobile workflow, not Mobile Pilot 1.
- Actor: worker moving flats, crates, equipment, or materials between farm locations.
- Physical/work context: greenhouse, tunnel, barn, storage area, wash/pack area, or field edge.
- Problem or trigger: items are moved and the location/history would be useful later.
- Desired user action: record what moved, quantity where relevant, source, destination, and optional note.
- Expected pilot outcome: the movement is saved locally and can be reviewed in local activity history.
- Why it matters: item locations often become unclear when records are postponed.

## Workflow 5: Record an Inventory Count or Observation

- Status: Mobile Pilot 1 included.
- Actor: owner/operator or worker checking materials or countable items.
- Physical/work context: storage area, greenhouse, cooler, barn, wash/pack area, or field.
- Problem or trigger: the observed amount differs from memory or expected quantity.
- Desired user action: record observed quantity/count and context.
- Expected pilot outcome: the observation is saved locally, and discrepancy meaning is preserved where the pilot displays expected versus observed understanding.
- Implementation note: Phase 3 implements inventory-count observations for materials and countable items. A count is saved as its own record and does not overwrite earlier history.
- Why it matters: an inventory count is evidence of current reality, not a reason to erase prior history.

## Workflow 6: Record an Equipment Issue

- Status: candidate later standalone-mobile workflow, not Mobile Pilot 1.
- Actor: worker noticing damaged, missing, unsafe, or maintenance-needed equipment.
- Physical/work context: any work area.
- Problem or trigger: a tool or machine needs attention.
- Desired user action: record equipment, issue description, location if relevant, and optional note/photo only if supported.
- Expected pilot outcome: the issue is saved locally and visible in local history.
- Why it matters: equipment issues are easy to forget and can affect safety or scheduling.

## Workflow 7: Voice-Assisted Harvest Draft

- Status: later experiment after capture-first evidence, not part of the local capture-only workflow.
- Actor: worker who wants faster entry while hands are occupied.
- Physical/work context: noisy, bright, wet, dirty, or fast-moving farm work.
- Problem or trigger: speaking may be faster than typing for a supported workflow.
- Desired user action: start voice capture, speak a harvest record, review proposed fields, correct if needed, and confirm or reject.
- Expected pilot outcome: the voice interpretation remains a draft until confirmed. A confirmed draft becomes the same kind of local private operational record as manual entry.
- Why it matters: voice capture is valuable only if it reduces burden without reducing trust.
- Constraints: manual entry must remain available; unconfirmed drafts have no operational effect; source audio is private by default.

## Workflow 8: Photo-Assisted Count Draft

- Status: later experiment after capture-first evidence, not part of the local capture-only workflow.
- Actor: worker counting a constrained item class such as seedling flats or harvest crates.
- Physical/work context: greenhouse, wash/pack area, storage area, trailer, or barn.
- Problem or trigger: manual counting or entry may be burdensome.
- Desired user action: select supported item type, capture a photo, review proposed count, correct if needed, and confirm or reject.
- Expected pilot outcome: the photo count remains a draft until confirmed. A confirmed result becomes a local private inventory observation.
- Constraints: arbitrary object recognition is not included; source photos are private by default; manual count entry must remain available.

## Workflow 9: Record a Private Supply Need for Discovery

- Status: candidate later discovery workflow, not Mobile Pilot 1.
- Actor: owner/operator or worker noticing that a material/input may be needed.
- Physical/work context: storage, greenhouse, barn, or field work.
- Problem or trigger: a low-material observation or operational plan suggests a future need.
- Desired user action: record a private internal supply-need note.
- Expected pilot outcome: the need remains local/private and can be reviewed by the farmer as part of discovery.
- Why it matters: private need capture can help determine whether later sourcing coordination is worth building.
- Deferred behavior: the pilot does not publish the need, select an audience, notify nearby farms, or collect responses through the application.

## Future Workflow: Intentional Need-Listing Publication

Server-connected expansion may later allow a farmer to transform a private supply need into an intentionally shared need listing for a trusted local audience.

That future workflow must preserve ADR-0004: a shared listing is a limited representation, not exposure of private inventory, records, source captures, drafts, or usage history.

Publication, withdrawal, responses, and external visibility are deferred from the standalone mobile pilot and require later product/ADR authorization.

## Candidate Later Workflow: Planting or Transplanting

Planting/transplanting remains a candidate later standalone-mobile workflow. Any reference to planting/transplanting in domain or architecture documents must not be read as Mobile Pilot 1 implementation scope.

## Future Workflow: Local Server or Hosted Synchronization

Server-connected expansion may later allow retained mobile records to synchronize with a configured server, support multi-device farm use, or support local/cooperative/hosted operating modes.

Those scenarios remain future architecture and validation topics. During the standalone mobile pilot, the farmer-facing workflow is local save, local history, and practical export/backup.

## Workflow Review Questions

- Which manual workflows are frequent and valuable enough for the first pilot?
- Which fields are essential during real work?
- Is local history understandable without reports or dashboards?
- Does the user understand that pilot data is local to the device unless exported/backed up?
- Does voice entry reduce burden after review/correction effort is counted?
- Does photo counting work in real lighting, clutter, and motion?
- Does private supply-need capture help validate later coordination?
