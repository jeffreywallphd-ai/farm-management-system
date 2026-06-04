import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { FarmhandRepository } from "../application/ports/FarmhandRepository";
import type { WeekStartsOn } from "../application/use-cases/manage-farmhands/ListFarmhandWork";
import { systemClock } from "../infrastructure/system/clock";

type DatePreferencesContextValue = {
  error?: string;
  isLoaded: boolean;
  saveWeekStartsOn: (weekStartsOn: WeekStartsOn) => Promise<void>;
  weekStartsOn: WeekStartsOn;
};

const DatePreferencesContext = createContext<DatePreferencesContextValue>({
  isLoaded: true,
  saveWeekStartsOn: async () => undefined,
  weekStartsOn: 1,
});

export function DatePreferencesProvider({
  children,
  farmhandRepository,
  farmId,
}: {
  children: ReactNode;
  farmhandRepository: FarmhandRepository;
  farmId: string;
}) {
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      setIsLoaded(false);
      setError(undefined);
      try {
        const settings = await farmhandRepository.getScheduleSettings(farmId);
        if (isMounted) {
          setWeekStartsOn(settings?.weekStartsOn ?? 1);
        }
      } catch {
        if (isMounted) {
          setError("Date setup could not be loaded from this device.");
        }
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [farmId, farmhandRepository]);

  const saveWeekStartsOn = useCallback(async (nextWeekStartsOn: WeekStartsOn) => {
    setWeekStartsOn(nextWeekStartsOn);
    setError(undefined);
    try {
      await farmhandRepository.saveScheduleSettings({
        farmId,
        updatedAt: systemClock.now().toISOString(),
        weekStartsOn: nextWeekStartsOn,
      });
    } catch {
      setError("Date setup could not be saved on this device.");
    }
  }, [farmId, farmhandRepository]);

  const value = useMemo(
    () => ({ error, isLoaded, saveWeekStartsOn, weekStartsOn }),
    [error, isLoaded, saveWeekStartsOn, weekStartsOn],
  );

  return <DatePreferencesContext.Provider value={value}>{children}</DatePreferencesContext.Provider>;
}

export function useDatePreferences() {
  return useContext(DatePreferencesContext);
}
