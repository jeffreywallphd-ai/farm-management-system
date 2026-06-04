# ADR-0016: Local GIS Map and Geometry Foundation

- Status: accepted
- Last reviewed: 2026-06-03
- Canonical for: local mobile farm map settings, farm-owned geometry, GeoJSON storage, and GIS dependency boundaries
- Related docs: [GIS Map and Geometry Architecture](../architecture/gis-map-and-geometry-architecture.md), [GIS Map and Geometry Domain Rules](../domain/gis-map-and-geometry-rules.md), [Basic GIS and Farm Location](../product/basic-gis-and-farm-location.md), [Mobile Pilot 1 Implementation Scope](../product/mobile-pilot-1-implementation-scope.md)
- Related tests: `apps/mobile/src/application/use-cases/farmMapUseCases.test.ts`, `apps/mobile/src/domain/validation/gisValidation.test.ts`, `apps/mobile/src/infrastructure/sqlite/migrations/harvestMigration.test.ts`, `apps/mobile/src/ui/components/FarmMapPreviewModel.test.ts`
- Supersedes: none

## Context

The mobile app now supports local farm setup, voice/photo-first farm-event capture, planning, farmhand management, and organic certification readiness. Farmers also need a durable way to record where the farm is and, later, where fields, buffers, water sources, buildings, and organic certification risk areas are.

Earlier farm-place hierarchy guidance correctly prevented ordinary place setup from silently becoming GIS. This decision intentionally adds a small GIS foundation while preserving the voice/photo-first pilot, offline-first storage, and local data ownership constraints.

## Decision

Add a local GIS foundation to the standalone mobile app with two separate concepts:

- `FarmMapSettings`: local UI/view state for the farm map, including address text, preferred center, zoom, pitch, bearing, map provider, and offline map pack status.
- `FarmPlaceGeometry`: farm-owned spatial data stored as GeoJSON, including farm center points and later field boundaries, beds, rows, greenhouses, buildings, storage areas, wash/pack areas, buffers, water sources, access roads, and organic certification risk geometries. Place geometry may also store optional geometry-specific map-view settings for reopening a useful closer view without changing farm-wide map settings.

GeoJSON is the internal geometry format. SQLite remains the local persistence mechanism through repository adapters and hand-written migrations. Farm geometry must remain readable and exportable even when basemap tiles, GPS, address geocoding, or internet access are unavailable.

Dependency review on 2026-06-03 selected Expo Location for optional foreground GPS/geocoding, MapLibre React Native for native map rendering in Expo development builds, and Turf distance for local edge-length estimates. UI must keep those dependencies behind provider/component boundaries and retain field-safe manual entry. The first MapLibre use must not require online basemap tiles; it starts with a local coordinate preview and lets the farmer explicitly open a full-screen online imagery editor when visible imagery is useful. The editor may offer simple season-oriented layer choices when stable public tile sources are available and may create or move local point/polygon geometry through center-marker placement and simple selectable vertex dragging. Production tile-source selection, farmer-selectable imagery dates such as fall leaf-off imagery, advanced GIS editing beyond simple vertex dragging, and offline tile packs remain deferred.

## Boundaries

This decision does not authorize:

- cloud map accounts as a hard dependency;
- server GIS APIs;
- cloud sync;
- authentication;
- analytics;
- automatic upload of location or geometry;
- automatic AI extraction from maps or photos;
- certifier submission;
- silent publication of farm boundaries;
- storing basemap tile caches in recovery copies by default.

GPS and address geocoding are optional helpers. Manual address and coordinate entry must remain available.

## Rationale

Farm location should not be a one-off latitude/longitude setting. Treating location as geometry lets the same foundation later support boundaries, buffers, transition areas, contamination risks, inspection evidence, and map-linked farm notes.

Separating farm-wide map settings from geometry prevents viewport choices from being confused with farm-owned data. A farmer may change the default zoom or map provider without changing the farm center or field boundary records. Geometry-specific view settings are scoped to the geometry they help edit and do not replace the farm-wide map configuration.

## Consequences

Positive:

- Farm-owned geometry is local, private, editable or archivable, and exportable.
- Organic certification geometry can build on the same model as ordinary farm places.
- Offline behavior is clear: geometry and saved view state are local; basemap availability is separate.
- Native map provider selection can be isolated behind a component boundary.

Tradeoffs:

- The mobile app now carries GIS concepts that must remain simple and farmer-facing.
- Online basemap rendering, offline tile downloads, and physical-device native permission review require follow-up.
- Geometry validation must stay strict enough for data integrity without making field setup brittle.

## Validation

Implementation must verify:

- map settings can be saved and edited locally;
- farm center is represented as `FarmPlaceGeometry` with role `farmCenter`;
- GeoJSON coordinate ranges and basic shape validity are checked;
- archived geometry is retained non-destructively;
- recovery copies include map settings and geometry;
- UI remains usable without internet, basemap tiles, or GPS support;
- no sync, server, auth, analytics, or upload behavior is introduced.
