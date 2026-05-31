import type { Farm } from "../domain/farm/Farm";

export type StartupStep = "farmName" | "coreFarmPlaces" | "home";

export function getStartupStep(farm: Farm | null): StartupStep {
  if (!farm) {
    return "farmName";
  }

  if (!farm.corePlacesSetupCompletedAt) {
    return "coreFarmPlaces";
  }

  return "home";
}
