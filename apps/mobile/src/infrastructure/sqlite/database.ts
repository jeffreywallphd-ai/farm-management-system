import * as SQLite from "expo-sqlite";

import { runMigrations } from "./migrations/migrationRunner";

export const MOBILE_PILOT_DATABASE_NAME = "mobile-pilot-1.db";

export async function openMobilePilotDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync(MOBILE_PILOT_DATABASE_NAME);
  await runMigrations(database);
  return database;
}
