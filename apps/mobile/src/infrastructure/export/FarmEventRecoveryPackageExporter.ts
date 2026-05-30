import type { FarmEventRecoveryPackageManifest } from "../../domain/export/FarmEventRecoveryPackage";
import { farmEventRecoveryPackageManifestSchema } from "../validation/farmEventRecoveryPackageSchemas";

export function serializeFarmEventRecoveryPackageManifest(payload: FarmEventRecoveryPackageManifest): string {
  const validatedPayload = farmEventRecoveryPackageManifestSchema.parse(payload);
  return `${JSON.stringify(validatedPayload, null, 2)}\n`;
}
