# Farm Domain Glossary

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: first-slice farm-domain vocabulary and terminology boundaries
- Related ADRs: none yet
- Related docs: [Domain README](README.md), [Privacy, Visibility, and Sharing Rules](privacy-visibility-and-sharing-rules.md), [Product Vision and Scope](../product/product-vision-and-scope.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Field Workflows](../product/field-workflows.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This glossary is the authoritative vocabulary for the first product slice. It should prevent future contributors and automated development agents from inventing overlapping concepts or using the same term inconsistently.

## Domain Vocabulary Rules

- Use the terms in this glossary consistently in product, domain, architecture, UI, API, data model, testing, and context documents.
- Introduce a new domain term only when it represents a distinct farmer-relevant concept.
- Prefer existing farmer-recognizable terms over generic system abstractions.
- When a term is still uncertain or requires field validation, mark it clearly.

## Core Terms

| Term | Meaning |
| --- | --- |
| Farm | The operating organization whose internal records and intentionally shared listings are managed in the platform. |
| Farm member | A person permitted to perform or review activities for a farm; exact permissions are deferred. |
| Worker | A farm member performing practical work or recording observations. Do not over-model employment status. |
| Farm participant | A person recognized as part of the farm context for supported product workflows; detailed permissions are deferred. |
| Authorized farm access | Permission to view or act on private farm information; implementation is deferred. |
| Location | A named place within or relevant to the farm where work, inventory, crops, or equipment may be associated. |
| Field | An outdoor growing area. A field may contain smaller locations such as beds. |
| Bed | A specific growing subsection where planting or harvesting may occur. |
| Greenhouse | A protected growing structure. |
| High tunnel / tunnel | A protected growing structure, potentially distinct from a greenhouse depending on farm terminology. This wording requires flexible configuration and field validation. |
| Storage area | A place where materials, equipment, containers, or harvested items may be kept. |
| Crop | A kind of plant produced or managed by the farm. |
| Crop variety | A more specific named type of crop, when relevant to recordkeeping. |
| Planting | A tracked occurrence or group of a crop growing in a location over a period of time. |
| Material / input | A consumable or usable supply used in farm operations, such as potting mix, feed, row cover, amendment, packaging, or seed. |
| Equipment | A tool or machine whose location, condition, or maintenance need may be recorded. |
| Countable item | A standardized item that may be counted, such as seedling flats or harvest crates. |
| Activity | Work reported as having been performed, such as harvesting, planting, using a material, or moving an item. |
| Observation | A fact noticed or measured at a time, such as an inventory count or equipment issue. |
| Operational record | A user-confirmed retained record of an activity or observation. |
| Private farm operational data | Information recorded for internal farm operation and not visible outside authorized farm participation by default. |
| Source capture | Original input intentionally provided by a user, such as recorded speech or a photo. See [AI-Assisted Capture and Confirmation Rules](ai-assisted-capture-and-confirmation-rules.md). |
| Transcription | Machine-produced text representation of recorded speech; not confirmed farm fact. |
| Inference | Machine-produced interpretation of source input, such as intent, item, location, quantity, unit, or detected count. |
| Draft record | Proposed structured activity or observation awaiting user review. |
| Draft interpretation | A proposed record not yet confirmed as a farm fact, including future voice/photo-assisted drafts. |
| Confirmation | A user action that accepts or corrects a proposed draft so it can become an operational record. |
| Correction | A later explicit change or adjustment to a retained operational record or its effects. A correction should not silently erase historical meaning. |
| Provenance | Information identifying how a confirmed record was created or supported, such as manual entry, voice-assisted draft, or photo-assisted count. |
| Interpretation correction feedback | Difference between proposed and confirmed fields, potentially useful for evaluation under later governance. |
| Supported capture workflow | A narrowly defined use case the system intentionally attempts to interpret. |
| Quantity | A measured or counted amount paired with a unit. |
| Unit | The expression of quantity, such as pounds, flats, crates, bags, each, feet, gallons, or another farm-relevant unit. |
| Inventory | The farm's understanding of available tracked materials or countable items based on recorded activities and observations. |
| Inventory observation | A count or measured observation about an item at a point in time. |
| Discrepancy | A difference between expected inventory and an observed count. |
| Supply need | A farm's recognized need for a material, input, equipment access, or other resource. |
| Need listing | An intentionally shared request derived from or created for a supply need. |
| Availability listing | An intentionally shared offer of a material, item, equipment access, or resource. This is conceptually related to need listings but deferred for the first slice unless product scope changes. |
| Local farm network | A trusted or selected set of nearby participants with whom listings may eventually be shared; access mechanics are deferred. |
| Sharing action | A deliberate user action that creates or publishes information for an audience beyond private farm use. |
| Visibility | The audience to whom a particular record or published representation is available. |
| Shared representation | A deliberately created limited view or listing derived from selected information, rather than exposure of the underlying private record. |
| Publication | Making a shared representation available to an intended audience after required confirmation and synchronization. |
| Withdrawal | Intentionally making an active shared listing no longer available to its audience, subject to synchronization state. |
| Response | A communication or indication of interest associated with a listing. |
| Fulfillment / resolution | The outcome that a need or availability listing has been met, withdrawn, expired, or otherwise closed. |
| Attachment | A photo, audio capture, document, or other associated file; technical storage behavior is deferred. |
| Sensitive attachment | A photo, audio recording, document, or other file that may disclose private or personal information. |
| Audit trail | Retained evidence that meaningful sharing, publication, or withdrawal actions occurred; detailed implementation is deferred. |
| Consent | Intentional agreement where later data uses, such as model evaluation or broader attachment sharing, require permission. |

## Terms to Avoid or Defer

The following terms should not become first-slice domain centers without later justification:

- Generalized "asset" as a user-facing replacement for crops, materials, equipment, or countable items.
- Marketplace.
- Transaction.
- Order.
- Payment.
- Compliance record.
- Prescription/treatment.
- Diagnosis.
- Workflow.
- Automation agent.

A later architecture or implementation layer may use technical terms where appropriate, but those terms should not displace farmer-facing domain language in product-facing concepts.

## Terminology Questions Requiring Validation

- Whether farms prefer "high tunnel," "hoophouse," or configurable local wording.
- Whether "material," "input," "supply," or multiple categories best match farmer usage.
- Whether "planting" sufficiently represents crop groups across diverse small farms.
- Whether "need listing" and "availability listing" are understandable terms for coordination.
- Which units are commonly used for high-value first-slice workflows.
