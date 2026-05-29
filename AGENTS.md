# Agent Instructions

## Project Orientation

This repository is for an open-source small-farm support platform intended to serve small farms. Field usability, offline operation, farm data ownership, and practical deployment options are central concerns.

Do not infer detailed technical architecture from this orientation. Server language, database strategy, mobile framework, synchronization design, deployment packaging, and AI model strategy require later canonical documentation and ADRs unless already accepted in this repository.

## Startup Sequence

For any non-trivial repository work, automated development agents must:

1. Read `docs/README.md`.
2. Read `docs/context/packs/index.pack.md`.
3. Read `docs/standards/change-impact-matrix.md`.
4. Use `docs/context/prompt-routing.md` to select relevant specialized packs, canonical documents, ADRs, and standards.
5. Inspect affected implementation and tests before changing code, once code exists.
6. Preserve accepted ADR constraints.
7. Update canonical documentation and affected context packs when durable behavior changes.
8. Report deferred decisions rather than silently selecting or implementing them.

The current accepted implementation target is Mobile Pilot 1, defined in `docs/product/mobile-pilot-1-implementation-scope.md`. Use the decision-readiness register and relevant ADRs before introducing server-connected, multi-device, hosted/local server, external-publication, AI-assisted, or additional-record scope.

## Authority Rule

`docs/product/`, `docs/domain/`, `docs/architecture/`, `docs/adr/`, `docs/standards/`, and `docs/operations/` contain canonical guidance according to their defined scopes.

`docs/context/` exists only to route and summarize task-relevant context for implementation work. Context packs must not silently redefine canonical rules. If context guidance conflicts with canonical documentation, canonical documentation governs and the inconsistent context file must be corrected.

Temporary implementation plans, task prompts, issue discussions, and chat history are not canonical repository policy unless intentionally promoted into canonical documentation.

## Restraint Rules

- Do not invent undocumented domain concepts or architecture policies silently.
- Do not broaden a narrowly scoped task into a generalized platform implementation.
- Do not add new abstraction layers, frameworks, packages, or deployment assumptions without a concrete need and appropriate documentation.
- Do not treat temporary implementation plans, prompt text, or chat history as canonical repository policy.
- Do not expose or share private farm operational data through future network-facing features unless canonical privacy/sharing rules explicitly permit it.
- Do not allow future AI-assisted capture features to silently create confirmed farm records unless canonical domain rules explicitly change that policy.
- Do not silently select technologies or deployment models that the decision-readiness register marks deferred.

Detailed automated-agent rules live in `docs/standards/ai-agent-development-standards.md`. Use `docs/standards/change-impact-matrix.md` to identify required documentation, ADR, verification, privacy, recovery, and validation review for behavior-changing work.
