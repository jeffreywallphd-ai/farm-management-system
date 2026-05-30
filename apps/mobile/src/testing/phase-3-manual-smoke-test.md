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
19. Record a harvest using a nested farm place.
20. Record material use using a farm-place path.
21. Record an inventory count of `0`.
22. Record another inventory count greater than zero.
23. Confirm blank inventory count is rejected.
24. Confirm all save confirmations communicate device-local storage.
25. Open unified local activity history.
26. Confirm all three record types appear.
27. Confirm newest-first ordering.
28. Open each record type's detail view.
29. Confirm values, labels, and private/local wording are understandable.
30. Close and relaunch the app while offline.
31. Confirm farm setup, farm-place hierarchy, and all records remain available.
32. Create a recovery copy.
33. Confirm native share/save behavior opens.
34. Inspect JSON where practical and confirm it includes farm, locations with kind/parent relationships, tracked items, harvest records, material-use records, inventory-count records, and export/schema metadata.
35. Confirm export messaging states that data is private and not uploaded automatically.
36. Cancel or fail a share action and confirm locally retained records remain unchanged.
37. Confirm no UI suggests synchronization, server connection, accounts, cloud backup, AI, listing publication, or messaging.
38. Confirm touch targets, validation messages, contrast, and form behavior are workable on a physical device.
39. Record any usability concerns before distribution preparation.
