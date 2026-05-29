import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

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

  async shareRecoveryCopy(file: MobilePilotExportFile): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      throw new Error("Sharing is not available on this device.");
    }

    await Sharing.shareAsync(file.uri, {
      mimeType: file.mimeType,
      dialogTitle: "Save recovery copy",
      UTI: "public.json",
    });
  }
}
