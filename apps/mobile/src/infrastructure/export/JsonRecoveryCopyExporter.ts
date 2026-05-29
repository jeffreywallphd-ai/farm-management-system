import type { MobilePilotRecoveryCopy } from "../../domain/export/MobilePilotRecoveryCopy";
import { mobilePilotRecoveryCopySchema } from "../validation/recoveryCopySchemas";

export function serializeRecoveryCopy(payload: MobilePilotRecoveryCopy): string {
  const validatedPayload = mobilePilotRecoveryCopySchema.parse(payload);
  return `${JSON.stringify(validatedPayload, null, 2)}\n`;
}
