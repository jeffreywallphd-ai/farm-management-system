export interface MobilePilotExportFile {
  uri: string;
  fileName: string;
  mimeType: "application/json" | "application/zip";
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
  shareRecoveryCopy(file: MobilePilotExportFile): Promise<void>;
}
