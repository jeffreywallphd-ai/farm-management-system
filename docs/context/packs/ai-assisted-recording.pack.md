# Context Pack: AI-Assisted Recording

- Pack name: `ai-assisted-recording`
- Status: active
- Last reviewed: 2026-05-28
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents work on voice-assisted entry, transcription, intent extraction, photo counting, model inference, capture provenance, draft review, confirmation, and AI-related evaluation.

## Use When

- Transcription or intent/entity extraction.
- Camera counting or visual inference.
- Inference provider evaluation.
- AI workflow UI.
- Draft, correction, confirmation, or rejection behavior.
- Provenance or model-evaluation design.
- AI attachment/capture handling.

## Do Not Use When

- Manual-only workflows have no AI/capture/provenance impact.
- Dependency evaluation has no AI/provider/data-transmission aspect.
- The task is general privacy work unrelated to AI or captures.

## Core Guidance

- Source capture, inference, draft, confirmation, and confirmed operational record are distinct.
- ADR-0012 authorizes local voice/photo source capture for farm events without authorizing structured AI interpretation.
- ADR-0013 authorizes manually requested on-device transcript drafts for saved farm-note voice memos using `whisper.rn`/`whisper.cpp`, with original audio as source of truth. The app may download the approved `tiny.en` model to local app storage; audio is still not sent to a server. Transcription failure handling should distinguish local model, native-module, audio-file, unsupported-format, and runtime failures without exposing private content.
- No inference has operational, inventory, publication, messaging, or external-sharing effect before explicit confirmation.
- Confirmed AI-assisted records follow ordinary operational-record and privacy rules.
- Voice/photo are capture methods, not farm event types.
- A capture-first farm event may contain audio/photo attachments and light context without becoming an AI draft or a structured operational record.
- Ambiguous or failed interpretation must allow correction, manual completion, retry, or discard.
- Source audio/photos and provenance are private by default.
- Captured data is not automatically authorized for training or external provider transmission.
- High-stakes agronomic, treatment, disease, surveillance, and broad computer-vision uses are excluded.

## Non-Negotiable Constraints

- [ADR-0003](../../adr/ADR-0003-ai-interpretations-require-confirmation.md): no unconfirmed AI operational effects.
- [ADR-0004](../../adr/ADR-0004-private-by-default-intentional-sharing.md): AI cannot select audience or publish; captures stay private by default.
- [ADR-0001](../../adr/ADR-0001-offline-first-field-operation.md): confirmed supported records follow offline retention when captured offline.

## Decisions Still Deferred

Structured extraction model/runtime, external provider use, confidence thresholds, model-training pipeline, and model-training consent implementation remain deferred. Basic local capture retention is accepted for ADR-0012, and local draft transcription technology is accepted only for ADR-0013 saved farm-note review.

## Explicit Non-Goals / Overreach to Avoid

Do not implement autonomous records, automatic inventory updates, automatic publication, disease diagnosis, treatment recommendations, arbitrary object recognition, worker monitoring, or model training from farm captures without later explicit governance.

## Canonical Source Documents and ADRs

- `docs/domain/ai-assisted-capture-and-confirmation-rules.md`: AI domain states and standalone-pilot capture boundaries.
- `docs/architecture/ai-assisted-capture-boundaries.md`: inference/draft/confirmation architecture.
- `docs/product/ai-assisted-capture-validation-plan.md`: hypotheses and expansion gates.
- `docs/architecture/persistence-and-attachment-storage.md`: source capture and attachment handling.
- `docs/domain/privacy-visibility-and-sharing-rules.md`: capture and draft privacy.

## Required Standards

- `docs/standards/testing-and-verification-standards.md`
- `docs/standards/security-and-privacy-engineering-standards.md`
- `docs/standards/dependency-and-supply-chain-standards.md`
- `docs/standards/accessibility-and-field-usability-standards.md`
- `docs/standards/change-impact-matrix.md`

## Required Documentation Impact Review

Review AI product/domain/architecture docs, privacy docs, attachment docs, and the readiness register if workflow scope, inference location, retention, provider, provenance, or confirmation behavior changes.

## Required Verification Impact Review

Future implementation must verify draft-only inference, correction/confirmation, rejection with no effect, safe failure, no AI publication, no capture sharing by default, and usability/correction burden.

## Prompt Assembly Notes

Common companions: `mobile-field-capture`, `product-and-domain`, `privacy-and-sharing`, `offline-sync`, `testing-and-diagnostics`, or `dependency-and-technology-selection` for provider/runtime work.
