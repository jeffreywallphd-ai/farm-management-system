# ADR-0012: Voice/Photo-First Farm Event Capture Pilot

- Status: accepted
- Date: 2026-05-30
- Last reviewed: 2026-05-30
- Deciders: Product owner and implementation agents
- Canonical for: sequencing the next farmer-shareable standalone mobile pilot around quick voice/photo farm-event capture
- Related docs: [Mobile Pilot 1 Implementation Scope](../product/mobile-pilot-1-implementation-scope.md), [Roadmap](../product/roadmap.md), [Field Workflows](../product/field-workflows.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Persistence and Attachment Storage](../architecture/persistence-and-attachment-storage.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md)
- Supersedes: none
- Superseded by: none

## Context

The current mobile app has implemented a complete manual local core: farm setup, farm places, manual harvest records, material-use records, inventory-count observations, unified local history, and JSON recovery-copy export.

That foundation is useful, but it is not sufficiently differentiated from existing farm-management systems if the first farmer test primarily asks farmers to fill out cleaner structured forms. The more important near-term hypothesis is that farmers may capture useful farm information more often when they can quickly speak a memo and optionally attach photos while work is happening.

The project still must preserve the accepted constraints:

- The pilot remains standalone, offline-first, and device-local.
- Captures and records are private by default.
- No server synchronization, accounts, shared listings, cloud backup, analytics, or remote publication are introduced.
- AI interpretation remains deferred; no transcript, inferred field, count, or suggestion may create an operational effect without later explicit confirmation rules.

## Decision

The next farmer-shareable pilot will be voice/photo-first farm-event capture rather than manual-form-first recordkeeping.

The app should prioritize:

1. Opening quickly in the field.
2. One primary action: record a farm note.
3. Capturing a voice memo about what just happened.
4. Optionally attaching one or more photos.
5. Optionally adding light context such as farm place, event type, and note text.
6. Saving the event locally and privately.
7. Reviewing captured events in a local timeline.
8. Exporting a recovery package that includes metadata plus retained audio/photo files.

The existing manual harvest, material-use, and inventory-count workflows remain valid implemented foundation and may remain available. They are no longer the primary farmer-test differentiator.

This decision authorizes local source capture and attachment retention for the voice/photo farm-event pilot. It does not authorize AI transcription, computer vision, server upload, synchronization, authentication, cloud backup, analytics, shared listings, or farmer distribution configuration.

## Rationale

- Voice and photos fit the moment of farm work better than structured forms when attention, hands, light, weather, and connectivity are constrained.
- Capturing what farmers naturally say and photograph provides better discovery input before investing in extraction, automation, or more structured workflows.
- A local event timeline can validate whether captured context is useful before server or AI complexity exists.
- Keeping captures local/private reduces privacy and trust risk during early discovery.
- The existing manual pilot foundation gives useful reference data, place selection, local storage, validation, history, and export patterns for the capture-first workflow.

## Alternatives Considered

### Alternative: Keep manual forms as the first farmer-test differentiator

- Benefits: Already implemented; structured data is easier to validate and export.
- Drawbacks: Less differentiated; may test willingness to use forms more than willingness to capture farm knowledge in the moment.
- Reason not selected: The revised product hypothesis is about reducing capture friction, not perfecting form entry.

### Alternative: Implement AI transcription and photo interpretation immediately

- Benefits: More impressive demo; could create structured records faster if reliable.
- Drawbacks: Adds model/runtime/provider decisions, privacy risks, correction burden, and trust issues before capture behavior is validated.
- Reason not selected: The first capture-first pilot should learn what farmers capture before deciding what to interpret.

### Alternative: Build server sync or cloud backup before capture

- Benefits: Could reduce device-loss risk and support multi-device access.
- Drawbacks: Contradicts ADR-0007 sequencing and adds identity, hosting, synchronization, and privacy complexity.
- Reason not selected: Local capture and user-controlled recovery remain enough for the next standalone farmer test.

## Consequences

### Positive

- The next pilot tests a more differentiated product hypothesis.
- Voice/photo capture can be implemented without AI interpretation.
- Manual records remain useful but do not dominate the first farmer-facing experience.
- Local privacy boundaries remain clear.

### Negative / Tradeoffs

- Recovery export must expand beyond JSON-only metadata once audio/photo files are retained.
- Local file lifecycle and storage-pressure behavior become important.
- The UI must handle permissions, recording failures, and media previews without implying upload or backup.
- Farmer testing must evaluate capture usefulness, not just record correctness.

### Risks and Mitigations

- Risk: Users may assume voice memos are transcribed or analyzed.
  - Mitigation: UI and docs must state that captured memos/photos are saved for later review; AI interpretation is not implemented.
- Risk: Source captures may contain sensitive farm information.
  - Mitigation: Captures remain device-local/private and are included only in user-controlled recovery export.
- Risk: Export becomes incomplete if media files are omitted.
  - Mitigation: Future export work must package metadata and retained media together or clearly block readiness.
- Risk: Manual-record behavior drifts or regresses while capture work is added.
  - Mitigation: Existing manual workflows remain covered by validation and review prompts.

## Validation and Revisit Conditions

Revisit this decision if farmer testing shows:

- Voice memo capture is not meaningfully easier than structured entry.
- Photos create more review/storage burden than value.
- Farmers primarily want structured forms and reports instead of capture-first notes.
- Offline local-only retention is unacceptable without server backup.
- AI interpretation becomes necessary to make captured events useful.

## Documentation and Test Impact

The roadmap, Mobile Pilot 1 scope, field workflows, readiness register, context packs, offline architecture, persistence/storage guidance, and data-safety requirements must describe the voice/photo-first direction.

Implementation prompts following this ADR must add tests for event metadata, local attachment references, permissions, local file retention, timeline display, recovery package completeness, and privacy-safe failure behavior.
