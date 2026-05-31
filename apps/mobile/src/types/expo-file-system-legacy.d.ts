declare module "expo-file-system/legacy" {
  export const documentDirectory: string | null;
  export const EncodingType: { UTF8: string; Base64: string };
  export function getInfoAsync(uri: string): Promise<{ exists: boolean; size?: number; uri?: string }>;
  export function writeAsStringAsync(uri: string, contents: string, options?: { encoding?: string }): Promise<void>;
  export function readAsStringAsync(uri: string, options?: { encoding?: string }): Promise<string>;
  export function makeDirectoryAsync(uri: string, options?: { intermediates?: boolean }): Promise<void>;
  export function copyAsync(input: { from: string; to: string }): Promise<void>;
  export function moveAsync(input: { from: string; to: string }): Promise<void>;
  export function deleteAsync(uri: string, options?: { idempotent?: boolean }): Promise<void>;
  export function createDownloadResumable(
    url: string,
    fileUri: string,
    options?: unknown,
    callback?: (progress: {
      totalBytesWritten: number;
      totalBytesExpectedToWrite: number;
    }) => void,
  ): { downloadAsync: () => Promise<{ uri: string } | undefined> };
}
