# UI

This folder is for future Mobile Pilot 1 screens, components, and theme code.

UI must use farmer-understandable language, remain usable in field conditions, and clearly communicate local saved/device-local status and export/recovery-copy limitations.

Governed by `docs/product/field-workflows.md`, `docs/product/mobile-pilot-1-implementation-scope.md`, and `docs/standards/accessibility-and-field-usability-standards.md`.

When editing existing records from a list, timeline, dashboard, setup, planning, or certification page, keep the form local to the selected item. Hide edit forms until the user taps a large labeled edit action, render the edit form directly below that action in the same row/card/detail block, and close it after Save or Cancel. Do not add a single stationary edit form far from the item being edited unless the flow is moved to a dedicated edit screen.

Single-choice option controls should use the shared dropdown-style `SelectField` or searchable dropdown `SearchableSelectField` instead of always-visible option button groups. Keep true multi-select workflows as explicit multi-select controls. Farmer-created/user-input-derived option sets and option sets with long predefined names should use a single-column option list rather than a two-column grid.

Visual styling should stay reusable through `theme`, shared components, and project-owned assets in `apps/mobile/assets/images`. Decorative imagery should support field usability and atmosphere without changing workflows, hiding controls, or becoming repeated wallpaper across every card.

The default UI density is sleek/ungloved, with a page-header toggle for gloved field use. Density-sensitive control sizing, spacing, select helper text, and select text weight should flow through `UiDensityProvider` and shared components rather than one-off screen styles.

Use `ThemedIcon` for app-owned line icons, button icons, navigation icons, and button arrows before adding one-off view-drawn glyphs. Select option rows are the exception: keep option text full-width and avoid placing icons beside option labels; gloved dropdown options may use the shared transparent vine background treatment, while sleek dropdown options should stay plain. Page headings and card title headings should use the shared serif heading font from `theme.typography.headingFontFamily`; Android targets the `FazendioHeading` font family, which is bundled from the ignored local `assets/fonts/FazendioHeading.ttf` file when that file exists, and other platforms use Georgia. The app logo should use `theme.typography.logoFontFamily`. Body text, form labels, controls, and buttons should remain sans serif for readability.

Do not implement AI capture, sync status, shared publication, authentication, or extra workflows here without later accepted scope.
