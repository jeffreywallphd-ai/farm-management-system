import {
  FARM_EVENT_RECOVERY_PACKAGE_SCHEMA_VERSION,
  FARM_EVENT_RECOVERY_PACKAGE_VERSION,
  type FarmEventRecoveryPackageManifest,
} from "../../../domain/export/FarmEventRecoveryPackage";
import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmEventRepository } from "../../ports/FarmEventRepository";
import type { Clock } from "../../ports/Clock";
import type { ExportRepository, MobilePilotExportFile, RecoveryPackageMediaFile } from "../../ports/ExportRepository";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { LocalRecordRepository } from "../../ports/LocalRecordRepository";
import { serializeFarmEventRecoveryPackageManifest } from "../../../infrastructure/export/FarmEventRecoveryPackageExporter";
import { buildMobilePilotRecoveryCopyPayload } from "./CreateHarvestRecoveryCopy";

export async function createFarmEventRecoveryPackage(
  input: { farmId: FarmId },
  dependencies: {
    clock: Clock;
    exportRepository: ExportRepository;
    farmEventRepository: FarmEventRepository;
    farmReferenceRepository: FarmReferenceRepository;
    localRecordRepository: LocalRecordRepository;
  },
): Promise<MobilePilotExportFile> {
  const createdAt = dependencies.clock.now().toISOString();
  const [manualRecoveryCopy, farmEvents] = await Promise.all([
    buildMobilePilotRecoveryCopyPayload(input, dependencies),
    dependencies.farmEventRepository.listFarmEvents(input.farmId),
  ]);
  const packageEvents = farmEvents.map((view) => ({
    ...view,
    attachments: view.attachments.map((attachment) => ({
      ...attachment,
      packagePath: mediaPackagePath(attachment),
    })),
  }));
  const manifest: FarmEventRecoveryPackageManifest = {
    packageVersion: FARM_EVENT_RECOVERY_PACKAGE_VERSION,
    createdAt,
    packageSchemaVersion: FARM_EVENT_RECOVERY_PACKAGE_SCHEMA_VERSION,
    manualRecoveryCopy,
    farmEvents: packageEvents,
    packageNotes: {
      privateData: true,
      userControlledExport: true,
      importRestoreIncluded: false,
      serverUploadIncluded: false,
      aiInterpretationIncluded: false,
    },
  };
  const metadataContents = serializeFarmEventRecoveryPackageManifest(manifest);
  const mediaFiles: RecoveryPackageMediaFile[] = packageEvents.flatMap((event) =>
    event.attachments.map((attachment) => ({
      sourceUri: attachment.localUri,
      packagePath: attachment.packagePath,
    })),
  );
  const file = await dependencies.exportRepository.writeRecoveryPackage({
    fileName: formatFarmEventRecoveryPackageFileName(dependencies.clock.now()),
    metadataContents,
    mediaFiles,
  });
  await dependencies.exportRepository.shareRecoveryCopy(file);
  return file;
}

export function formatFarmEventRecoveryPackageFileName(date: Date): string {
  const timestamp = date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "");

  return `farm-pilot-media-recovery-package-${timestamp}.zip`;
}

function mediaPackagePath(attachment: { eventId: string; id: string; kind: string; mimeType?: string }): string {
  return `media/farm-events/${sanitizePathSegment(attachment.eventId)}/${sanitizePathSegment(attachment.id)}.${extensionForAttachment(
    attachment,
  )}`;
}

function extensionForAttachment(attachment: { kind: string; mimeType?: string }): string {
  if (attachment.kind === "voiceMemo") {
    return "m4a";
  }
  if (attachment.mimeType === "image/png") {
    return "png";
  }
  if (attachment.mimeType === "image/heic" || attachment.mimeType === "image/heif") {
    return "heic";
  }
  return "jpg";
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}
