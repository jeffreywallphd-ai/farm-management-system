export interface MobilePilotExportFile {
  uri: string;
  fileName: string;
  mimeType: "application/json";
}

export interface ExportRepository {
  writeRecoveryCopy(input: { fileName: string; contents: string }): Promise<MobilePilotExportFile>;
  shareRecoveryCopy(file: MobilePilotExportFile): Promise<void>;
}
