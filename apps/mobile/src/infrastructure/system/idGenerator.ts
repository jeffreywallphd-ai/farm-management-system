import type { IdGenerator } from "../../application/ports/IdGenerator";

export const localIdGenerator: IdGenerator = {
  newId: () => `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
};
