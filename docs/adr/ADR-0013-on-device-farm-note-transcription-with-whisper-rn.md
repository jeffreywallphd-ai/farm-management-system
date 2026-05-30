# ADR-0013: On-Device Farm Note Transcription with whisper.rn

- Status: accepted
- Date: 2026-05-30
- Last reviewed: 2026-05-30
- Deciders: Product owner and implementation agents
- Canonical for: local draft transcription of saved farm-note voice memos
- Related docs: [ADR-0012](ADR-0012-voice-photo-first-farm-event-capture-pilot.md), [AI-Assisted Capture Boundaries](../architecture/ai-assisted-capture-boundaries.md), [AI-Assisted Capture and Confirmation Rules](../domain/ai-assisted-capture-and-confirmation-rules.md)

## Context

Mobile Pilot 1 now supports local voice/photo farm notes. Farmers need an easier way to review saved audio without sending private farm audio to a cloud service.

`whisper.rn` is a React Native binding for `whisper.cpp`. Current project documentation states that Expo usage requires prebuild/development-build handling, and transcription requires a local GGML model file.

## Decision

Farm-note transcription will use `whisper.rn` / `whisper.cpp` for on-device transcription when the native module and local model are available.

Initial model target is a small English Whisper model, preferably `tiny.en`; `base.en` may be evaluated only after device performance testing.

Transcription is initiated manually from a saved farm note. The output is stored locally as a generated draft transcript associated with the farm note and source voice memo attachment. Original audio remains the source of truth.

No audio or transcript is sent to an external server. This decision does not authorize AI extraction into structured farm records, cloud transcription, synchronization, model-provider APIs, photo counting, or confirmed operational facts derived from transcripts.

## Consequences

- Transcription requires native-module validation in a development/prebuild Android build, not Expo Go.
- A missing model must produce a clear unavailable state.
- Transcripts must be labeled as generated drafts/review aids.
- Recovery export must preserve transcript metadata/text without replacing original audio.

## Alternatives Considered

| Alternative | Reason not selected now |
| --- | --- |
| Cloud transcription API | Conflicts with offline/private pilot differentiator. |
| Platform proprietary speech APIs | Not open-source and offline behavior may be unclear. |
| `sherpa-onnx` | Strong fallback, but `whisper.rn` is closer to the current React Native path. |
| Vosk | Viable but less preferred for natural farm memos unless Whisper proves too heavy. |
| No transcription yet | Safe, but misses the requested review improvement. |

## Validation and Revisit Conditions

Revisit if:

- `tiny.en` is too slow, hot, or battery-heavy on target Android devices;
- audio format conversion is required and adds unacceptable complexity;
- model packaging is too large for the pilot;
- farmers find generated drafts misleading or not useful.
