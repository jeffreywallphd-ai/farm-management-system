import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { FarmMapRepository } from "../../application/ports/FarmMapRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { FarmhandRepository } from "../../application/ports/FarmhandRepository";
import type { FarmNoteTranscriptRepository } from "../../application/ports/FarmNoteTranscriptRepository";
import type { LocalRecordRepository } from "../../application/ports/LocalRecordRepository";
import type { InventoryRepository } from "../../application/ports/InventoryRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import { openMobilePilotDatabase } from "../../infrastructure/sqlite/database";
import { SqliteFarmReferenceRepository } from "../../infrastructure/sqlite/repositories/SqliteFarmReferenceRepository";
import { SqliteFarmMapRepository } from "../../infrastructure/sqlite/repositories/SqliteFarmMapRepository";
import { SqliteFarmEventRepository } from "../../infrastructure/sqlite/repositories/SqliteFarmEventRepository";
import { SqliteFarmhandRepository } from "../../infrastructure/sqlite/repositories/SqliteFarmhandRepository";
import { SqliteFarmNoteTranscriptRepository } from "../../infrastructure/sqlite/repositories/SqliteFarmNoteTranscriptRepository";
import { SqliteHarvestRecordRepository } from "../../infrastructure/sqlite/repositories/SqliteHarvestRecordRepository";
import { SqliteInventoryRepository } from "../../infrastructure/sqlite/repositories/SqliteInventoryRepository";
import { SqliteOrganicCertificationRepository } from "../../infrastructure/sqlite/repositories/SqliteOrganicCertificationRepository";
import { SqlitePlanningRepository } from "../../infrastructure/sqlite/repositories/SqlitePlanningRepository";

type DatabaseState =
  | { status: "loading" }
  | {
      status: "ready";
      farmEventRepository: FarmEventRepository;
      farmhandRepository: FarmhandRepository;
      farmMapRepository: FarmMapRepository;
      farmNoteTranscriptRepository: FarmNoteTranscriptRepository;
      farmReferenceRepository: FarmReferenceRepository;
      inventoryRepository: InventoryRepository;
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
            farmhandRepository: new SqliteFarmhandRepository(database),
            farmMapRepository: new SqliteFarmMapRepository(database),
            farmNoteTranscriptRepository: new SqliteFarmNoteTranscriptRepository(database),
            farmReferenceRepository: new SqliteFarmReferenceRepository(database),
            inventoryRepository: new SqliteInventoryRepository(database),
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
