# UI

This folder is for future Mobile Pilot 1 screens, components, and theme code.

UI must use farmer-understandable language, remain usable in field conditions, and clearly communicate local saved/device-local status and export/recovery-copy limitations.

Governed by `docs/product/field-workflows.md`, `docs/product/mobile-pilot-1-implementation-scope.md`, and `docs/standards/accessibility-and-field-usability-standards.md`.

When editing existing records from a list, timeline, dashboard, setup, planning, or certification page, keep the form local to the selected item. Hide edit forms until the user taps a large labeled edit action, render the edit form directly below that action in the same row/card/detail block, and close it after Save or Cancel. Do not add a single stationary edit form far from the item being edited unless the flow is moved to a dedicated edit screen.

Single-choice option controls should use the shared dropdown-style `SelectField` or searchable dropdown `SearchableSelectField` instead of always-visible option button groups. Keep true multi-select workflows as explicit multi-select controls.

Do not implement AI capture, sync status, shared publication, authentication, or extra workflows here without later accepted scope.
