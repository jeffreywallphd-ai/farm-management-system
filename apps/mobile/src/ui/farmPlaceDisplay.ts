import {
  FARM_PLACE_KIND_LABELS,
  type FarmLocation,
  type FarmLocationId,
} from "../domain/farm/FarmLocation";

export interface FarmPlaceDisplay {
  place: FarmLocation;
  depth: number;
  path: string;
  typeLabel: string;
}

export function buildFarmPlaceDisplays(places: FarmLocation[]): FarmPlaceDisplay[] {
  const byParent = new Map<FarmLocationId | undefined, FarmLocation[]>();

  for (const place of places) {
    const siblings = byParent.get(place.parentId) ?? [];
    siblings.push(place);
    byParent.set(place.parentId, siblings);
  }

  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  const displays: FarmPlaceDisplay[] = [];
  const visited = new Set<FarmLocationId>();

  function visit(place: FarmLocation, depth: number, parentPath?: string) {
    if (visited.has(place.id)) {
      return;
    }

    visited.add(place.id);
    const path = parentPath ? `${parentPath} > ${place.name}` : place.name;
    displays.push({
      place,
      depth,
      path,
      typeLabel: FARM_PLACE_KIND_LABELS[place.kind],
    });

    for (const child of byParent.get(place.id) ?? []) {
      visit(child, depth + 1, path);
    }
  }

  for (const topLevelPlace of byParent.get(undefined) ?? []) {
    visit(topLevelPlace, 0);
  }

  for (const place of places) {
    if (!visited.has(place.id)) {
      visit(place, 0);
    }
  }

  return displays;
}

export function buildFarmPlaceOptions(places: FarmLocation[]) {
  return buildFarmPlaceDisplays(places).map((display) => ({
    label: display.path,
    value: display.place.id,
  }));
}

export function buildFarmPlacePath(places: FarmLocation[], placeId?: FarmLocationId): string | undefined {
  if (!placeId) {
    return undefined;
  }

  return buildFarmPlaceDisplays(places).find((display) => display.place.id === placeId)?.path;
}

export function hasGrowingPlace(places: FarmLocation[]) {
  return places.some((place) =>
    ["field", "bed", "row", "greenhouse", "highTunnel", "greenhouseBed"].includes(place.kind),
  );
}
