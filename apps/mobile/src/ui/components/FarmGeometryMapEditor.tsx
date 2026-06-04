import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Modal, Platform, StyleSheet, Text, View } from "react-native";

import type { SupportedGeoJsonGeometry } from "../../domain/gis/FarmMap";
import { Button } from "./Button";
import {
  addPolygonCornerAtMapCenter,
  canSaveGeometryFromMap,
  edgeDistanceAnnotations,
  geometryFeatureCollection,
  mapViewForGeometry,
  mapCoordinateFromAnnotationEvent,
  moveGeometryToMapCenter,
  pointGeometryFromMapCenter,
  polygonCornersFromGeometry,
  polygonGeometryFromCorners,
  undoLastPolygonCorner,
  updatePolygonCorner,
  type FarmGeometryMapEditorMode,
} from "./FarmGeometryMapEditorModel";
import {
  defaultFarmMapPreviewSeason,
  extractFarmMapPreviewViewState,
  getFarmMapPreviewCamera,
  getFarmMapPreviewExportStatus,
  getFarmMapPreviewOnlineStyle,
  getFarmMapPreviewSeasonShortButtonLabel,
  getFarmMapPreviewSeasonShortCaption,
  getNextFarmMapPreviewSeason,
  shouldAttemptNativeFarmMapPreview,
  type FarmMapPreviewSeason,
  type FarmMapPreviewViewState,
} from "./FarmMapPreviewModel";
import { MapOverlayButton, MapOverlayCloseButton } from "./MapOverlayButton";
import { theme } from "../theme/theme";

type MapLibreGeometryModule = {
  Camera: ComponentType<any>;
  GeoJSONSource: ComponentType<any>;
  Layer: ComponentType<any>;
  MapComponent: ComponentType<any>;
  ViewAnnotation: ComponentType<any>;
};

type MapLibreGeometryLoadResult = {
  module: MapLibreGeometryModule | null;
  unavailableMessage?: string;
};

export function FarmGeometryMapEditor({
  buttonLabel,
  geometry,
  mode,
  initialViewState,
  onSaveGeometry,
  title,
}: {
  buttonLabel: string;
  geometry?: SupportedGeoJsonGeometry;
  mode: FarmGeometryMapEditorMode;
  initialViewState: FarmMapPreviewViewState;
  onSaveGeometry: (geojson: SupportedGeoJsonGeometry, viewState: FarmMapPreviewViewState) => Promise<void>;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [season, setSeason] = useState<FarmMapPreviewSeason>(defaultFarmMapPreviewSeason);
  const mapLibre = useMemo(loadGeometryMapLibre, []);
  const editorViewState = mapViewForGeometry(geometry, initialViewState);

  if (!mapLibre.module) {
    return (
      <View style={styles.unavailableCard}>
        <Text style={styles.helperText}>
          {mapLibre.unavailableMessage ?? "Native map editing is not available in this running app. Manual coordinate entry still works here."}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Button label={buttonLabel} onPress={() => setIsOpen(true)} size="large" variant="secondary" />
      <Modal animationType="slide" onRequestClose={() => setIsOpen(false)} presentationStyle="fullScreen" visible={isOpen}>
        <FullScreenFarmGeometryMapEditor
          geometry={geometry}
          initialViewState={editorViewState}
          mapLibre={mapLibre.module}
          mode={mode}
          onClose={() => setIsOpen(false)}
          onSaveGeometry={onSaveGeometry}
          onSeasonChanged={setSeason}
          season={season}
          title={title}
        />
      </Modal>
    </>
  );
}

function FullScreenFarmGeometryMapEditor({
  geometry,
  initialViewState,
  mapLibre,
  mode,
  onClose,
  onSaveGeometry,
  onSeasonChanged,
  season,
  title,
}: {
  geometry?: SupportedGeoJsonGeometry;
  initialViewState: FarmMapPreviewViewState;
  mapLibre: MapLibreGeometryModule;
  mode: FarmGeometryMapEditorMode;
  onClose: () => void;
  onSaveGeometry: (geojson: SupportedGeoJsonGeometry, viewState: FarmMapPreviewViewState) => Promise<void>;
  onSeasonChanged: (season: FarmMapPreviewSeason) => void;
  season: FarmMapPreviewSeason;
  title: string;
}) {
  const { Camera, GeoJSONSource, Layer, MapComponent, ViewAnnotation } = mapLibre;
  const [pendingViewState, setPendingViewState] = useState(initialViewState);
  const [polygonCorners, setPolygonCorners] = useState(() => polygonCornersFromGeometry(geometry));
  const [selectedCornerIndex, setSelectedCornerIndex] = useState<number | undefined>();
  const [draftGeometry, setDraftGeometry] = useState<SupportedGeoJsonGeometry | undefined>(geometry);
  const [mapLoadError, setMapLoadError] = useState<string | undefined>();
  const [saveError, setSaveError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const initialCamera = useMemo(() => getFarmMapPreviewCamera(initialViewState), []);
  const previewGeometry = mode === "polygon"
    ? previewPolygonGeometry(polygonCorners)
    : draftGeometry;
  const edgeLabels = mode === "polygon" ? edgeDistanceAnnotations(polygonCorners) : [];
  const saveEnabled = canSaveGeometryFromMap(mode, polygonCorners);

  function handleMapMoved(event: unknown) {
    const nextViewState = extractFarmMapPreviewViewState(event);

    if (nextViewState) {
      setPendingViewState(nextViewState);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError(undefined);

    try {
      const geojson = mode === "point"
        ? pointGeometryFromMapCenter(pendingViewState)
        : polygonGeometryFromCorners(polygonCorners);

      await onSaveGeometry(geojson, pendingViewState);
      onClose();
    } catch (caughtError) {
      setSaveError(caughtError instanceof Error ? caughtError.message : "Geometry could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleUseCenter() {
    if (mode === "point") {
      setDraftGeometry(pointGeometryFromMapCenter(pendingViewState));
      return;
    }

    setPolygonCorners((current) => addPolygonCornerAtMapCenter(current, pendingViewState));
    setSelectedCornerIndex(polygonCorners.length);
  }

  function handleUndoLastPolygonCorner() {
    setPolygonCorners((current) => {
      const nextCorners = undoLastPolygonCorner(current);
      setSelectedCornerIndex((currentSelectedIndex) => {
        if (currentSelectedIndex === undefined || currentSelectedIndex < nextCorners.length) {
          return currentSelectedIndex;
        }

        return nextCorners.length > 0 ? nextCorners.length - 1 : undefined;
      });

      return nextCorners;
    });
  }

  function handleCornerMoved(index: number, event: unknown) {
    const coordinate = mapCoordinateFromAnnotationEvent(event);

    if (!coordinate) {
      return;
    }

    setSelectedCornerIndex(index);
    setPolygonCorners((current) => updatePolygonCorner(current, index, coordinate));
  }

  function handleMoveShapeToCenter() {
    const geometryToMove = mode === "polygon" ? previewPolygonGeometry(polygonCorners) : draftGeometry;

    if (!geometryToMove) {
      return;
    }

    const movedGeometry = moveGeometryToMapCenter(geometryToMove, pendingViewState);
    setDraftGeometry(movedGeometry);

    if (movedGeometry.type === "Polygon") {
      setPolygonCorners(polygonCornersFromGeometry(movedGeometry));
    }
  }

  const guidanceMessage = mode === "point"
    ? "Move center marker, then save."
    : "Add 3+ corners, or tap and drag a corner.";
  const message = saveError
    ?? mapLoadError
    ?? `${guidanceMessage} ${getFarmMapPreviewSeasonShortCaption(season)}`;

  return (
    <View style={styles.fullScreenContainer}>
      <MapComponent
        attribution
        compass
        logo={false}
        mapStyle={getFarmMapPreviewOnlineStyle(season)}
        onDidFailLoadingMap={() => {
          setMapLoadError("Aerial imagery could not be loaded. Geometry remains local and can still be saved from coordinates.");
        }}
        onDidFinishLoadingMap={() => {
          setMapLoadError(undefined);
        }}
        onRegionDidChange={handleMapMoved}
        onRegionIsChanging={handleMapMoved}
        style={styles.fullScreenMap}
      >
        <Camera
          bearing={initialCamera.bearing}
          center={initialCamera.center}
          pitch={initialCamera.pitch}
          zoom={initialCamera.zoom}
        />
        <GeoJSONSource data={geometryFeatureCollection(previewGeometry)} id="farm-geometry-draft">
          <Layer
            id="farm-geometry-fill"
            paint={{ "fill-color": "#667A45", "fill-opacity": 0.25 }}
            source="farm-geometry-draft"
            type="fill"
          />
          <Layer
            id="farm-geometry-line"
            paint={{ "line-color": "#2F4F3E", "line-width": 4 }}
            source="farm-geometry-draft"
            type="line"
          />
          <Layer
            id="farm-geometry-point"
            paint={{ "circle-color": "#B45F45", "circle-radius": 9, "circle-stroke-color": "#FFFCF6", "circle-stroke-width": 3 }}
            source="farm-geometry-draft"
            type="circle"
          />
        </GeoJSONSource>
        {edgeLabels.map((edgeLabel) => (
          <ViewAnnotation
            anchor="center"
            id={`farm-geometry-${edgeLabel.id}`}
            key={`farm-geometry-${edgeLabel.id}`}
            lngLat={edgeLabel.coordinate}
          >
            <View style={styles.edgeDistanceLabel}>
              <Text style={styles.edgeDistanceLabelText}>{edgeLabel.label}</Text>
            </View>
          </ViewAnnotation>
        ))}
        {mode === "polygon" ? polygonCorners.map((corner, index) => {
          const selected = selectedCornerIndex === index;

          return (
            <ViewAnnotation
              anchor="center"
              draggable
              id={`farm-geometry-corner-${index}`}
              key={`farm-geometry-corner-${index}`}
              lngLat={corner}
              onDrag={(event: unknown) => handleCornerMoved(index, event)}
              onDragEnd={(event: unknown) => handleCornerMoved(index, event)}
              onDragStart={() => setSelectedCornerIndex(index)}
              onPress={() => setSelectedCornerIndex(index)}
              onSelect={() => setSelectedCornerIndex(index)}
              selected={selected}
            >
              <View style={[styles.cornerHandle, selected ? styles.cornerHandleSelected : undefined]}>
                <View style={styles.cornerDot} />
              </View>
            </ViewAnnotation>
          );
        }) : null}
      </MapComponent>
      <View pointerEvents="none" style={styles.centerMarker}>
        <View style={styles.markerDot} />
      </View>
      <View style={styles.fullScreenTopPanel}>
        <View style={styles.fullScreenHeaderRow}>
          <View style={styles.fullScreenHeaderText}>
            <Text style={styles.fullScreenTitle}>{title}</Text>
            <Text style={styles.fullScreenCoordinate}>
              Center {formatMapCoordinate(pendingViewState.latitude)}, {formatMapCoordinate(pendingViewState.longitude)}
            </Text>
          </View>
          <MapOverlayCloseButton disabled={isSaving} onPress={onClose} />
        </View>
      </View>
      <View style={styles.fullScreenBottomPanel}>
        <Text style={saveError || mapLoadError ? styles.captionError : styles.captionText}>{message}</Text>
        <View style={styles.mapButtonGrid}>
          <MapOverlayButton
            label={getFarmMapPreviewSeasonShortButtonLabel(season)}
            onPress={() => onSeasonChanged(getNextFarmMapPreviewSeason(season))}
            style={styles.mapButtonGridItem}
            variant="secondary"
          />
          <MapOverlayButton
            label={mode === "point" ? "Use center point" : "Add corner at center"}
            onPress={handleUseCenter}
            style={styles.mapButtonGridItem}
            variant="secondary"
          />
          {mode === "polygon" ? (
            <MapOverlayButton
              disabled={polygonCorners.length === 0}
              label="Undo corner"
              onPress={handleUndoLastPolygonCorner}
              style={styles.mapButtonGridItem}
              variant="secondary"
            />
          ) : null}
          <MapOverlayButton
            disabled={!previewGeometry}
            label="Move shape to center"
            onPress={handleMoveShapeToCenter}
            style={styles.mapButtonGridItem}
            variant="secondary"
          />
          <MapOverlayButton
            disabled={isSaving || !saveEnabled}
            label={isSaving ? "Saving..." : mode === "point" ? "Save point" : "Save boundary"}
            onPress={handleSave}
            style={styles.mapButtonGridItem}
          />
        </View>
      </View>
    </View>
  );
}

function loadGeometryMapLibre(): MapLibreGeometryLoadResult {
  if (!shouldAttemptNativeFarmMapPreview({ platformOS: Platform.OS })) {
    return {
      module: null,
      unavailableMessage: "Native map editing is not available on this platform. Manual coordinate entry still works here.",
    };
  }

  try {
    const moduleValue = require("@maplibre/maplibre-react-native");
    const moduleRecord = moduleValue as Record<string, unknown>;
    const defaultRecord = typeof moduleRecord.default === "object" && moduleRecord.default !== null
      ? moduleRecord.default as Record<string, unknown>
      : {};
    const exportStatus = getFarmMapPreviewExportStatus(moduleValue);
    const MapComponent = exportStatus.mapComponentExportName
      ? (moduleRecord[exportStatus.mapComponentExportName] ?? defaultRecord[exportStatus.mapComponentExportName])
      : undefined;
    const Camera = moduleRecord.Camera ?? defaultRecord.Camera;
    const GeoJSONSource = moduleRecord.GeoJSONSource ?? defaultRecord.GeoJSONSource;
    const Layer = moduleRecord.Layer ?? defaultRecord.Layer;
    const ViewAnnotation = moduleRecord.ViewAnnotation ?? defaultRecord.ViewAnnotation;

    if (!MapComponent || !Camera || !GeoJSONSource || !Layer || !ViewAnnotation) {
      return {
        module: null,
        unavailableMessage: "Native map editing loaded, but the expected MapLibre geometry components were not available. Manual coordinate entry still works here.",
      };
    }

    return {
      module: {
        Camera: Camera as ComponentType<any>,
        GeoJSONSource: GeoJSONSource as ComponentType<any>,
        Layer: Layer as ComponentType<any>,
        MapComponent: MapComponent as ComponentType<any>,
        ViewAnnotation: ViewAnnotation as ComponentType<any>,
      },
    };
  } catch (caughtError) {
    return {
      module: null,
      unavailableMessage: nativeGeometryMapUnavailableMessage(caughtError),
    };
  }
}

function nativeGeometryMapUnavailableMessage(caughtError: unknown): string {
  const message = caughtError instanceof Error ? caughtError.message : "";

  if (message.includes("MLRNCameraModule") || message.includes("TurboModuleRegistry")) {
    return "MapLibre is installed in JavaScript, but this running app does not have the matching native map module. Rebuild and reinstall the development app, then use manual coordinate entry until then.";
  }

  return "Native map editing could not be loaded in this running app. Manual coordinate entry still works here.";
}

function previewPolygonGeometry(corners: Array<[number, number]>): SupportedGeoJsonGeometry | undefined {
  if (corners.length < 3) {
    return undefined;
  }

  return polygonGeometryFromCorners(corners);
}

function formatMapCoordinate(value: number): string {
  return value.toFixed(6).replace(/\.?0+$/, "");
}

const styles = StyleSheet.create({
  unavailableCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  fullScreenContainer: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  fullScreenMap: {
    ...StyleSheet.absoluteFillObject,
  },
  centerMarker: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  markerDot: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.onAccent,
    borderRadius: 14,
    borderWidth: 3,
    height: 28,
    width: 28,
  },
  fullScreenTopPanel: {
    backgroundColor: "rgba(255, 252, 246, 0.86)",
    borderColor: "rgba(212, 200, 181, 0.8)",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    left: theme.spacing.md,
    padding: theme.spacing.md,
    position: "absolute",
    right: theme.spacing.md,
    top: theme.spacing.xl,
  },
  fullScreenHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  fullScreenHeaderText: {
    flex: 1,
  },
  fullScreenTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.section,
    fontWeight: "800",
    lineHeight: 28,
  },
  fullScreenCoordinate: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    fontWeight: "700",
    lineHeight: 20,
  },
  fullScreenBottomPanel: {
    backgroundColor: "rgba(255, 252, 246, 0.84)",
    borderColor: "rgba(212, 200, 181, 0.78)",
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    borderWidth: 1,
    bottom: theme.spacing.touchTarget,
    gap: theme.spacing.sm,
    left: 0,
    padding: theme.spacing.sm,
    position: "absolute",
    right: 0,
  },
  mapButtonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  mapButtonGridItem: {
    flexBasis: "48%",
    flexGrow: 1,
  },
  captionText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.caption,
    fontWeight: "700",
    lineHeight: 16,
  },
  captionError: {
    color: theme.colors.error,
    fontSize: theme.typography.caption,
    fontWeight: "700",
    lineHeight: 16,
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  cornerHandle: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  cornerHandleSelected: {
    backgroundColor: "rgba(255, 252, 246, 0.22)",
    borderColor: "rgba(47, 79, 62, 0.74)",
    borderRadius: 3,
    borderWidth: 2,
  },
  cornerDot: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.onAccent,
    borderRadius: 4,
    borderWidth: 1,
    height: 8,
    width: 8,
  },
  edgeDistanceLabel: {
    backgroundColor: "rgba(255, 252, 246, 0.76)",
    borderColor: "rgba(47, 79, 62, 0.45)",
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  edgeDistanceLabelText: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
  },
});
