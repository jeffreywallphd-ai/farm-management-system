# Farm Management Mobile Pilot

Mobile Pilot 1 is the standalone offline-first mobile app for farmer testing. It validates manual device-local recording, local activity history, clear saved-state communication, and user-controlled export/recovery copy before server-connected features exist.

Phase 1 implements minimal local farm setup and reference data. A farmer can create one device-local farm profile, add farmer-facing farm places, crops, materials, and countable items, and reopen the app to see that setup data retained locally.

Phase 2 implements the first complete operational workflow: manual harvest recording, harvest history, read-only harvest detail, and a local versioned JSON recovery-copy export for farm setup/reference data and saved harvest records.

Phase 3 completes the core manual Mobile Pilot 1 workflow set. Farmers can now record harvests, material use, and inventory counts, review those records in one local activity history, inspect read-only details, and create a local versioned JSON recovery copy for the implemented manual records and required reference data.

ADR-0012 pivots the next farmer-shareable pilot direction toward quick voice/photo farm-event capture. The app now supports local voice memos with optional local photos for farm notes, local timeline/detail review, and a user-controlled media recovery package containing retained media. ADR-0013 accepts `whisper.rn`/`whisper.cpp` as the on-device transcription path for draft farm-note transcripts. The app can download `ggml-tiny.en.bin` to local device storage and then transcribe saved voice memos offline in an internal Android development build.

## Accepted Stack

- Expo + React Native + TypeScript: [ADR-0008](../../docs/adr/ADR-0008-mobile-pilot-1-application-stack.md)
- Local persistence with `expo-sqlite` behind adapters/repositories: [ADR-0009](../../docs/adr/ADR-0009-mobile-pilot-1-local-persistence.md)
- Versioned JSON export/recovery copy through Expo FileSystem and Expo Sharing: [ADR-0010](../../docs/adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md)
- Runtime boundary validation with Zod: [ADR-0011](../../docs/adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md)
- Local voice memo recording with `expo-audio`: [ADR-0012](../../docs/adr/ADR-0012-voice-photo-first-farm-event-capture-pilot.md)
- Optional farm-note photo attachments with `expo-image-picker`: [ADR-0012](../../docs/adr/ADR-0012-voice-photo-first-farm-event-capture-pilot.md)
- On-device draft transcription path with `whisper.rn`/`whisper.cpp`: [ADR-0013](../../docs/adr/ADR-0013-on-device-farm-note-transcription-with-whisper-rn.md)

Package versions are pinned in `package.json`, and `package-lock.json` records the app-local dependency resolution.

`react-dom@19.1.0` is explicitly pinned only to stabilize Expo Router/npm peer dependency resolution under Expo SDK 54. The mobile pilot remains native-only; web application support is not part of Mobile Pilot 1.

## Pilot 1 Records

Mobile Pilot 1 includes only:

- `HarvestRecorded`
- `MaterialUseRecorded`
- `InventoryCountRecorded`

Canonical record meaning lives in [Mobile Pilot 1 Operational Records](../../docs/domain/mobile-pilot-1-operational-records.md). TypeScript skeletons are implementation boundaries, not independent domain authority.

## Implemented Now

- Minimal local farm setup with a farm name.
- Guided farm-place setup with place types and optional parent/child hierarchy.
- Local tracked crops, materials, and countable items.
- SQLite-backed local persistence through the repository boundary.
- Manual `HarvestRecorded` creation using an existing crop and location.
- Manual `MaterialUseRecorded` creation using an existing material and optional location.
- Manual `InventoryCountRecorded` creation using an existing material or countable item and optional location.
- Unified local activity history and read-only detail views for all three implemented manual records.
- Local JSON recovery-copy file generation and device-native share/save flow for implemented manual records and required reference data, including farm-place type and parent relationships.
- Farm-event capture metadata and local attachment-reference persistence foundation for ADR-0012 voice/photo work.
- Local voice memo recording, microphone permission request, playback, optional photo attachment, and farm-note save flow.
- Photo attachments are copied from picker/camera cache into durable app-owned local storage before the farm note is saved; older notes whose temporary files are no longer present show a per-photo unavailable state instead of hiding the note.
- Local farm-note timeline with type, place, and date filters plus read-only detail review with audio playback and photo previews.
- Persistent `Farm Notes` header with a hamburger menu for local navigation between capture, timeline, setup, activity history, and recovery copy.
- Saved farm-note detail includes a transcript-draft area, local model download controls, and a `Transcribe voice memo` action using the `whisper.rn` adapter. It downloads `ggml-tiny.en.bin` from the accepted `ggerganov/whisper.cpp` Hugging Face model source into app document storage under `transcription-models/`. If transcription fails, the app maps common local causes such as missing audio, model-open failure, unsupported audio format, or native-module unavailability to user-safe messages while preserving the original audio.
- ZIP media recovery package export containing manual JSON data, farm-note metadata, voice memo files, photo files, and transcript drafts when present.
- Zod validation for setup/reference names, tracked item kinds, manual record inputs, and recovery-copy export payloads.
- A reusable earthy mobile UI foundation for setup, manual record, history, and data-safety screens.

## Planned But Not Implemented Yet

- Import or restore from a recovery copy.
- Strong cryptographic model verification. The app currently checks that the downloaded model exists and falls within the expected size range; SHA-256 verification remains a follow-up.
- Physical-device pre-distribution review before inviting farmer testers.

## Pilot Unit Vocabulary

Mobile Pilot 1 uses this small unit set for manual records: `lb`, `oz`, `kg`, `g`, `each`, `bunch`, `crate`, `bag`, `gal`, `L`, `flat`, and `tray`.

The app does not convert between units, calculate equivalencies, or present authoritative inventory totals.

## Farm Places

The app presents physical farm structure as `Farm places`, not generic locations. A farm place has a type, a farmer-facing name, and an optional parent place so the app can represent simple structures such as `Field 1 > Bed 1 > Row 1` or `Wash/Pack > Cooler`.

Supported place types are `Field`, `Bed`, `Row`, `Greenhouse`, `High tunnel`, `Greenhouse bed`, `Bench`, `Storage area`, `Wash/Pack area`, `Cooler`, `Freezer`, `Barn/Shed`, and `Other`.

Farm places remain private and device-local. They do not include GIS boundaries, GPS, maps, acreage, bed dimensions, crop planning, or drag-and-drop layout editing. Record forms use readable place paths, and recovery-copy export includes the place type and parent relationship needed to interpret nested places.

## Deferred Capabilities

Do not add packages or implementation for server synchronization, server APIs, multi-device behavior, shared need-listing publication, responses/messaging, AI capture, camera/audio, authentication, cloud backup, analytics, telemetry, maps/geolocation, push notifications, ORM, or deployment tooling without later accepted scope and ADR work.

## Folder Overview

| Path | Responsibility |
| --- | --- |
| `src/app/` | Expo Router route files only; every page route must default-export a route component |
| `src/bootstrap/` | Application startup/composition and providers that are not routes |
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

Expo Router uses `src/app` as the route directory. Keep bootstrap code, providers, repositories, utilities, and reusable UI components outside `src/app` so they are not treated as pages.

## Local Development Notes

```text
npm install
npm run start
npm run typecheck
npm test
```

`npm run start` uses the accepted development-build posture. Expo Go is not sufficient for testing `whisper.rn` transcription or other native-module behavior.

## Internal Android Build Preparation

`eas.json` includes two internal Android APK profiles:

```text
npm run build:android:development
npm run build:android:preview
```

Equivalent EAS commands:

```text
eas build --platform android --profile development
eas build --platform android --profile preview
```

Use `development` for owner/developer testing with `expo-dev-client`. Use `preview` later for internal farmer/tester APKs when the app is ready for that audience. EAS login and project configuration are required on the machine that starts the build.

After EAS finishes, open the EAS build URL on the Android phone and install the APK. Android may ask the user to allow installation from that browser or file source. This is internal distribution only; it is not Google Play or app-store submission.

Whisper model binaries are not committed to git. Model files are ignored under `apps/mobile/assets/models/*.bin`, `apps/mobile/models/*.bin`, `apps/mobile/.models/`, and `apps/mobile/.transcription-models/`; runtime model files belong in app-controlled local storage on the device.

Run the validation commands and physical-device smoke checklist before creating or sharing an internal build. This setup does not add web support, accounts, telemetry, server functionality, synchronization, cloud backup, or app-store distribution.

## Local Transcription Model

Saved farm notes with voice memos can download the local `Whisper tiny.en` model on first transcription use. The model source is:

```text
https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin
```

The app stores the model in app-controlled local storage at `transcription-models/ggml-tiny.en.bin`. The first download requires internet access and is about 78 MB. After the model is installed, transcription runs on the phone and can work offline. Audio and transcript text are not sent to a transcription server.

Expo Go cannot run this native transcription path. Use the EAS `development` APK profile for transcription testing.

The app passes app-stored `file://` URIs to normal playback and review UI, but converts them to native filesystem paths only at the `whisper.rn` adapter boundary. This keeps persisted attachment references stable while satisfying native transcription calls.
