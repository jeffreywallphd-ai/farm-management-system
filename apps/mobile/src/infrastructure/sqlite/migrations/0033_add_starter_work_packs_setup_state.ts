import type { Migration } from "./migrationRunner";

export const addStarterWorkPacksSetupState: Migration = {
  version: 33,
  name: "add_starter_work_packs_setup_state",
  statements: [
    "ALTER TABLE farms ADD COLUMN starter_work_packs_setup_completed_at TEXT;",
    `UPDATE farms
      SET starter_work_packs_setup_completed_at = created_at
      WHERE starter_work_packs_setup_completed_at IS NULL;`,
  ],
};
