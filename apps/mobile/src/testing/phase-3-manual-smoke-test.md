# Phase 3 Manual Mobile Pilot Smoke Test

Use this checklist on a physical Android test device before farmer distribution preparation.

1. Run the app through Expo Go or the accepted development-build path. Use a development build when validating `whisper.rn` transcription, because Expo Go does not include that native module.
2. Confirm no warnings appear for `AppBootstrap.tsx`, `FarmRouteGate.tsx`, or `DatabaseProvider.tsx` as route files.
3. Confirm no `Couldn't find any screens for the navigator` error occurs.
4. Confirm the initial dashboard or setup screen renders.
5. Confirm the `Farm Notes` header is visible.
6. Open and close the hamburger menu.
7. Confirm the menu navigates to `Record farm note`, `Farm notes timeline`, `Farm setup`, `Activity history`, and `Recovery copy`.
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
20. Add one countable item.
21. Enable airplane mode.
22. Tap `Record farm note`.
23. Grant microphone permission when prompted.
24. Record a short voice memo.
25. Stop recording and play the memo back.
26. Take a photo and confirm it appears as a preview.
27. Choose an existing photo and confirm it appears as a preview.
28. Remove one selected photo and confirm it is not saved with the farm note.
29. Add at least two photos, optional farm place/type/text context, then save the farm note.
30. Open `Review farm notes`.
31. Confirm the saved note appears in newest-first order.
32. Filter farm notes by type, place, and date.
33. Open the note detail and confirm voice playback, both photo previews, note text, place, time, and private/local wording are understandable.
34. Close and relaunch the app while offline.
35. Open the same previous note again and confirm the voice memo still plays and both photos still appear.
36. If a photo file has been removed from the device, confirm the UI says `Photo unavailable on this device.`
37. Confirm the local transcription model panel appears near the voice memo.
38. With no model installed, confirm the app offers `Download transcription model` and explains the model stays on the phone.
39. Download the model over Wi-Fi and confirm progress appears.
40. After download succeeds, enable airplane mode and tap `Transcribe voice memo`.
41. Confirm a `Transcript draft` appears and persists after relaunch.
42. If the model is missing, corrupt, or the app is not a development build, confirm the app shows a clear unavailable/repair state and the original audio still plays.
43. Confirm transcript wording says generated/draft/local and does not imply a confirmed farm record.
44. Confirm the screen does not claim cloud transcription, structured AI interpretation, upload, or sharing.
45. Record a harvest using a nested farm place.
46. Record material use using a farm-place path.
47. Record an inventory count of `0`.
48. Record another inventory count greater than zero.
49. Confirm blank inventory count is rejected.
50. Confirm all save confirmations communicate device-local storage.
51. Open unified local activity history.
52. Confirm all three manual record types appear.
53. Confirm newest-first ordering.
54. Open each manual record type's detail view.
55. Confirm values, labels, and private/local wording are understandable.
56. Create a recovery copy.
57. Confirm native share/save behavior opens.
58. Inspect JSON where practical and confirm it includes farm, locations with kind/parent relationships, tracked items, harvest records, material-use records, inventory-count records, and export/schema metadata.
59. Create a media recovery package and confirm native share/save behavior opens for a ZIP file.
60. Inspect the package where practical and confirm it includes metadata plus saved voice memo files, photo files, and transcript drafts when present.
61. Confirm export messaging states that data is private and not uploaded automatically.
62. Cancel or fail a share action and confirm locally retained records remain unchanged.
63. Confirm no UI suggests synchronization, server connection, accounts, cloud backup, structured AI extraction, listing publication, or messaging.
64. Confirm touch targets, validation messages, contrast, recording controls, playback, photo controls, transcript states, timeline filters, header/menu, and form behavior are workable on a physical device.
65. Record any usability concerns before distribution preparation.
