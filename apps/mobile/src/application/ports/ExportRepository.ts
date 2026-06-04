export interface MobilePilotExportFile {
  uri: string;
  fileName: string;
  mimeType: "application/json" | "application/zip" | "application/pdf";
}

export interface RecoveryPackageMediaFile {
  sourceUri: string;
  packagePath: string;
}

export interface ExportRepository {
  writeRecoveryCopy(input: { fileName: string; contents: string }): Promise<MobilePilotExportFile>;
  writeRecoveryPackage(input: {
    fileName: string;
    metadataContents: string;
    mediaFiles: RecoveryPackageMediaFile[];
  }): Promise<MobilePilotExportFile>;
  writePdf(input: { fileName: string; bytes: Uint8Array }): Promise<MobilePilotExportFile>;
  shareRecoveryCopy(file: MobilePilotExportFile): Promise<void>;
}
