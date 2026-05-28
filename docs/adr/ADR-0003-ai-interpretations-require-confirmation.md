# ADR-0003: AI-Assisted Interpretations Require User Confirmation

- Status: accepted
- Date: 2026-05-28
- Last reviewed: 2026-05-28
- Deciders: project owner and contributors
- Canonical for: AI-assisted capture trust boundary and draft-before-confirmation requirement
- Related docs: [AI-Assisted Capture and Confirmation Rules](../domain/ai-assisted-capture-and-confirmation-rules.md), [AI-Assisted Capture Boundaries](../architecture/ai-assisted-capture-boundaries.md), [AI-Assisted Capture Validation Plan](../product/ai-assisted-capture-validation-plan.md), [Operational Event Catalog](../domain/operational-event-catalog.md), [Inventory and Reconciliation Rules](../domain/inventory-and-reconciliation-rules.md)
- Supersedes: none
- Superseded by: none

## Context

Voice, transcription, image counting, and future AI interpretation can reduce field-entry burden, but they can also be wrong, ambiguous, or unsupported. The first-slice AI features are experiments, not autonomous farm authority.

Farm records and inventory effects must remain trustworthy.

## Decision

Source capture, inference, draft, confirmation, and confirmed operational record are distinct concepts.

AI output remains a draft until a user explicitly confirms or corrects it. An unconfirmed interpretation has no inventory, activity-history, publication, messaging, purchasing, or external-sharing effect.

A confirmed AI-assisted record follows the same domain and privacy rules as the equivalent manually entered record. Capture method and provenance are separate from the farm activity or observation represented.

## Rationale

Usability gains cannot come at the cost of silently fabricated operational history. Voice and camera inference require validation and can fail in farm conditions. Keeping AI subordinate to confirmation preserves trust and makes errors recoverable.

## Alternatives Considered

### Alternative: High-Confidence AI Auto-Confirms Records

- Benefits: faster entry when inference is correct.
- Drawbacks: creates operational effects without farmer review and can damage trust when wrong.
- Reason not selected: confidence cannot replace confirmation for farm facts.

### Alternative: Treat Voice or Photo Capture as Its Own Farm Event

- Benefits: easy to model capture activity.
- Drawbacks: confuses capture method with operational meaning.
- Reason not selected: the farm record is the activity or observation, not the capture mechanism.

## Consequences

### Positive

- Farmers retain control over operational records.
- AI experiments can be evaluated without risking silent inventory or sharing effects.
- Provenance can support debugging and later evaluation.

### Negative / Tradeoffs

- Assisted capture requires review/correction UI.
- Some possible automation speed is intentionally sacrificed for trust.

### Risks and Mitigations

- Risk: confirmation burden may make AI less useful.
- Mitigation: validation must measure correction burden and only expand workflows that reduce real work.

## Validation and Revisit Conditions

Farmer testing may refine which AI workflows are useful. This ADR should only be revisited if the project intentionally reconsiders autonomous operational actions with separate safety, privacy, and product analysis.

## Documentation and Test Impact

Future implementation must test that drafts have no operational effects, confirmation creates ordinary operational records, rejection leaves no farm-history effect, and publication cannot originate from AI interpretation alone.

This ADR does not decide model technology, inference location, fully offline interpretation requirement, confidence thresholds, capture retention policy, or model training/evaluation pipeline.
