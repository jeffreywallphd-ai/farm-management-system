# SQLite

This folder is for future `expo-sqlite` adapters that implement application repository ports.

SQLite access belongs behind repositories/adapters and must not be called from UI components.

Governed by ADR-0009, `docs/architecture/offline-first-mobile-architecture.md`, and `docs/architecture/persistence-and-attachment-storage.md`.

Do not implement synchronization metadata, outbox/inbox, server acceptance, or cross-device behavior for Mobile Pilot 1.
