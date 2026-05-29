# Farm Management Mobile Pilot

Mobile Pilot 1 is the standalone offline-first mobile app for farmer testing. It validates manual device-local recording, local activity history, clear saved-state communication, and user-controlled export/recovery copy before server-connected features exist.

## Accepted Stack

- Expo + React Native + TypeScript: [ADR-0008](../../docs/adr/ADR-0008-mobile-pilot-1-application-stack.md)
- Local persistence with `expo-sqlite` behind adapters/repositories: [ADR-0009](../../docs/adr/ADR-0009-mobile-pilot-1-local-persistence.md)
- Versioned JSON export/recovery copy through Expo FileSystem and Expo Sharing: [ADR-0010](../../docs/adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md)
- Runtime boundary validation with Zod: [ADR-0011](../../docs/adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md)

Package versions are intentionally unresolved until dependencies are installed with Expo-compatible tooling and a lockfile is created.

## Pilot 1 Records

Mobile Pilot 1 includes only:

- `HarvestRecorded`
- `MaterialUseRecorded`
- `InventoryCountRecorded`

Canonical record meaning lives in [Mobile Pilot 1 Operational Records](../../docs/domain/mobile-pilot-1-operational-records.md). TypeScript skeletons are implementation boundaries, not independent domain authority.

## Planned But Not Implemented Yet

- Minimal local farm setup, locations, crops, materials, and countable items.
- Manual entry for the three accepted records.
- Local activity history.
- Device-local saved-state clarity.
- Local SQLite persistence through repositories/adapters.
- Versioned JSON export/recovery copy.
- Zod validation at input, persistence, and export/import boundaries.

## Deferred Capabilities

Do not add packages or implementation for server synchronization, server APIs, multi-device behavior, shared need-listing publication, responses/messaging, AI capture, camera/audio, authentication, cloud backup, analytics, telemetry, maps/geolocation, push notifications, ORM, or deployment tooling without later accepted scope and ADR work.

## Folder Overview

| Path | Responsibility |
| --- | --- |
| `app/` | Expo Router entry files and app shell only |
| `src/app/` | App composition and navigation boundary |
| `src/domain/` | Farmer-centered domain types for accepted Pilot 1 concepts |
| `src/application/` | Use-case boundaries and ports |
| `src/infrastructure/` | Future adapters for SQLite, export, and validation |
| `src/ui/` | Future screens, components, and theme code |
| `src/testing/` | Future test fixtures and helpers |

## Local Development Notes

After dependencies are installed in a later setup step:

```text
npm install
npm run start
npm run typecheck
```

This scaffolding task does not install dependencies or create a lockfile.
