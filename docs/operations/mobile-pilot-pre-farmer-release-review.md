# Mobile Pilot Pre-Farmer Release Review

This review gates the completed voice/photo-first Mobile Pilot 1 before internal farmer sharing.

## Current Readiness

The app is ready for owner-run physical-device release checks after local validation passes. Farmer sharing should not begin until the Android preview build is installed on a real device and the smoke test passes.

## What Must Be Verified On Device

1. Fresh install opens without Expo Router route warnings.
2. Farm setup, farm places, crops, materials, and countable items persist after relaunch.
3. Voice memo recording works in airplane mode.
4. Photo capture and photo picker work with clear permission prompts.
5. Farm notes save locally and appear in the farm-note timeline.
6. Farm-note detail plays audio and previews photos.
7. Manual harvest, material-use, and inventory-count workflows still work.
8. Manual JSON recovery copy opens the native share/save flow.
9. Media recovery ZIP package opens the native share/save flow and contains metadata plus retained media files.
10. Cancelling share/save does not delete local records or media.
11. No UI claims transcription, AI interpretation, upload, synchronization, accounts, cloud backup, analytics, listings, or messaging.

## Known Non-Goals For This Gate

- No farmer distribution is performed by this review.
- No app-store track, Play Store configuration, or production release is created.
- No telemetry, analytics, accounts, server, synchronization, AI, cloud backup, or remote restore is added.

## Release Decision Rule

Proceed to internal farmer sharing only if:

- automated validation passes;
- the physical-device checklist passes;
- the owner can create and inspect a media recovery package;
- farmers can be told plainly that data stays on the device unless they choose to export it.

If any of those fail, correct the defect before sharing the build.
