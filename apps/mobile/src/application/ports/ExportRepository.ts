export interface MobilePilotExportFile {
  uri: string;
  fileName: string;
  mimeType: "application/json";
}

export interface ExportRepository {
  createRecoveryCopy(): Promise<MobilePilotExportFile>;
  shareRecoveryCopy(file: MobilePilotExportFile): Promise<void>;
}
