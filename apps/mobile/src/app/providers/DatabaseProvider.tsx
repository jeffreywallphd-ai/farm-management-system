import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import { openMobilePilotDatabase } from "../../infrastructure/sqlite/database";
import { SqliteFarmReferenceRepository } from "../../infrastructure/sqlite/repositories/SqliteFarmReferenceRepository";

type DatabaseState =
  | { status: "loading" }
  | { status: "ready"; farmReferenceRepository: FarmReferenceRepository }
  | { status: "error"; message: string };

const DatabaseContext = createContext<DatabaseState>({ status: "loading" });

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DatabaseState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function initializeDatabase() {
      try {
        const database = await openMobilePilotDatabase();

        if (isMounted) {
          setState({
            status: "ready",
            farmReferenceRepository: new SqliteFarmReferenceRepository(database),
          });
        }
      } catch {
        if (isMounted) {
          setState({
            status: "error",
            message: "The app could not open local storage on this device.",
          });
        }
      }
    }

    initializeDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => state, [state]);

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
  return useContext(DatabaseContext);
}
