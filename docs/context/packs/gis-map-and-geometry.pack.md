# Context Pack: GIS Map and Geometry

- Pack name: `gis-map-and-geometry`
- Status: active
- Last reviewed: 2026-06-03
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Use When

Use this pack for work involving farm map settings, farm address/location, GPS/geocoding, map previews, GeoJSON, field/place geometry, organic geometry overlays, or map-linked farm notes.

## Canonical Sources

- [ADR-0016: Local GIS Map and Geometry Foundation](../../adr/ADR-0016-local-gis-map-and-geometry-foundation.md)
- [GIS Map and Geometry Architecture](../../architecture/gis-map-and-geometry-architecture.md)
- [GIS Map and Geometry Domain Rules](../../domain/gis-map-and-geometry-rules.md)
- [Basic GIS and Farm Location](../../product/basic-gis-and-farm-location.md)
- [Offline-First Mobile Architecture](../../architecture/offline-first-mobile-architecture.md)
- [Persistence and Attachment Storage](../../architecture/persistence-and-attachment-storage.md)
- [Dependency and Supply Chain Standards](../../standards/dependency-and-supply-chain-standards.md)

## Implementation Constraints

- Keep `FarmMapSettings` separate from `FarmPlaceGeometry`.
- Store farm-owned geometry as GeoJSON.
- Do not require internet, basemap tiles, GPS, or geocoding for setup.
- Keep geometry local/private unless the farmer explicitly exports it.
- Do not introduce cloud sync, authentication, analytics, server APIs, or automatic upload.
- Keep native map and location dependencies behind explicit provider boundaries.
- Do not import native MapLibre modules at route/module startup. The map preview may dynamically try MapLibre on Android and iOS, but it must catch native-module unavailability so Expo Go or mismatched native builds can still load the setup route and show the coordinate fallback.

## Verification Expectations

- Validate coordinate ranges and geometry shape rules.
- Test map settings persistence.
- Test farm center upsert behavior.
- Test non-destructive geometry archiving.
- Test recovery export inclusion.
- Verify UI fallback states for unavailable GPS, geocoding, and basemaps.

## Current Implementation Notes

As of 2026-06-03, the app has local `FarmMapSettings`, local `FarmPlaceGeometry`, recovery-copy inclusion, a Farm setup UI for manual address, farm-center coordinates, saved farm-wide view state, optional foreground GPS/geocoding through Expo Location, an explicit user-triggered MapLibre full-screen online imagery editor in rebuilt development apps, simple season-layer switching between mixed-season satellite and national leaf-on imagery, map-centered point placement, map-centered polygon corner placement, selectable draggable polygon vertices, local Turf-backed polygon edge distance estimates, farm-center map editing from the Farm map location card, and place-linked point/polygon geometry editing from the Farm places card. Place geometry may store optional geometry-specific map-view settings so editing can reopen at a closer useful view. Do not assume production online basemap selection, dependable national fall leaf-off imagery, farmer-selectable imagery dates, offline tile packs, advanced GIS editing beyond simple vertex dragging, import/restore, or map-linked farm-note GPS capture are implemented.
