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
- Local USDA organic certification readiness module: [ADR-0014](../../docs/adr/ADR-0014-organic-certification-readiness-module.md)
- Local farm planning foundation for goals, subgoals, assignment-ready tasks, task instructions, boards, and certification preparation: [ADR-0015](../../docs/adr/ADR-0015-local-farm-planning-foundation.md)
- Local GIS foundation for farm map settings and farm-owned GeoJSON geometry: [ADR-0016](../../docs/adr/ADR-0016-local-gis-map-and-geometry-foundation.md)
- Bundled Android heading fonts with `expo-font` for native builds.

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
- Organic Certification Phase 1: local organic operation profile, certification scope selection, organic dashboard, Organic Profile Report, and recovery-copy inclusion. This organizes records for certifier review and does not certify the farm or provide legal determinations.
- Organic Certification Phase 2: local organic place profiles, transition/boundary/buffer fields, boundary evidence records, place-level reports, and recovery-copy inclusion. Readable place paths are derived from the current farm-place hierarchy rather than snapshotted names.
- Organic Certification Phase 3: local organic input records, approval evidence references, input application records, input reports, and recovery-copy inclusion. Approval status is farmer-entered and not automatically verified against OMRI, WSDA, USDA, or certifier systems.
- Organic Certification Phase 4: local seed lots, commercial availability searches, planting events, seed reports, and recovery-copy inclusion. The app organizes evidence but does not automatically decide commercial availability sufficiency or seed acceptability.
- Organic Certification Phase 5: local soil fertility practices, compost batches and temperature logs, manure interval planning dates, crop rotations, soil reports, and recovery-copy inclusion. Manure dates are planning warnings, not automatic harvest blocks or compliance determinations.
- Organic Certification Phase 6: local pest/weed/disease observations, linked actions, input-escalation notes, plastic mulch records, reports, and recovery-copy inclusion. The app organizes hierarchy evidence but does not diagnose or prescribe treatments.
- Organic Certification Phase 7: local harvest lots, handling events, storage records, sale records, traceability reports, mass-balance review, and recovery-copy inclusion. The app organizes lot evidence but does not submit to certifiers, print labels, automate recalls, or make compliance determinations.
- Local Planning: device-local goals, child goals/subgoals, farmer-editable tasks, optional desired start dates, assigned farmhands, task instruction audio/photos, and farm-note/organic-record links. Planning remains local and does not add accounts, notifications, calendars, sync, analytics, or worker permissions.
- Organic Certification planning: seeded certification goals, 13 split subgoals, and detailed preparation tasks are shown inside the standalone Organic Certification area while using the shared local planning foundation. Task notes describe expected evidence for areas such as recordkeeping, land transition, input approvals, input applications, seeds and planting stock, soil fertility, hot/cold compost review, raw manure intervals, pest hierarchy, lot traceability, handling/storage/sales mass balance, and OSP drafting and recordkeeping. Dedicated evidence-review and package-generation workflows now cover inspection evidence and package assembly rather than duplicate seeded planning goals. Farmers can adjust certification timelines and task status without creating certifier submissions or compliance determinations.
- Local farmhand management: farmers can create and edit farmhands, keep private phone/notes/status details, open the device phone app from a call action, enter one current recurring or week-specific schedule from the selected farmhand's directory item with same-time or different-time batch entry, assign planning tasks to farmhands, filter farm work boards by All work or a specific farmhand, and include farmhand data in recovery exports. Farm setup controls the shared week-start preference used by calendar pickers and schedule Week Of dates. This does not add worker accounts, messaging, payroll, timeclock, sync, notifications, or a companion app.
- Basic GIS foundation: local farm map settings, saved address text, manual farm-center coordinates, optional foreground GPS helper, optional address geocoding helper, farm center stored as GeoJSON point geometry, basic point/polygon place geometry editing from Farm places, place linking, optional geometry-specific map-view settings, geometry archiving, explicit MapLibre full-screen online imagery editor with simple season-layer switching, map-centered point placement, map-centered polygon corner placement, selectable draggable polygon vertices, local Turf-backed polygon edge distance estimates in rebuilt development apps, Expo Go coordinate/manual fallback, and recovery-copy inclusion. Production online basemap selection, dependable national fall leaf-off imagery, farmer-selectable imagery dates, offline tile packs, advanced GIS editing beyond simple vertex dragging, and map-linked farm-note GPS capture are not implemented yet.
- Organic Certification Phase 8: local Organic System Plan section drafts, certification preparation tasks, OSP/inspection reports, and recovery-copy inclusion. The app organizes draft evidence but does not submit certifier forms or score compliance.
- Organic Certification Phase 9: local organic report package generation with manifest, combined report text, package preview warnings, saved package records, local PDF export for saved packages, and recovery-copy inclusion. The app does not upload packages, create signed certifier files, or bundle media automatically.
- Organic Certification Phase 10: local advanced-scope readiness records for livestock, wild crops, mushrooms, producer groups, imports, and labeling/product claims. These are specialty-scope notes for certifier review, not full compliance modules.
- Zod validation for setup/reference names, tracked item kinds, manual record inputs, and recovery-copy export payloads.
- A reusable earthy mobile UI foundation for setup, manual record, history, and data-safety screens.

## Planned But Not Implemented Yet

- Import or restore from a recovery copy.
- Strong cryptographic model verification. The app currently checks that the downloaded model exists and falls within the expected size range; SHA-256 verification remains a follow-up.
- Production online basemap tile configuration, dependable national fall leaf-off imagery, farmer-selectable imagery dates, offline map-pack download/delete flows, advanced GIS editing beyond simple vertex dragging, and map-linked farm-note GPS capture. The current GIS UI remains usable through manual entry and local coordinate display, with an explicit online full-screen imagery editor available in rebuilt development apps.
- Physical-device pre-distribution review before inviting farmer testers.

## Pilot Unit Vocabulary

Mobile Pilot 1 uses this small unit set for manual records: `lb`, `oz`, `kg`, `g`, `each`, `bunch`, `crate`, `bag`, `gal`, `L`, `flat`, and `tray`.

The app does not convert between units, calculate equivalencies, or present authoritative inventory totals.

## Farm Places

The app presents physical farm structure as `Farm places`, not generic locations. A farm place has a type, a farmer-facing name, and an optional parent place so the app can represent simple structures such as `Field 1 > Bed 1 > Row 1` or `Wash/Pack > Cooler`.

Supported place types are `Field`, `Bed`, `Row`, `Greenhouse`, `High tunnel`, `Greenhouse bed`, `Bench`, `Storage area`, `Wash/Pack area`, `Cooler`, `Freezer`, `Barn/Shed`, and `Other`.

Farm places remain private and device-local. ADR-0016 adds a separate local GIS foundation so farm-owned geometry can optionally link to a farm place without changing the ordinary place hierarchy model. Record forms use readable place paths, and recovery-copy export includes the place type, parent relationship, map settings, and farm-owned geometry needed to interpret nested places and spatial setup records.

## Deferred Capabilities

Do not add packages or implementation for server synchronization, server APIs, multi-device behavior, certifier submission, shared need-listing publication, responses/messaging, automatic AI extraction, authentication, cloud backup, analytics, telemetry, native map/geolocation providers beyond ADR-0016 boundaries, push notifications, ORM, or deployment tooling without later accepted scope and ADR work.

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

Android heading font binaries are not committed to git. To build the configured Android heading font bundle, place a properly licensed Garamond or Times New Roman-compatible `.ttf` file at `apps/mobile/assets/fonts/FazendioHeading.ttf`. When that file exists, the app registers it as the `FazendioHeading` family for logo, page heading, and card title text on Android.

Run the validation commands and physical-device smoke checklist before creating or sharing an internal build. This setup does not add web support, accounts, telemetry, server functionality, synchronization, cloud backup, or app-store distribution.

## Local Transcription Model

Saved farm notes with voice memos can download the local `Whisper tiny.en` model on first transcription use. The model source is:

```text
https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin
```

The app stores the model in app-controlled local storage at `transcription-models/ggml-tiny.en.bin`. The first download requires internet access and is about 78 MB. After the model is installed, transcription runs on the phone and can work offline. Audio and transcript text are not sent to a transcription server.

Expo Go cannot run this native transcription path. Use the EAS `development` APK profile for transcription testing.

The app passes app-stored `file://` URIs to normal playback and review UI, but converts them to native filesystem paths only at the `whisper.rn` adapter boundary. This keeps persisted attachment references stable while satisfying native transcription calls.
