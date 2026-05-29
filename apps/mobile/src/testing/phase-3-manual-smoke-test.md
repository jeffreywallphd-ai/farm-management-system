# Phase 3 Manual Mobile Pilot Smoke Test

Use this checklist on a physical Android test device before farmer distribution preparation.

1. Open the app with an existing local farm setup.
2. Enable airplane mode and confirm the app still opens.
3. Record a harvest with a saved crop and location.
4. Record material use with a saved material.
5. Confirm missing material guidance appears when no material exists.
6. Record an inventory count for a material.
7. Record an inventory count for a countable item.
8. Confirm blank inventory count is rejected.
9. Confirm an intentional zero inventory count is accepted.
10. Confirm a crop cannot be selected as an inventory-count item.
11. Confirm all three record types appear in unified local activity history.
12. Confirm details are readable and record types are visibly distinct.
13. Close and relaunch the app; confirm setup data and records remain.
14. Create a recovery copy and inspect the JSON for farm, locations, tracked items, harvest records, material-use records, and inventory-count records.
15. Confirm recovery-copy messaging says data stays local unless the farmer chooses where to save or share the file.
16. Cancel the share/save flow and confirm local records remain unchanged.
17. Confirm no server, sync, AI, sharing, cloud, account, or distribution claims appear in farmer-facing screens.
18. Confirm the earthy UI remains readable outdoors, with comfortable touch targets and clear validation messages.
