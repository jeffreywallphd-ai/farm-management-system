import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Modal, Platform, StyleSheet, Text, View } from "react-native";

import {
  defaultFarmMapPreviewSeason,
  extractFarmMapPreviewViewState,
  farmMapPreviewAspectRatio,
  getFarmMapPreviewExportStatus,
  getFarmMapPreviewCamera,
  getFarmMapPreviewOnlineStyle,
  getFarmMapPreviewSeasonShortButtonLabel,
  getFarmMapPreviewSeasonShortCaption,
  getNextFarmMapPreviewSeason,
  shouldAttemptNativeFarmMapPreview,
  type FarmMapPreviewSeason,
  type FarmMapPreviewViewState,
} from "./FarmMapPreviewModel";
import { Button } from "./Button";
import { MapOverlayButton, MapOverlayCloseButton } from "./MapOverlayButton";
import { theme } from "../theme/theme";

type MapLibreModule = {
  Camera: ComponentType<any>;
  MapComponent: ComponentType<any>;
};

type MapLibreLoadResult = {
  module: MapLibreModule | null;
  unavailableMessage?: string;
};

export function FarmMapPreview({
  buttonOnly = false,
  latitude,
  longitude,
  zoom,
  pitch,
  bearing,
  onViewChanged,
  onSaveLocation,
}: FarmMapPreviewViewState & {
  buttonOnly?: boolean;
  onViewChanged: (viewState: FarmMapPreviewViewState) => void;
  onSaveLocation?: (viewState: FarmMapPreviewViewState) => Promise<void>;
}) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [season, setSeason] = useState<FarmMapPreviewSeason>(defaultFarmMapPreviewSeason);
  const mapLibre = useMemo(loadMapLibre, []);
  const viewState = { latitude, longitude, zoom, pitch, bearing };

  if (!mapLibre.module) {
    if (buttonOnly) {
      return (
        <Text style={styles.fallbackText}>
          {mapLibre.unavailableMessage ?? "Native map preview could not be loaded in this running app. Manual address and coordinate saving still works here."}
        </Text>
      );
    }

    return (
      <FallbackFarmMapPreview
        bearing={bearing}
        latitude={latitude}
        longitude={longitude}
        pitch={pitch}
        unavailableMessage={mapLibre.unavailableMessage}
        zoom={zoom}
      />
    );
  }

  return (
    <>
      {buttonOnly ? (
        <Button
          label="Open full-screen map"
          onPress={() => {
            setIsMapOpen(true);
          }}
          size="large"
          variant="secondary"
        />
      ) : (
        <FallbackFarmMapPreview
          {...viewState}
          onShowOnlineMap={() => {
            setIsMapOpen(true);
          }}
        />
      )}
      <Modal animationType="slide" onRequestClose={() => setIsMapOpen(false)} presentationStyle="fullScreen" visible={isMapOpen}>
        <FullScreenFarmMapPreview
          mapLibre={mapLibre.module}
          onClose={() => setIsMapOpen(false)}
          onSaveLocation={onSaveLocation}
          onSeasonChanged={setSeason}
          onViewChanged={onViewChanged}
          season={season}
          viewState={viewState}
        />
      </Modal>
    </>
  );
}

function FullScreenFarmMapPreview({
  mapLibre,
  onClose,
  onSaveLocation,
  onSeasonChanged,
  onViewChanged,
  season,
  viewState,
}: {
  mapLibre: MapLibreModule;
  onClose: () => void;
  onSaveLocation?: (viewState: FarmMapPreviewViewState) => Promise<void>;
  onSeasonChanged: (season: FarmMapPreviewSeason) => void;
  onViewChanged: (viewState: FarmMapPreviewViewState) => void;
  season: FarmMapPreviewSeason;
  viewState: FarmMapPreviewViewState;
}) {
  const { Camera, MapComponent } = mapLibre;
  const [mapLoadError, setMapLoadError] = useState<string | undefined>();
  const [pendingViewState, setPendingViewState] = useState(viewState);
  const [saveError, setSaveError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const initialCamera = useMemo(() => getFarmMapPreviewCamera(viewState), []);

  async function handleSave() {
    setIsSaving(true);
    setSaveError(undefined);

    try {
      onViewChanged(pendingViewState);
      if (onSaveLocation) {
        await onSaveLocation(pendingViewState);
      }
      onClose();
    } catch (caughtError) {
      setSaveError(caughtError instanceof Error ? caughtError.message : "The map location could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleMapMoved(event: unknown) {
    const nextViewState = extractFarmMapPreviewViewState(event);

    if (nextViewState) {
      setPendingViewState(nextViewState);
    }
  }

  const message = saveError ?? mapLoadError ?? getFarmMapPreviewSeasonShortCaption(season);

  return (
    <View style={styles.fullScreenContainer}>
      <MapComponent
        attribution
        compass
        logo={false}
        mapStyle={getFarmMapPreviewOnlineStyle(season)}
        onDidFailLoadingMap={() => {
          setMapLoadError("Aerial imagery could not be loaded. The saved coordinates are still available locally.");
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
      </MapComponent>
      <View pointerEvents="none" style={styles.centerMarker}>
        <View style={styles.markerDot} />
      </View>
      <View style={styles.fullScreenTopPanel}>
        <View style={styles.fullScreenHeaderRow}>
          <View style={styles.fullScreenHeaderText}>
            <Text style={styles.fullScreenTitle}>Farm map location</Text>
            <Text style={styles.fullScreenCoordinate}>
              Latitude {formatMapCoordinate(pendingViewState.latitude)}, longitude {formatMapCoordinate(pendingViewState.longitude)}
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
            onPress={() => {
              onSeasonChanged(getNextFarmMapPreviewSeason(season));
            }}
            style={styles.mapButtonGridItem}
            variant="secondary"
          />
          <MapOverlayButton
            disabled={isSaving}
            label={isSaving ? "Saving..." : "Save farm location"}
            onPress={handleSave}
            style={styles.mapButtonGridItem}
          />
        </View>
      </View>
    </View>
  );
}

function loadMapLibre(): MapLibreLoadResult {
  if (!shouldAttemptNativeFarmMapPreview({ platformOS: Platform.OS })) {
    return {
      module: null,
      unavailableMessage: "Native map preview is not available on this platform. Manual address and coordinate saving still works here.",
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

    if (!MapComponent || !Camera) {
      return {
        module: null,
        unavailableMessage: "Native map preview loaded, but the expected MapLibre map components were not available. Manual address and coordinate saving still works here.",
      };
    }

    return {
      module: {
        Camera: Camera as ComponentType<any>,
        MapComponent: MapComponent as ComponentType<any>,
      },
    };
  } catch (caughtError) {
    return {
      module: null,
      unavailableMessage: nativeMapUnavailableMessage(caughtError),
    };
  }
}

function nativeMapUnavailableMessage(caughtError: unknown): string {
  const message = caughtError instanceof Error ? caughtError.message : "";

  if (message.includes("MLRNCameraModule") || message.includes("TurboModuleRegistry")) {
    return "MapLibre is installed in JavaScript, but this running app does not have the matching native map module. Rebuild and reinstall the development app, then reopen it.";
  }

  return "Native map preview could not be loaded in this running app. Manual address and coordinate saving still works here.";
}

function FallbackFarmMapPreview({
  latitude,
  longitude,
  zoom,
  pitch,
  bearing,
  onShowOnlineMap,
  unavailableMessage,
}: FarmMapPreviewViewState & {
  onShowOnlineMap?: () => void;
  unavailableMessage?: string;
}) {
  return (
    <View style={[styles.container, styles.fallbackContainer]}>
      <Text style={styles.fallbackTitle}>Saved map point</Text>
      <Text style={styles.fallbackCoordinate}>Latitude {latitude}, longitude {longitude}</Text>
      <Text style={styles.fallbackText}>Zoom {zoom}, pitch {pitch}, bearing {bearing}</Text>
      {onShowOnlineMap ? (
        <>
          <Text style={styles.fallbackText}>
            Open the full-screen map to move the farm point without the setup page scrolling at the same time.
          </Text>
          <Button label="Open full-screen map" onPress={onShowOnlineMap} size="large" variant="secondary" />
        </>
      ) : (
        <Text style={styles.fallbackText}>
          {unavailableMessage ?? "Native map preview could not be loaded in this running app. Manual address and coordinate saving still works here."}
        </Text>
      )}
    </View>
  );
}

function formatMapCoordinate(value: number): string {
  return value.toFixed(6).replace(/\.?0+$/, "");
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: farmMapPreviewAspectRatio,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    minHeight: 420,
    overflow: "hidden",
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fullScreenContainer: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  fullScreenMap: {
    ...StyleSheet.absoluteFillObject,
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
    fontFamily: theme.typography.headingFontFamily,
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
    borderRadius: 12,
    borderWidth: 3,
    height: 24,
    width: 24,
  },
  caption: {
    backgroundColor: theme.colors.surface,
    bottom: 0,
    left: 0,
    padding: theme.spacing.sm,
    position: "absolute",
    right: 0,
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
  fallbackContainer: {
    backgroundColor: theme.colors.surfaceMuted,
    gap: theme.spacing.sm,
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  fallbackTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.body,
    fontWeight: "800",
  },
  fallbackCoordinate: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  fallbackText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
