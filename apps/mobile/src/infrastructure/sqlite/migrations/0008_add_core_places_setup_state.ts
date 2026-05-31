import type { Migration } from "./migrationRunner";

export const addCorePlacesSetupState: Migration = {
  version: 8,
  name: "add_core_places_setup_state",
  statements: [
    "ALTER TABLE farms ADD COLUMN core_places_setup_completed_at TEXT;",
    `UPDATE farms
      SET core_places_setup_completed_at = created_at
      WHERE core_places_setup_completed_at IS NULL;`,
  ],
};
