# Local Font Assets

Place the Android heading font file at:

```text
apps/mobile/assets/fonts/FazendioHeading.ttf
```

The `.ttf` and `.otf` files in this folder are intentionally ignored by git. Use a properly licensed Garamond or Times New Roman-compatible font file for local builds. When this file exists, `app.config.js` registers it as the Android `FazendioHeading` font family through the Expo font config plugin.

If the heading font is not visible on Android, check these first:

- The file must exist at exactly `apps/mobile/assets/fonts/FazendioHeading.ttf`.
- The installed Android app must be rebuilt after the font file is added; reloading JavaScript alone will not add a native bundled font to an already-installed build.
- `npx expo config --type public` should include the `expo-font` plugin when the font file is present.
- Heading styles should continue to use `theme.typography.headingFontFamily` or `theme.typography.logoFontFamily`, not a direct platform font name.
