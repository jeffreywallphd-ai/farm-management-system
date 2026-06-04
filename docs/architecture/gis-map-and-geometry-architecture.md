# GIS Map and Geometry Architecture

- Status: accepted
- Last reviewed: 2026-06-03
- Canonical for: local mobile GIS architecture, map settings, farm-owned geometry, map provider boundaries, and offline behavior
- Related ADRs: [ADR-0016](../adr/ADR-0016-local-gis-map-and-geometry-foundation.md), [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md)
- Related docs: [GIS Map and Geometry Domain Rules](../domain/gis-map-and-geometry-rules.md), [Basic GIS and Farm Location](../product/basic-gis-and-farm-location.md), [Persistence and Attachment Storage](persistence-and-attachment-storage.md), [Offline-First Mobile Architecture](offline-first-mobile-architecture.md)
- Related tests: `apps/mobile/src/application/use-cases/farmMapUseCases.test.ts`, `apps/mobile/src/domain/validation/gisValidation.test.ts`, `apps/mobile/src/infrastructure/sqlite/migrations/harvestMigration.test.ts`, `apps/mobile/src/ui/components/FarmMapPreviewModel.test.ts`
- Supersedes: none

## Purpose

This document defines the local GIS architecture for the standalone mobile pilot. The goal is a practical farm-location and geometry foundation, not a full GIS platform.

## Architecture Shape

GIS data is split into two local models:

| Model | Responsibility | Examples |
| --- | --- | --- |
| `FarmMapSettings` | User interface/view state | saved address text, default center, zoom, pitch, bearing, provider, offline map status |
| `FarmPlaceGeometry` | Farm-owned spatial data plus optional geometry-specific map-view preference | farm center point, field boundary, buffer zone, water source, access road, saved closer view for a field |

The app stores both models in SQLite through repository interfaces. Domain validation uses Zod and local validation helpers. Recovery export includes both models as farm-owned data, but excludes map tile caches unless a later ADR explicitly changes that behavior.

## Offline Behavior

Saved geometry and map settings are local and must display without internet access. Basemap tiles are separate from farm geometry:

- Geometry: always local once saved.
- Saved map viewport: always local once saved.
- Geometry-specific map viewport: optional local view preference for reopening a saved place geometry.
- GPS: may work offline depending on device conditions and permissions.
- Address geocoding: normally network-dependent and optional.
- Basemap tiles: network-dependent unless a later offline tile pack feature is accepted and implemented.

The UI must keep manual address and coordinate entry available. A missing map provider must not block farm setup.

## Map Provider Boundary

The mobile app declares MapLibre React Native for map rendering in Expo development builds. Because native map packages affect builds, app size, licenses, Expo Go compatibility, and field behavior, map rendering must stay behind a component boundary. The first MapLibre component starts with a local coordinate fallback and lets the farmer explicitly open a full-screen online imagery editor when visible imagery is useful. Full-screen editing prevents map dragging from competing with setup-page scrolling and provides map-local Save and Close controls. Saved coordinates and map settings must work without making online basemaps a setup requirement. The route must not statically import MapLibre at module startup. Instead, the preview component may attempt a dynamic native import on Android and iOS, catch native-module unavailability, and show the coordinate fallback.

## Location Provider Boundary

The app declares Expo Location for foreground GPS and address geocoding. Location access must be explicit and optional. The app must not request background location for this pilot. Failure to obtain permission, GPS fix, or geocode result must not erase typed address text or saved coordinates.

## Organic Certification Fit

Organic certification geometry uses the same `FarmPlaceGeometry` model. Roles such as `bufferZone`, `adjacentLandRiskArea`, `driftIncidentArea`, `contaminationConcernPoint`, `waterSource`, `storageArea`, and `washPackArea` support future certification reports without creating a separate geometry subsystem.

## Deferred Work

The following remain deferred until native-device UX choices are validated:

- production online basemap selection or offline basemap rendering;
- offline map tile download and deletion;
- advanced polygon editing beyond selectable draggable vertices and edge distance estimates;
- geometry import;
- map-linked farm-note GPS capture;
- geometry evidence attachments beyond ordinary farm-event links.

## Current Implementation

The mobile app currently implements the local storage and fallback UI foundation:

- `FarmMapSettings` is stored in SQLite and included in recovery exports.
- `FarmPlaceGeometry` is stored in SQLite as validated GeoJSON and included in recovery exports.
- Farm center is saved as a `FarmPlaceGeometry` point with role `farmCenter`.
- Basic point and polygon geometry can be created, edited, linked to a farm place, and archived from Farm setup. Place geometry editing belongs with the Farm places setup flow rather than the Farm map location card.
- The Farm setup map preview displays saved coordinates locally when coordinates exist and can intentionally open a full-screen online imagery editor in rebuilt development apps for visual confirmation.
- The full-screen editor lets the farmer switch between the mixed-season satellite imagery layer and the national leaf-on imagery layer. A dependable national fall leaf-off layer is not implemented; farmer-selectable production imagery sources remain deferred.
- Farm-owned point and polygon geometries can be created or edited from a full-screen map editor. Point geometries use the map center marker. Polygon geometries can start with field-friendly center-marker corner placement and then support selectable draggable vertex handles for refinement. Selected polygon vertices show a subtle translucent selection box, and polygon edges display local Turf-backed distance estimates for farmer orientation. Distance labels are rendered as map annotations rather than MapLibre symbol text layers so the lightweight editor style does not depend on remote glyph/font resources. Place geometry starts from the farm map view by default and can retain a closer geometry-specific map view after saving. Manual coordinate entry remains available as an advanced fallback.

Foreground GPS and address geocoding are wired through an Expo Location adapter. Both paths are optional helpers and preserve manual entry as the reliable fallback.
