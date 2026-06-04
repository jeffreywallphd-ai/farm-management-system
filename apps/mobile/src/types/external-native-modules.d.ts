declare module "expo-location" {
  export enum Accuracy {
    Lowest = 1,
    Low = 2,
    Balanced = 3,
    High = 4,
    Highest = 5,
    BestForNavigation = 6,
  }

  export interface PermissionResponse {
    status: "granted" | "denied" | "undetermined";
    granted: boolean;
    canAskAgain: boolean;
  }

  export interface LocationObject {
    coords: {
      latitude: number;
      longitude: number;
      accuracy: number | null;
    };
  }

  export interface LocationGeocodedLocation {
    latitude: number;
    longitude: number;
  }

  export function requestForegroundPermissionsAsync(): Promise<PermissionResponse>;
  export function getCurrentPositionAsync(options?: { accuracy?: Accuracy }): Promise<LocationObject>;
  export function geocodeAsync(address: string): Promise<LocationGeocodedLocation[]>;
}

declare module "@maplibre/maplibre-react-native" {
  import type { ComponentType } from "react";

  export const Map: ComponentType<any>;
  export const Camera: ComponentType<any>;
  export const GeoJSONSource: ComponentType<any>;
  export const Layer: ComponentType<any>;
}
