import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { FarmNoteTranscriptRepository } from "../../application/ports/FarmNoteTranscriptRepository";
import type { LocalRecordRepository } from "../../application/ports/LocalRecordRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import { openMobilePilotDatabase } from "../../infrastructure/sqlite/database";
import { SqliteFarmReferenceRepository } from "../../infrastructure/sqlite/repositories/SqliteFarmReferenceRepository";
import { SqliteFarmEventRepository } from "../../infrastructure/sqlite/repositories/SqliteFarmEventRepository";
import { SqliteFarmNoteTranscriptRepository } from "../../infrastructure/sqlite/repositories/SqliteFarmNoteTranscriptRepository";
import { SqliteHarvestRecordRepository } from "../../infrastructure/sqlite/repositories/SqliteHarvestRecordRepository";
import { SqliteOrganicCertificationRepository } from "../../infrastructure/sqlite/repositories/SqliteOrganicCertificationRepository";
import { SqlitePlanningRepository } from "../../infrastructure/sqlite/repositories/SqlitePlanningRepository";

type DatabaseState =
  | { status: "loading" }
  | {
      status: "ready";
      farmEventRepository: FarmEventRepository;
      farmNoteTranscriptRepository: FarmNoteTranscriptRepository;
      farmReferenceRepository: FarmReferenceRepository;
      localRecordRepository: LocalRecordRepository;
      organicCertificationRepository: OrganicCertificationRepository;
      planningRepository: PlanningRepository;
    }
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
            farmEventRepository: new SqliteFarmEventRepository(database),
            farmNoteTranscriptRepository: new SqliteFarmNoteTranscriptRepository(database),
            farmReferenceRepository: new SqliteFarmReferenceRepository(database),
            localRecordRepository: new SqliteHarvestRecordRepository(database),
            organicCertificationRepository: new SqliteOrganicCertificationRepository(database),
            planningRepository: new SqlitePlanningRepository(database),
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
