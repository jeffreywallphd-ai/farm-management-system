# Phase 3 Manual Mobile Pilot Smoke Test

Use this checklist on a physical Android test device before farmer distribution preparation.

1. Run the app through Expo Go or the accepted development-build path.
2. Confirm no warnings appear for `AppBootstrap.tsx`, `FarmRouteGate.tsx`, or `DatabaseProvider.tsx` as route files.
3. Confirm no `Couldn't find any screens for the navigator` error occurs.
4. Confirm the initial dashboard or setup screen renders.
5. Start with a fresh local database.
6. Confirm earthy UI styling is readable and consistent.
7. Create a farm.
8. Confirm the next screen emphasizes `Set up your farm places`, not operational recording.
9. Add `Field 1`.
10. Add `Bed 1` inside `Field 1`.
11. Add `Row 1` inside `Bed 1`.
12. Add `Greenhouse 1`.
13. Add `Bench 1` inside `Greenhouse 1`.
14. Confirm the farm-place tree is understandable.
15. Add one crop.
16. Add one material.
17. Add one countable item.
18. Enable airplane mode.
19. Tap `Record farm note`.
20. Grant microphone permission when prompted.
21. Record a short voice memo.
22. Stop recording and play the memo back.
23. Take a photo and confirm it appears as a preview.
24. Choose an existing photo and confirm it appears as a preview.
25. Remove one selected photo and confirm it is not saved with the farm note.
26. Add optional farm place/type/text context.
27. Save the farm note and confirm the message says it was saved on this device.
28. Open `Review farm notes`.
29. Confirm the saved note appears in newest-first order.
30. Filter farm notes by type, place, and date.
31. Open the note detail and confirm voice playback, photo previews, note text, place, time, and private/local wording are understandable.
32. Confirm the screen does not claim transcription, AI interpretation, upload, or sharing.
33. Record a harvest using a nested farm place.
34. Record material use using a farm-place path.
35. Record an inventory count of `0`.
36. Record another inventory count greater than zero.
37. Confirm blank inventory count is rejected.
38. Confirm all save confirmations communicate device-local storage.
39. Open unified local activity history.
40. Confirm all three manual record types appear.
41. Confirm newest-first ordering.
42. Open each manual record type's detail view.
43. Confirm values, labels, and private/local wording are understandable.
44. Close and relaunch the app while offline.
45. Confirm farm setup, farm-place hierarchy, manual records, and the farm note metadata remain available where currently surfaced.
46. Create a recovery copy.
47. Confirm native share/save behavior opens.
48. Inspect JSON where practical and confirm it includes farm, locations with kind/parent relationships, tracked items, harvest records, material-use records, inventory-count records, and export/schema metadata.
49. Create a media recovery package and confirm native share/save behavior opens for a ZIP file.
50. Inspect the package where practical and confirm it includes metadata plus saved voice memo and photo files.
51. Confirm export messaging states that data is private and not uploaded automatically.
52. Cancel or fail a share action and confirm locally retained records remain unchanged.
53. Confirm no UI suggests synchronization, server connection, accounts, cloud backup, AI, listing publication, or messaging.
54. Confirm touch targets, validation messages, contrast, recording controls, playback, photo controls, timeline filters, and form behavior are workable on a physical device.
55. Record any usability concerns before distribution preparation.
