export interface FarmDeviceCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface FarmLocationDeviceService {
  getCurrentCoordinates(): Promise<FarmDeviceCoordinates>;
  geocodeAddress(addressText: string): Promise<FarmDeviceCoordinates>;
}
