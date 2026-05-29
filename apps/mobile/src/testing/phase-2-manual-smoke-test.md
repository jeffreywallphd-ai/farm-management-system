# Phase 2 Manual Smoke Test

- Status: active
- Last reviewed: 2026-05-29
- Scope: manual harvest recording, harvest history/detail, and recovery-copy export

Use this checklist on a physical device or emulator before relying on the Phase 2 workflow with real pilot data.

1. Open an existing local farm with at least one crop and one location.
2. Turn on airplane mode or otherwise disconnect the device from the network.
3. Tap `Record harvest`.
4. Confirm the screen explains that records are saved on this device.
5. Try to save without a crop, location, amount, or unit where possible and confirm clear validation messages.
6. Select a crop and source location.
7. Enter a positive amount and one of the supported units.
8. Add an optional note, then save.
9. Confirm the app shows `Harvest saved on this device`.
10. Confirm the saved harvest appears immediately in harvest history.
11. Open the harvest detail view and confirm crop, location, quantity/unit, date/time, note, and local/private status are correct.
12. Close and relaunch the app, then confirm the harvest remains in history.
13. Create a recovery copy and confirm the device share/save flow opens.
14. Confirm the export messaging says the data is private, local, and not uploaded automatically.
15. Cancel the share/save flow and confirm the saved harvest remains unchanged.
16. Review screen readability, touch targets, empty states, and validation messages in bright light where practical.

Do not use this checklist to validate material-use records, inventory-count records, restore/import, AI capture, server synchronization, authentication, shared listings, cloud backup, analytics, or deployment behavior; those remain outside Phase 2.
