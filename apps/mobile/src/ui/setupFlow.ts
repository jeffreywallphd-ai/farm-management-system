import type { Farm } from "../domain/farm/Farm";

export type StartupStep = "farmName" | "coreFarmPlaces" | "starterWorkPacks" | "home";

export function getStartupStep(farm: Farm | null): StartupStep {
  if (!farm) {
    return "farmName";
  }

  if (!farm.corePlacesSetupCompletedAt) {
    return "coreFarmPlaces";
  }

  if (!farm.starterWorkPacksSetupCompletedAt) {
    return "starterWorkPacks";
  }

  return "home";
}
