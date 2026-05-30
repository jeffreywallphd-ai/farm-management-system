# Mobile Pilot Final Release Gate

Use this gate immediately before sharing the internal Android build with farmers.

## Gate Verdict

Do not share the build until every required item below is complete.

## Required App Behavior

- Farm setup works from a fresh install.
- Farm places can be added and nested.
- Crops, materials, and countable items can be added.
- Voice notes can be recorded offline.
- Photos can be attached offline.
- Farm notes appear in the local timeline.
- Farm-note detail plays audio and displays photos.
- Manual harvest, material-use, and inventory-count records still work.
- Manual JSON recovery copy can be created.
- Media recovery ZIP package can be created and inspected.
- App restart preserves setup, manual records, farm-note metadata, and retained media.

## Privacy And Scope Checks

The app and onboarding materials must state clearly:

- data is saved on the device;
- the app does not upload automatically;
- recovery files contain private farm information;
- restore/import is not implemented yet;
- AI interpretation is not implemented;
- accounts, synchronization, cloud backup, analytics, listings, and messaging are not implemented.

## Install Path Checks

- Android preview build created from the `preview` EAS profile.
- Build installed successfully on at least one physical Android device.
- No Play Store or production distribution track is used for this pilot.
- Build link is shared only with intended internal testers.

## Known Limitations To Tell Farmers

- Voice notes are not transcribed.
- Photos are not analyzed.
- Recovery files must be saved manually.
- Recovery import/restore is not available yet.
- Data is local to one device.
- Losing the device or app data can lose records unless the farmer has exported a recovery package.

## Rollback Plan

If a serious issue appears:

1. Stop sharing the build link.
2. Ask testers not to rely on the app for required farm records.
3. Ask testers to create a media recovery package if the app still opens.
4. Record the issue, device, build, and reproduction steps.
5. Fix the defect before adding more testers.

## Final Go/No-Go

Go only if:

- automated validation passes;
- physical-device smoke test passes;
- recovery package inspection succeeds;
- onboarding and privacy wording are ready;
- known limitations have been communicated.

No-go if:

- local media is lost after save;
- recovery package cannot be created;
- farmers misunderstand the app as cloud-backed or AI-assisted;
- install flow fails on test devices;
- any workflow requires network access unexpectedly.
