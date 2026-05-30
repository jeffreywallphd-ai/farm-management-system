# AI-Assisted Capture Boundaries

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: architecture boundaries separating AI inference, drafts, confirmation, operational records, offline retention, attachments, privacy handoff, and model-evaluation constraints
- Related ADRs: [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0013](../adr/ADR-0013-on-device-farm-note-transcription-with-whisper-rn.md)
- Related docs: [AI-Assisted Capture and Confirmation Rules](../domain/ai-assisted-capture-and-confirmation-rules.md), [AI-Assisted Capture Validation Plan](../product/ai-assisted-capture-validation-plan.md), [Privacy, Visibility, and Sharing Rules](../domain/privacy-visibility-and-sharing-rules.md), [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md), [Offline-First Mobile Architecture](offline-first-mobile-architecture.md), [Synchronization Architecture](synchronization-architecture.md), [Persistence and Attachment Storage](persistence-and-attachment-storage.md)
- Related tests: not yet implemented
- Supersedes: none

## Architecture Purpose

AI-assisted capture is a boundary capability that transforms user-provided source captures into reviewable drafts. It does not own or redefine the operational-record domain.

Structured AI-assisted capture remains Mobile Pilot 2 or later, not Mobile Pilot 1. ADR-0013 accepts a narrower Mobile Pilot 1B review aid: manually requested on-device transcription of a saved farm-note voice memo into a local draft transcript after the local Whisper model has been installed. That transcript is not a confirmed operational record, does not extract structured facts, and does not authorize server inference, external provider transfer, synchronization of captures, publication, or model-provider APIs. Local transcription failures must preserve the original audio and report safe, actionable categories rather than exposing stack traces, private note text, transcript text, or raw media contents.

```text
User Intentional Capture
        |
Source Capture Retention, if required
        |
Transcription / Vision Inference / Structured Interpretation
        |
Reviewable Draft
        |
Explicit User Confirmation or Correction
        |
Confirmed Operational Record
        |
Ordinary Local Retention and Synchronization Lifecycle
```

## Separation of Concerns

| Concern | Responsibility |
| --- | --- |
| Capture initiation | User intentionally begins voice or photo workflow |
| Source capture | Audio/photo collected for the requested workflow |
| Interpretation capability | Produces proposed transcript, detections, fields, or count |
| Draft assembly | Maps permitted interpretation into a reviewable draft for a supported operational record |
| User review/confirmation | Establishes whether a draft becomes a confirmed record |
| Operational-record system | Retains confirmed farm activity/observation according to domain rules |
| Offline/synchronization system | Retains and synchronizes confirmed records and permitted attachments according to existing architecture |
| Privacy/sharing system | Governs who may access source captures, drafts, records, and shared listings; defined conceptually in privacy/sharing docs |
| Evaluation/model-improvement process | Assesses performance and later use of corrected captures; governed separately and never assumed by default |

## Core Architectural Invariants

1. Model/inference output cannot directly create a confirmed operational record.
2. Model/inference output cannot directly modify inventory understanding.
3. Model/inference output cannot directly publish, message, purchase, reserve, or create external commitments.
4. Confirmed AI-assisted records must pass through the same operational-record rules as equivalent manually entered records.
5. Source capture, draft, confirmation, and confirmed record must remain distinguishable.
6. A failed or unsupported interpretation must fail safely into manual completion, retry, or discard, not fabricated certainty.
7. AI-assisted workflows must remain compatible with the offline-first field requirement for whichever first-slice workflows claim offline support.
8. Photo and audio attachments must remain private unless explicitly permitted through later sharing rules.
9. Model evaluation or training use of captured farmer data must not be assumed merely because the data was captured for operational use.
10. Future implementation must expose enough provenance to diagnose incorrect interpretations without forcing the user to understand internal model behavior.

## Voice-Assisted Capture Architecture Boundary

A voice-assisted record workflow must conceptually support:

```text
User selects or initiates voice activity capture
-> Audio is captured intentionally
-> Speech is transcribed or interpreted
-> Supported operational-record fields are proposed
-> Unknown or ambiguous fields remain unresolved or visibly uncertain
-> User reviews and confirms/edits/discards
-> On confirmation, an ordinary operational record is created
```

Required boundaries:

- Voice capture may be scoped to a selected action, such as "record harvest," to reduce ambiguity.
- The system must not assume arbitrary open-ended voice commands are supported.
- Transcription and intent extraction are separate from confirmation.
- If a spoken statement falls outside supported workflows, the system should not create an unrelated record.
- Offline capability expectations must align with the product documents and be explicitly stated.
- Later implementation may use rules, a constrained local model, a hosted model, or combinations, but must satisfy the same trust boundaries.

## Photo-Assisted Count Architecture Boundary

A photo-assisted count workflow must conceptually support:

```text
User intentionally selects a supported count type
-> Photo is captured
-> Counting inference produces proposed count and, if useful, visible detected regions
-> User reviews the count and corrects or confirms
-> On confirmation, an ordinary inventory-count observation is created
```

Required boundaries:

- User should select or confirm the object category rather than require arbitrary identification.
- The supported count category must be explicitly permitted by current product scope.
- The system should present enough information to enable meaningful correction, such as proposed count and possibly overlays later.
- Poor image quality, excessive occlusion, or unsupported scenes must not yield silently trusted counts.
- A confirmed count is an inventory observation, not an automatic correction of all expected inventory history.
- Photo-count inference does not imply crop identification, disease diagnosis, yield estimation, or unrestricted computer vision.

## Offline Architecture Posture

For first-slice workflows intended to function offline:

- A source capture may be collected while offline.
- A draft may be produced while offline only if the chosen later implementation supports local inference, or may remain pending interpretation until connectivity returns if product testing allows that limitation.
- The canonical product documents must clearly state the user-visible expectation before implementation.
- Once a user confirms an operational record offline, that record follows the same local-retain-and-sync lifecycle as a manually confirmed record.
- Source attachments may remain pending transfer independently from the confirmed record.
- The application must not misrepresent an unprocessed or unconfirmed offline capture as a saved farm activity.

Open design question:

> Whether first-release voice/photo interpretation must run fully offline or whether offline capture may wait for later interpretation must be validated against actual farmer workflow value and later decided in architecture/ADR work. Private manual operational recording remains offline-required regardless.

Existing canonical product documents require reviewable AI-assisted drafts but do not require full offline AI interpretation.

## Source Capture and Attachment Boundary

- Audio and photos are potentially sensitive farm data.
- Local retention may be needed for review, retry, provenance, or later transfer.
- A confirmed operational record may be meaningful even when a source attachment has not yet synchronized, depending on future policy.
- Attachments must remain linked to the appropriate draft or confirmed record when retained.
- Discarded drafts require later policy on whether associated captures are immediately removed, temporarily retained for recovery, or retained only with user consent.
- Exact retention/deletion/storage/encryption rules are deferred to privacy and implementation work.

## Interpretation/Provenance Metadata Boundary

| Category | Why it matters |
| --- | --- |
| Capture method | Distinguishes manual, voice-assisted, and photo-assisted entry |
| Supported workflow type | Identifies which bounded interpretation task was requested |
| Proposed fields/count | Enables review and later evaluation |
| Confirmed fields/count | Establishes user-approved operational meaning |
| Correction indication | Shows whether the user changed the draft |
| Capture timestamp | Supports operational context and debugging |
| Confirmation timestamp | Establishes when user accepted the record |
| Model/inference version, later | Enables evaluation and regression analysis |
| Failure/rejection outcome | Helps identify unusable workflows |

This is conceptual architecture only; exact schemas and retention policies are deferred.

## Confidence and Uncertainty Boundary

Confidence information may support review but must not replace confirmation.

- No confidence threshold should silently convert a draft into a confirmed record.
- High-confidence output remains a draft.
- Low-confidence output may require additional review, selection, manual completion, or rejection.
- Confidence presentation must avoid misleading nontechnical users.
- Exact thresholds and UI behavior require later product testing and implementation decisions.

## Privacy and Authorization Handoff

[Privacy, Visibility, and Sharing Rules](../domain/privacy-visibility-and-sharing-rules.md) and [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md) establish that source captures, drafts, provenance, and confirmed internal records are private by default. Remaining detailed questions include:

- Who may access source audio/photos?
- Are captures synchronized automatically after confirmation or only under explicit settings?
- Are captures retained after operational record creation?
- Can farm administrators access worker source captures?
- Can a user delete a capture while preserving the confirmed operational record?
- Can any capture or inferred result appear in a shared listing?
- What consent governs model evaluation or future training use?
- What redaction or sensitive-location protections are needed?

Invariant:

> Source audio, source photos, interpretation drafts, and confirmed internal operational records are private farm data and must not be shared externally by default.

## Failure Handling and Safe Degradation

| Failure condition | Safe product posture |
| --- | --- |
| No usable transcription produced | Preserve or discard source according to user choice/policy; allow manual entry |
| Transcript produced but activity unsupported | Do not create record; guide user to supported/manual entry |
| Required field missing | Present incomplete draft requiring user input |
| Multiple crop/location/item matches | Require user selection or correction |
| Photo too unclear for useful count | Do not present trusted count; allow retry/manual count |
| Inference unavailable offline | Clearly indicate pending/unavailable interpretation; do not imply a record exists |
| Attachment transfer fails later | Preserve confirmed record and surface attachment-sync status according to later policy |
| User rejects interpretation | No operational effect; source retention governed later |

## Implementation Technology Deliberately Deferred

This architecture now chooses `whisper.rn`/`whisper.cpp` for the narrow saved-note draft transcription path in ADR-0013. It still does not choose:

- Platform-native speech APIs.
- Server-based speech processing.
- Small intent models.
- Large language models.
- Computer-vision model architecture.
- ONNX, LiteRT, Core ML, or other runtimes.
- Cloud AI providers.
- Dataset/training pipeline.
- Inference APIs.
- Model update mechanism.

Any future technology choice must satisfy the trust, offline, privacy, correction, and provenance constraints documented here.
