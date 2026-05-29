# Application

This folder is for Mobile Pilot 1 use-case orchestration and ports.

Application code may coordinate domain types, repositories, validation, and UI requests once behavior is implemented. It should not contain React components, direct SQLite calls, native file sharing calls, or server/network behavior.

Governed by `docs/product/mobile-pilot-1-implementation-scope.md`, `docs/domain/mobile-pilot-1-operational-records.md`, and `docs/operations/mobile-pilot-data-safety-requirements.md`.

Deferred: synchronization, outbox, AI capture, authentication, shared publication, and non-Pilot-1 use cases.
