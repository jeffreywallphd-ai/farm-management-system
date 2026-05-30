import type { FarmEvent, FarmEventAttachment } from "../events/FarmEvent";
import type { FarmLocation } from "../farm/FarmLocation";
import type { IsoDateTimeString } from "../records/OperationalRecord";
import type { MobilePilotRecoveryCopy } from "./MobilePilotRecoveryCopy";

export const FARM_EVENT_RECOVERY_PACKAGE_VERSION = 1;
export const FARM_EVENT_RECOVERY_PACKAGE_SCHEMA_VERSION = 1;

export interface FarmEventRecoveryPackageAttachment extends FarmEventAttachment {
  packagePath: string;
}

export interface FarmEventRecoveryPackageEvent {
  event: FarmEvent;
  place?: FarmLocation;
  attachments: FarmEventRecoveryPackageAttachment[];
}

export interface FarmEventRecoveryPackageManifest {
  packageVersion: typeof FARM_EVENT_RECOVERY_PACKAGE_VERSION;
  createdAt: IsoDateTimeString;
  packageSchemaVersion: typeof FARM_EVENT_RECOVERY_PACKAGE_SCHEMA_VERSION;
  manualRecoveryCopy: MobilePilotRecoveryCopy;
  farmEvents: FarmEventRecoveryPackageEvent[];
  packageNotes: {
    privateData: true;
    userControlledExport: true;
    importRestoreIncluded: false;
    serverUploadIncluded: false;
    aiInterpretationIncluded: false;
  };
}
