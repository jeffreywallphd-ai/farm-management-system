# GIS Map and Geometry Domain Rules

- Status: accepted
- Last reviewed: 2026-06-03
- Canonical for: farmer-facing spatial data vocabulary, map settings rules, geometry validity, and organic geometry roles
- Related ADRs: [ADR-0016](../adr/ADR-0016-local-gis-map-and-geometry-foundation.md)
- Related docs: [GIS Map and Geometry Architecture](../architecture/gis-map-and-geometry-architecture.md), [Basic GIS and Farm Location](../product/basic-gis-and-farm-location.md), [Farm Structure and Tracked Items](farm-structure-and-tracked-items.md), [Organic Certification Domain Rules](organic-certification-rules.md)
- Related tests: `apps/mobile/src/domain/validation/gisValidation.test.ts`, `apps/mobile/src/application/use-cases/farmMapUseCases.test.ts`
- Supersedes: none

## Core Concepts

`FarmMapSettings` describes how the farmer prefers to view the farm map. It is not the farm boundary and not proof of organic status.

`FarmPlaceGeometry` describes a farm-owned spatial feature. A geometry may be linked to a farm place, or it may represent the farm center or an organic certification feature that is not yet tied to a place. A place geometry may also store an optional map-view preference so reopening that geometry can start from a closer useful view without changing the farm-wide map configuration.

## Geometry Format

GeoJSON is the internal geometry format for farm-owned spatial records. Supported geometry types are:

- point;
- line;
- polygon;
- multipolygon.

Coordinate order follows GeoJSON: longitude first, latitude second. Longitudes must be between -180 and 180. Latitudes must be between -90 and 90. Polygon rings must be closed.

## Geometry Roles

Supported roles include:

- `farmCenter`;
- `fieldBoundary`;
- `bedBoundary`;
- `rowLine`;
- `greenhouseBoundary`;
- `buildingFootprint`;
- `storageArea`;
- `washPackArea`;
- `bufferZone`;
- `waterSource`;
- `accessRoad`;
- `adjacentLandRiskArea`;
- `driftIncidentArea`;
- `contaminationConcernPoint`;
- `other`.

Roles describe why the geometry matters. They do not automatically create organic certification claims.

## Editing and Archiving

Spatial records are farmer-created setup/support data. They must be editable where practical and archivable rather than destructively deleted. Archiving preserves recovery and inspection context while removing the geometry from normal active lists.

Renaming an ordinary farm place does not duplicate or rewrite geometry. Geometry linked by `placeId` should display the current place name through normal lookup while retaining its own `name` and notes when supplied.

Map-based editing is a user-interface path into the same local GeoJSON records. A point placed at the map center still stores GeoJSON longitude,latitude order. A polygon drawn by adding map-center corners must be closed before persistence and must satisfy the same validation as manually entered coordinate text.

Polygon map editing may show selectable draggable vertices and edge distance estimates. These estimates are local planning aids calculated from the saved GeoJSON coordinates and should be presented as approximate. They are not surveyed boundary measurements, acreage determinations, legal descriptions, or automatic organic-certification evidence by themselves.

The Farm map location setup card should focus on farm address, farm-wide map configuration, and the farm center. Geometry linked to ordinary farm places should be created and edited from the Farm places setup flow so farmers can distinguish the overall farm location from field, greenhouse, storage, or other place geometry.

## Privacy

Farm geometry is private farm data. The app must not upload, sync, publish, geocode through a cloud service, or share farm geometry unless a later explicit feature and decision authorizes that behavior.
