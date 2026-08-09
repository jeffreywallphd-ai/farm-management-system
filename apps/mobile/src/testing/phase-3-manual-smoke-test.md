# Phase 3 Manual Mobile Pilot Smoke Test

Use this checklist on a physical Android test device before farmer distribution preparation.

1. Run the app through Expo Go or the accepted development-build path. Use a development build when validating `whisper.rn` transcription, because Expo Go does not include that native module.
2. Confirm no warnings appear for `AppBootstrap.tsx`, `FarmRouteGate.tsx`, or `DatabaseProvider.tsx` as route files.
3. Confirm no `Couldn't find any screens for the navigator` error occurs.
4. Confirm the initial dashboard or setup screen renders.
5. Confirm the app header is visible.
6. Open and close the hamburger menu.
7. Confirm the menu navigates to `Quick record farm events`, `Inventory management`, `Farm planning`, `Manage farm tasks`, `Farm setup`, and `Organic certification`.
8. Start with a fresh local database.
9. Confirm earthy UI styling is readable and consistent.
10. Create a farm.
11. Confirm the next screen emphasizes `Set up your farm places`, not operational recording.
12. Add `Field 1`.
13. Add `Bed 1` inside `Field 1`.
14. Add `Row 1` inside `Bed 1`.
15. Add `Greenhouse 1`.
16. Add `Bench 1` inside `Greenhouse 1`.
17. Confirm the farm-place tree is understandable.
18. Add one crop.
19. Add one material.
20. Add one crop or material that can be counted later.
21. Open `Inventory management`.
22. Tap `Add farm input`, choose an input category and common input item, enter an amount and unit, choose how it was added to inventory, then tap `Record material purchase` inside the add-input form.
23. Confirm the note type is `Material purchase`.
24. Record a short voice memo, take a photo of the material or label, take a photo of the storage place, save the farm note, and then save the farm input.
25. Tap `Add equipment`, choose an equipment category and common equipment item, confirm amount defaults to `1 each`, tap `Record equipment purchase` inside the add-equipment form, and confirm the note type is `Equipment purchase`.
26. Enable airplane mode.
27. Tap `Quick record farm events`.
28. Grant microphone permission when prompted.
29. Record a short voice memo.
30. Stop recording and play the memo back.
31. Take a photo and confirm it appears as a preview.
32. Choose an existing photo and confirm it appears as a preview.
33. Remove one selected photo and confirm it is not saved with the farm note.
34. Add at least two photos, optional farm place/type/text context, then save the farm event.
35. Open the farm event timeline from an implemented route or direct test link.
36. Confirm the saved event appears in newest-first order.
37. Filter farm notes by type, place, and date.
38. Open the note detail and confirm voice playback, both photo previews, note text, place, time, and private/local wording are understandable.
39. Close and relaunch the app while offline.
40. Open the same previous note again and confirm the voice memo still plays and both photos still appear.
41. If a photo file has been removed from the device, confirm the UI says `Photo unavailable on this device.`
42. Confirm the local transcription model panel appears near the voice memo.
43. With no model installed, confirm the app offers `Download transcription model` and explains the model stays on the phone.
44. Download the model over Wi-Fi and confirm progress appears.
45. After download succeeds, enable airplane mode and tap `Transcribe voice memo`.
46. Confirm a `Transcript draft` appears and persists after relaunch.
47. If transcription fails, record the displayed local cause. Expected safe messages include missing model, internal development build required, model could not be opened, saved voice memo unavailable, unsupported voice memo format, or generic runtime failure. Confirm the original audio still plays.
48. Confirm transcript wording says generated/draft/local and does not imply a confirmed farm record.
49. Confirm the screen does not claim cloud transcription, structured AI interpretation, upload, or sharing.
50. Record a harvest using a nested farm place.
51. Record material use using a farm-place path.
52. Record an inventory count of `0`.
53. Record another inventory count greater than zero.
54. Confirm blank inventory count is rejected.
55. Confirm all save confirmations communicate device-local storage.
56. Open unified local activity history.
57. Confirm all three manual record types appear.
58. Confirm newest-first ordering.
59. Open each manual record type's detail view.
60. Confirm values, labels, and private/local wording are understandable.
61. Create a recovery copy.
62. Confirm native share/save behavior opens.
63. Inspect JSON where practical and confirm it includes farm, locations with kind/parent relationships, tracked items, harvest records, material-use records, inventory-count records, and export/schema metadata.
64. Create a media recovery package and confirm native share/save behavior opens for a ZIP file.
65. Inspect the package where practical and confirm it includes metadata plus saved voice memo files, photo files, inventory purchase-note photos, and transcript drafts when present.
66. Confirm export messaging states that data is private and not uploaded automatically.
67. Cancel or fail a share action and confirm locally retained records remain unchanged.
68. Confirm no UI suggests synchronization, server connection, accounts, cloud backup, structured AI extraction, listing publication, messaging, accounting, authoritative stock reconciliation, or automatic stock adjustment from catalog amount/source fields or purchase notes.
69. Confirm touch targets, validation messages, contrast, recording controls, playback, photo controls, transcript states, timeline filters, header/menu, and form behavior are workable on a physical device.
70. Record any usability concerns before distribution preparation.
