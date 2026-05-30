import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { strToU8, zipSync } from "fflate";

import type { ExportRepository, MobilePilotExportFile } from "../../application/ports/ExportRepository";

export class ExpoRecoveryCopyShareAdapter implements ExportRepository {
  async writeRecoveryCopy(input: { fileName: string; contents: string }): Promise<MobilePilotExportFile> {
    const baseDirectory = FileSystem.documentDirectory;

    if (!baseDirectory) {
      throw new Error("Recovery copy storage is unavailable on this device.");
    }

    const uri = `${baseDirectory}${input.fileName}`;
    await FileSystem.writeAsStringAsync(uri, input.contents, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return {
      uri,
      fileName: input.fileName,
      mimeType: "application/json",
    };
  }

  async writeRecoveryPackage(input: {
    fileName: string;
    metadataContents: string;
    mediaFiles: { sourceUri: string; packagePath: string }[];
  }): Promise<MobilePilotExportFile> {
    const baseDirectory = FileSystem.documentDirectory;

    if (!baseDirectory) {
      throw new Error("Recovery package storage is unavailable on this device.");
    }

    const entries: Record<string, Uint8Array> = {
      "metadata/mobile-pilot-recovery-package.json": strToU8(input.metadataContents),
    };

    for (const mediaFile of input.mediaFiles) {
      const base64Contents = await FileSystem.readAsStringAsync(mediaFile.sourceUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      entries[mediaFile.packagePath] = base64ToBytes(base64Contents);
    }

    const zipBytes = zipSync(entries, { level: 6 });
    const uri = `${baseDirectory}${input.fileName}`;
    await FileSystem.writeAsStringAsync(uri, bytesToBase64(zipBytes), {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      uri,
      fileName: input.fileName,
      mimeType: "application/zip",
    };
  }

  async shareRecoveryCopy(file: MobilePilotExportFile): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      throw new Error("Sharing is not available on this device.");
    }

    await Sharing.shareAsync(file.uri, {
      mimeType: file.mimeType,
      dialogTitle: "Save recovery copy",
      UTI: file.mimeType === "application/zip" ? "public.zip-archive" : "public.json",
    });
  }
}

function base64ToBytes(value: string): Uint8Array {
  const binary = globalThis.atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return globalThis.btoa(binary);
}
