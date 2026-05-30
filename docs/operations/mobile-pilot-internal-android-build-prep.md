# Mobile Pilot Internal Android Build Preparation

This checklist prepares an internal Android farmer-test build. It does not start farmer testing by itself.

## Build Scope

- Build target: Android internal distribution APK through EAS Build.
- Build profile: `preview` in `apps/mobile/eas.json`.
- Owner-run command from `apps/mobile`: `eas build --platform android --profile preview`.
- The build remains native-only. Web support, server functionality, synchronization, accounts, telemetry, cloud backup, and AI are not part of this build.

## Before Building

1. Run `npm ci`.
2. Run `npm run typecheck`.
3. Run `npm test`.
4. Run `npx expo install --check`.
5. Run `npx expo-doctor`.
6. Run `npx expo export --platform android`.
7. Complete the physical-device smoke checklist in `apps/mobile/src/testing/phase-3-manual-smoke-test.md`.

## Build Notes

- The `preview` profile uses EAS internal distribution and Android APK output for direct device installation.
- Do not add Play Store submission, production release tracks, user accounts, analytics, remote backup, server endpoints, or synchronization as part of this build-prep step.
- Keep the build link limited to the intended internal testers.

## Release Smoke Test

After installing the APK on a physical Android device:

1. Open the app offline.
2. Create or verify farm setup and farm places.
3. Record a voice note with at least one photo.
4. Review the note in the farm-note timeline and detail screen.
5. Record one harvest, one material-use record, and one inventory-count observation.
6. Confirm unified activity history still shows manual records correctly.
7. Create the manual JSON recovery copy.
8. Create the media recovery ZIP package.
9. Confirm no UI claims AI interpretation, upload, synchronization, cloud backup, accounts, listings, or messaging.
