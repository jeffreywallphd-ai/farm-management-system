import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import type { Farm } from "../../domain/farm/Farm";
import type { ExportRepository, MobilePilotExportFile } from "../../application/ports/ExportRepository";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { LocalRecordRepository } from "../../application/ports/LocalRecordRepository";
import { createHarvestRecoveryCopy } from "../../application/use-cases/export-mobile-pilot-data/CreateHarvestRecoveryCopy";
import { systemClock } from "../../infrastructure/system/clock";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { LocalSaveConfirmation } from "../components/LocalSaveConfirmation";
import { PageHeader } from "../components/PageHeader";
import { PrivateDataNotice } from "../components/PrivateDataNotice";
import { Screen } from "../components/Screen";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";

export function RecoveryCopyExportScreen({
  exportRepository,
  farm,
  farmReferenceRepository,
  localRecordRepository,
}: {
  exportRepository: ExportRepository;
  farm: Farm;
  farmReferenceRepository: FarmReferenceRepository;
  localRecordRepository: LocalRecordRepository;
}) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [file, setFile] = useState<MobilePilotExportFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    setError(null);
    setFile(null);

    try {
      const nextFile = await createHarvestRecoveryCopy(
        { farmId: farm.id },
        { clock: systemClock, exportRepository, farmReferenceRepository, localRecordRepository },
      );
      setFile(nextFile);
    } catch {
      setError("The recovery copy could not be created or shared. Your saved records were not changed.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Data safety"
        supportingText="Save or share a copy of data stored on this device."
        title="Create recovery copy"
      />
      <PrivateDataNotice text="The recovery copy contains private farm setup and harvest records. The app does not upload it automatically." />
      <Card>
        <SectionHeading
          detail="This includes farm setup, locations, tracked items, and saved harvest records. Restore/import is not available yet."
          title="What is included"
        />
        <Text style={styles.body}>
          Choose where to save or share the JSON file. Keep it somewhere you trust in case this device, app, or test build is lost.
        </Text>
        {file ? <LocalSaveConfirmation message={`Recovery copy created: ${file.fileName}`} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button disabled={isExporting} label={isExporting ? "Creating..." : "Create recovery copy"} onPress={handleExport} />
      </Card>
      <Button label="Back to farm" onPress={() => router.replace("/")} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
