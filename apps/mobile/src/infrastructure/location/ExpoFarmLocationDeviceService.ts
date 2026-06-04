import * as Location from "expo-location";

import type { FarmDeviceCoordinates, FarmLocationDeviceService } from "../../application/ports/FarmLocationDeviceService";

export class ExpoFarmLocationDeviceService implements FarmLocationDeviceService {
  async getCurrentCoordinates(): Promise<FarmDeviceCoordinates> {
    await ensureForegroundLocationPermission();
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracyMeters: location.coords.accuracy ?? undefined,
    };
  }

  async geocodeAddress(addressText: string): Promise<FarmDeviceCoordinates> {
    const trimmedAddress = addressText.trim();

    if (!trimmedAddress) {
      throw new Error("Enter a farm address first.");
    }

    await ensureForegroundLocationPermission();
    const matches = await Location.geocodeAsync(trimmedAddress);
    const firstMatch = matches[0];

    if (!firstMatch) {
      throw new Error("No coordinates were found for that address. You can still enter coordinates manually.");
    }

    return {
      latitude: firstMatch.latitude,
      longitude: firstMatch.longitude,
    };
  }
}

export const expoFarmLocationDeviceService = new ExpoFarmLocationDeviceService();

async function ensureForegroundLocationPermission(): Promise<void> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== "granted") {
    throw new Error("Location permission was not granted. You can still enter coordinates manually.");
  }
}
