# Local Font Assets

Place the Android heading font file at:

```text
apps/mobile/assets/fonts/FazendioHeading.ttf
```

The `.ttf` and `.otf` files in this folder are intentionally ignored by git. Use a properly licensed Garamond or Times New Roman-compatible font file for local builds. When this file exists, `app.config.js` registers it as the Android `FazendioHeading` font family through the Expo font config plugin.
