# Basic GIS and Farm Location

- Status: accepted
- Last reviewed: 2026-06-03
- Canonical for: product scope of local farm location, saved map view, and basic field/place geometry foundation
- Related ADRs: [ADR-0016](../adr/ADR-0016-local-gis-map-and-geometry-foundation.md)
- Related docs: [Mobile Pilot 1 Implementation Scope](mobile-pilot-1-implementation-scope.md), [Field Workflows](field-workflows.md), [Organic Certification Readiness](organic-certification-readiness.md), [GIS Map and Geometry Architecture](../architecture/gis-map-and-geometry-architecture.md)
- Related tests: `apps/mobile/src/application/use-cases/farmMapUseCases.test.ts`, `apps/mobile/src/domain/validation/gisValidation.test.ts`, `apps/mobile/src/ui/components/FarmMapPreviewModel.test.ts`
- Supersedes: none

## Product Direction

Basic GIS supports the local-first mobile farm app without displacing the voice/photo-first farm-event pilot. The first user value is simple: farmers can save where the farm is, see and edit that location later, and build toward useful field/place geometry for farm work and organic certification.

## In Scope

- Save farm address text locally.
- Save farm center coordinates locally.
- Store farm center as geometry, not only scalar latitude/longitude.
- Save the farmer's preferred map view separately from the farm geometry.
- Store field/place geometry as GeoJSON.
- Let place geometry start from the farm map view and optionally remember a closer geometry-specific view after saving.
- Let farmers refine polygon boundaries with selectable draggable vertices and see approximate edge distance labels.
- Keep setup usable without internet, GPS, or map tiles.
- Include map settings and farm geometry in recovery exports.
- Prepare for organic geometry such as boundaries, buffers, water sources, and risk areas.

## Out of Scope

- Cloud sync.
- Authentication or accounts.
- Analytics.
- Server map APIs.
- Required online basemaps.
- Certifier submission.
- Automatic AI map/photo extraction.
- Full GIS editing tools in the first slice.

## Farmer Experience Principles

The farm setup page should offer a concise Farm map location card. Manual entry should be as credible as GPS. GPS and geocoding are helpers, not blockers. If the map provider is unavailable, the farmer should still see saved coordinates, address text, and local geometry status.

## Implementation Status

The current mobile implementation includes local persistence, validation, recovery export, a collapsed Farm map location setup card, manual address entry, manual farm-center coordinates, saved farm-wide map-view values, a farm-center full-screen map launcher, foreground GPS helper, optional address geocoding helper, and basic point/polygon geometry editing from the Farm places setup flow with place linking, optional geometry-specific map-view settings, and archiving.

The app declares `expo-location`, `@maplibre/maplibre-react-native`, and `@turf/distance` for the mobile build. These dependencies must be installed with Expo-compatible resolution and the native app must be rebuilt before physical-device validation. Expo Go must use the fallback coordinate/manual setup paths because MapLibre React Native requires a custom native binary. GPS and geocoding remain optional helpers; farmers can still save the address and coordinates manually. The online imagery editor is user-triggered and only helps visually confirm saved farm-owned geometry; it is not required for setup and must not become cloud sync or automatic farm-data upload. The editor opens full-screen so map dragging does not conflict with setup-page scrolling, saves farm center through the same local farm-center and viewport records as manual coordinate entry, and saves point/polygon place geometry through the existing local geometry use cases. Polygon drawing can start with center-marker corner placement and then be refined with selectable draggable vertices. Edge labels use local Turf distance estimates to help farmers orient boundaries, but the app does not make surveyed measurement, acreage, legal boundary, or certification determinations from those estimates. The season button switches between a mixed-season satellite layer and a national leaf-on imagery layer; a dependable fall leaf-off layer remains deferred with production tile-source selection. Offline tile downloads, advanced GIS editing beyond simple vertex dragging, import/restore, and map-linked farm-note GPS capture remain follow-up work behind the provider boundaries defined in ADR-0016.
