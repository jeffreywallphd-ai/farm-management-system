# Farm Management Mobile Pilot

Mobile Pilot 1 is the standalone offline-first mobile app for farmer testing. It validates manual device-local recording, local activity history, clear saved-state communication, and user-controlled export/recovery copy before server-connected features exist.

Phase 1 implements minimal local farm setup and reference data. A farmer can create one device-local farm profile, add locations, crops, materials, and countable items, and reopen the app to see that setup data retained locally.

Phase 2 implements the first complete operational workflow: manual harvest recording, harvest history, read-only harvest detail, and a local versioned JSON recovery-copy export for farm setup/reference data and saved harvest records.

## Accepted Stack

- Expo + React Native + TypeScript: [ADR-0008](../../docs/adr/ADR-0008-mobile-pilot-1-application-stack.md)
- Local persistence with `expo-sqlite` behind adapters/repositories: [ADR-0009](../../docs/adr/ADR-0009-mobile-pilot-1-local-persistence.md)
- Versioned JSON export/recovery copy through Expo FileSystem and Expo Sharing: [ADR-0010](../../docs/adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md)
- Runtime boundary validation with Zod: [ADR-0011](../../docs/adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md)

Package versions are pinned in `package.json`, and `package-lock.json` records the app-local dependency resolution.

## Pilot 1 Records

Mobile Pilot 1 includes only:

- `HarvestRecorded`
- `MaterialUseRecorded`
- `InventoryCountRecorded`

Canonical record meaning lives in [Mobile Pilot 1 Operational Records](../../docs/domain/mobile-pilot-1-operational-records.md). TypeScript skeletons are implementation boundaries, not independent domain authority.

## Implemented Now

- Minimal local farm setup with a farm name.
- Local locations.
- Local tracked crops, materials, and countable items.
- SQLite-backed local persistence through the repository boundary.
- Manual `HarvestRecorded` creation using an existing crop and location.
- Local harvest history and read-only harvest detail.
- Local JSON recovery-copy file generation and device-native share/save flow for implemented harvest data.
- Zod validation for setup/reference names, tracked item kinds, harvest input, and recovery-copy export payloads.
- A reusable earthy mobile UI foundation for setup, harvest, history, and data-safety screens.

## Planned But Not Implemented Yet

- Manual `MaterialUseRecorded` entry.
- Manual `InventoryCountRecorded` entry.
- Unified multi-record activity history.
- Import or restore from a recovery copy.

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
| `src/ui/` | Mobile screens, components, and theme code |
| `src/testing/` | Future test fixtures and helpers |

## UI Foundation

The Phase 1 UI uses a calm earthy palette designed for repeated field use. Future mobile screens should use the centralized theme tokens in `src/ui/theme` rather than raw color values.

| Token | Color |
| --- | --- |
| `background` | `#F6F1E7` |
| `surface` | `#FFFCF6` |
| `surfaceMuted` | `#E6E2D5` |
| `primary` | `#2F4F3E` |
| `primaryPressed` | `#223B2E` |
| `secondary` | `#667A45` |
| `accent` | `#B45F45` |
| `accentPressed` | `#934833` |
| `textPrimary` | `#302A24` |
| `textSecondary` | `#62594E` |
| `border` | `#D4C8B5` |
| `success` | `#3F6B4E` |
| `warning` | `#986A24` |
| `error` | `#963F36` |
| `onPrimary` | `#FFFCF6` |
| `onAccent` | `#FFFCF6` |

Reusable components now include `Screen`, `PageHeader`, `Card`, `Button`, `FormField`, `SelectField`, `EmptyState`, `ListRow`, `LocalDataNotice`, `PrivateDataNotice`, `LocalSaveConfirmation`, and `SectionHeading`.

## Local Development Notes

```text
npm install
npm run start
npm run typecheck
npm test
```

`npm run start` uses the accepted development-build posture. Expo Go is not the assumed farmer-testing environment. Actual EAS farmer distribution configuration remains a later task.
