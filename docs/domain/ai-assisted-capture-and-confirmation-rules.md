# AI-Assisted Capture and Confirmation Rules

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: AI-assisted capture domain meaning, draft confirmation, provenance, ambiguity handling, and first-slice assisted-capture boundaries
- Related ADRs: [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md)
- Related docs: [Glossary](glossary.md), [Operational Event Catalog](operational-event-catalog.md), [Inventory and Reconciliation Rules](inventory-and-reconciliation-rules.md), [Privacy, Visibility, and Sharing Rules](privacy-visibility-and-sharing-rules.md), [AI-Assisted Capture Boundaries](../architecture/ai-assisted-capture-boundaries.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Field Workflows](../product/field-workflows.md), [AI-Assisted Capture Validation Plan](../product/ai-assisted-capture-validation-plan.md)
- Related tests: not yet implemented
- Supersedes: none

## Scope and Purpose

AI-assisted capture is intended to reduce the burden of routine field recording, especially when workers' hands are occupied or dirty, typing into multiple form fields is inconvenient, standardized objects need to be counted repeatedly, or connectivity is unavailable or unreliable.

AI-assisted capture is an experimental convenience layer over trustworthy operational records. It is not an autonomous farm-management authority.

## Domain Concepts

| Concept | Meaning |
| --- | --- |
| Source capture | Original input intentionally provided by a user, such as recorded speech or a photo. |
| Transcription | Machine-produced text representation of recorded speech; not confirmed fact. |
| Inference | Machine-produced interpretation of source input, such as intent, item, location, quantity, unit, or detected count. |
| Draft record | Proposed structured activity or observation awaiting user review. |
| Confidence indication | Information that may help identify uncertainty; not a substitute for user review. |
| Ambiguity | A condition where more than one reasonable interpretation exists or required information is missing. |
| Confirmation | User acceptance of a proposed record, potentially after review. |
| Correction before confirmation | User editing a draft before converting it into an operational record. |
| Rejection/discard | User decision that a draft should not become an operational record. |
| Provenance | Information identifying how a confirmed record was created or supported, such as manual entry, voice-assisted draft, or photo-assisted count. |
| Interpretation correction feedback | Difference between proposed and confirmed fields, potentially useful for evaluation under later governance. |
| Supported capture workflow | A narrowly defined use case the system intentionally attempts to interpret. |
| Unsupported capture request | Input outside the accepted AI-assisted scope that should not silently become a record. |

## Record-State Distinction

| State | Meaning | May affect farm history/inventory? |
| --- | --- | ---: |
| Raw/source capture retained locally | Audio or photo exists for review or processing | No |
| Interpretation pending | Processing not complete or no draft shown yet | No |
| Draft awaiting review | Proposed structured record displayed to user | No |
| Draft edited | User has modified proposed fields but not yet confirmed | No |
| Confirmed operational record | User has explicitly accepted the record | Yes, according to its operational-record type |
| Rejected/discarded draft | User chose not to create a record | No |
| Failed interpretation | System could not produce a usable draft | No |

Later architecture may refine technical statuses, but it must preserve this trust distinction.

## Manual Entry Versus AI-Assisted Entry

Manually entered and intentionally saved activities may become confirmed operational records according to ordinary product behavior.

AI-assisted workflows introduce an additional review step because machine interpretation may be incorrect. A user editing a draft and then confirming it produces a confirmed operational record whose source provenance may indicate AI-assisted capture.

The confirmed operational record is defined by the farm action or observation, not by the inference method.

## Voice-Assisted First-Slice Domain Workflows

Voice-assisted interpretation is limited to narrow candidate operational records already included in the initial vertical slice.

| Candidate workflow | Example spoken input | Intended resulting record after confirmation | First-slice posture |
| --- | --- | --- | --- |
| Harvest capture | "Harvested eighteen pounds of kale from bed four." | Harvest recorded | Included experiment |
| Material-use capture | "Used two bags of potting mix in greenhouse one." | Material use recorded | Included experiment or secondary candidate, follow product scope |
| Movement capture | "Moved twelve pepper flats from greenhouse one to tunnel two." | Item movement recorded | Included experiment or secondary candidate, follow product scope |

The canonical product documents name harvest, material use, and movement as preferred voice proof categories. Implementation may still choose a smaller first experiment if product validation indicates a narrower path.

### Harvest Voice Draft

Conceptually required extracted information:

- Activity type: harvest.
- Crop or planting when identifiable.
- Source location when stated or selectable.
- Quantity.
- Unit.
- Date/time default or confirmation context.
- Optional note.

### Material-Use Voice Draft

Conceptually required extracted information:

- Activity type: material use.
- Material/input.
- Quantity.
- Unit.
- Use location when stated.
- Date/time default or confirmation context.
- Optional note.

### Movement Voice Draft

Conceptually required extracted information:

- Activity type: movement.
- Tracked item.
- Quantity/unit where relevant.
- Source location when stated.
- Destination location.
- Date/time default or confirmation context.
- Optional note.

Missing or ambiguous required information must be resolved through review rather than silently invented.

## Photo-Assisted First-Slice Domain Workflow

The camera experiment is limited to counting one or two deliberately constrained standardized item types.

| Candidate | Why it may be suitable | Initial posture |
| --- | --- | --- |
| Seedling flats | Repeated, visually regular, relevant to greenhouse operations | Preferred candidate requiring field validation |
| Harvest crates | Visually discrete and operationally relevant | Possible secondary candidate requiring validation |
| Standardized material bags | Potentially useful but may be visually inconsistent/occluded | Deferred unless validated |

Photo-count workflow:

```text
User selects a supported item type
-> User captures a photo
-> System proposes visible item detections and/or a count
-> User reviews the proposed count
-> User corrects or confirms
-> Confirmed result becomes an inventory-count observation
```

Required conceptual fields for a confirmed photo-assisted count:

- Countable item type.
- Observed quantity.
- Unit, typically `each`, `flats`, or `crates` as appropriate.
- Observation date/time.
- Optional location.
- Source/provenance indicating photo assistance.
- Optional retained photo association subject to later privacy/retention rules.

## Unsupported or Prohibited First-Slice AI Uses

The initial AI-assisted scope excludes:

- Automatic creation of records without confirmation.
- Arbitrary photo-based identification of any farm object.
- Identification of plant disease.
- Weed identification for treatment decisions.
- Crop-health diagnosis.
- Fertilizer, pesticide, herbicide, veterinary, or other treatment recommendations.
- Autonomous supply purchasing.
- Autonomous publication of needs or offers.
- Identification or counting of people.
- Surveillance or worker productivity monitoring.
- Financial/accounting extraction.
- Public sharing of audio or images.
- Model training from captured farm data without later explicit governance.

## Ambiguity and Confirmation Rules

- The system may propose one interpreted value or present possible matches.
- Required information not confidently established must be visibly unresolved or require user selection.
- A draft may be incomplete until the user supplies missing fields.
- A user must be able to correct quantity, unit, item, location, date/time, and activity type where relevant.
- A user must be able to reject a draft entirely.
- Confirmation should be explicit; merely opening or reviewing a draft does not confirm it.
- The product must avoid making workers navigate more correction effort than manual entry would require; this is a validation concern.

## Relationship to Inventory and Sourcing

- A confirmed AI-assisted material-use record affects expected inventory in the same manner as a manually confirmed material-use record.
- A confirmed AI-assisted inventory count contributes an observation in the same manner as a manual inventory count.
- An unconfirmed draft has no inventory effect.
- A confirmed count or material-use record may later inform the farmer's recognition of a supply need.
- It must not automatically publish a need listing or disclose inventory outside the farm.
- Source captures, drafts, provenance, and correction feedback are private by default.
- AI output must not determine publication, audience, or visibility.
- A confirmed internal record is not shared merely because AI helped create it.

## Provenance Principles

Conceptual provenance for a confirmed AI-assisted record should include:

- Whether the record originated through manual entry, voice-assisted draft, or photo-assisted draft.
- Whether the user confirmed the proposal unchanged or edited it before confirmation.
- Source capture association where retained according to policy.
- Inference/model/version metadata only to the extent needed for later evaluation or audit, with details deferred to architecture/implementation.
- Date/time of capture, interpretation, and confirmation where relevant.

Provenance supports trust, debugging, feature evaluation, and later model improvement decisions. It must not burden ordinary farmer workflow unnecessarily.

## Questions Requiring Field Validation

- Do workers actually prefer speaking harvest/material-use/movement records over fast manual entry?
- Which spoken terminology naturally matches crop, location, and material records?
- How often are locations, item names, units, or crop varieties ambiguous?
- Are seedling flats or harvest crates worthwhile counting targets?
- Can users reliably take countable photos under greenhouse/barn/field conditions?
- Does review/correction take less time than manual counting or entry?
- Are workers comfortable retaining audio or photos, and under what conditions?
- What errors would make farmers stop trusting the feature?
