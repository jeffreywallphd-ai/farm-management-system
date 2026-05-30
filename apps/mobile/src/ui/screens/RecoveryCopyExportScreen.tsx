import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import type { Farm } from "../../domain/farm/Farm";
import type { ExportRepository, MobilePilotExportFile } from "../../application/ports/ExportRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { LocalRecordRepository } from "../../application/ports/LocalRecordRepository";
import { createFarmEventRecoveryPackage } from "../../application/use-cases/export-mobile-pilot-data/CreateFarmEventRecoveryPackage";
import { createMobilePilotRecoveryCopy } from "../../application/use-cases/export-mobile-pilot-data/CreateHarvestRecoveryCopy";
import { systemClock } from "../../infrastructure/system/clock";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { LocalSaveConfirmation } from "../components/LocalSaveConfirmation";
import { PageHeader } from "../components/PageHeader";
import { PrivateDataNotice } from "../components/PrivateDataNotice";
import { Screen } from "../components/Screen";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";
import { replaceRoute } from "../navigation";

export function RecoveryCopyExportScreen({
  exportRepository,
  farm,
  farmEventRepository,
  farmReferenceRepository,
  localRecordRepository,
}: {
  exportRepository: ExportRepository;
  farm: Farm;
  farmEventRepository: FarmEventRepository;
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
      const nextFile = await createMobilePilotRecoveryCopy(
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

  async function handleMediaPackageExport() {
    setIsExporting(true);
    setError(null);
    setFile(null);

    try {
      const nextFile = await createFarmEventRecoveryPackage(
        { farmId: farm.id },
        { clock: systemClock, exportRepository, farmEventRepository, farmReferenceRepository, localRecordRepository },
      );
      setFile(nextFile);
    } catch {
      setError("The media recovery package could not be created or shared. Your saved records were not changed.");
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
      <PrivateDataNotice text="Recovery files contain private farm information. The app does not upload them automatically." />
      <Card>
        <SectionHeading
          detail="This includes farm setup, locations, tracked items, harvests, material use, and inventory counts. Restore/import is not available yet."
          title="Manual record JSON"
        />
        <Text style={styles.body}>
          Choose where to save or share the JSON file. Keep it somewhere you trust in case this device, app, or test build is lost.
        </Text>
        {file ? <LocalSaveConfirmation message={`Recovery copy created: ${file.fileName}`} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button disabled={isExporting} label={isExporting ? "Creating..." : "Create recovery copy"} onPress={handleExport} />
      </Card>
      <Card>
        <SectionHeading
          detail="This ZIP includes the manual JSON data plus saved farm-note metadata, voice memos, and photos. Restore/import is not available yet."
          title="Farm-note media package"
        />
        <Text style={styles.body}>
          Use this before relying on voice/photo notes. You choose where the ZIP is saved or shared.
        </Text>
        <Button
          disabled={isExporting}
          label={isExporting ? "Creating..." : "Create media recovery package"}
          onPress={handleMediaPackageExport}
          variant="secondary"
        />
      </Card>
      <Button label="Back to farm" onPress={() => replaceRoute(router, "/")} variant="secondary" />
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
