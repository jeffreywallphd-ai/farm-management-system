import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { FarmEventRepository } from "../../application/ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import { addOrganicBoundaryEvidence } from "../../application/use-cases/manage-organic-certification/AddOrganicBoundaryEvidence";
import { createOrganicPlacesReport } from "../../application/use-cases/manage-organic-certification/CreateOrganicPlacesReports";
import { saveOrganicPlaceProfile } from "../../application/use-cases/manage-organic-certification/SaveOrganicPlaceProfile";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import {
  ORGANIC_BOUNDARY_EVIDENCE_TYPE_LABELS,
  ORGANIC_BOUNDARY_EVIDENCE_TYPES,
  ORGANIC_PLACE_STATUS_LABELS,
  ORGANIC_PLACE_STATUSES,
  type OrganicBoundaryEvidenceType,
  type OrganicPlaceProfile,
  type OrganicPlaceStatus,
} from "../../domain/organic/OrganicPlace";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { buildFarmPlaceDisplays, buildFarmPlacePath } from "../farmPlaceDisplay";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DateField } from "../components/DateField";
import { EmptyState } from "../components/EmptyState";
import { FormField } from "../components/FormField";
import { OrganicDashboardButton } from "../components/OrganicDashboardButton";
import { OrganicEvidencePanel } from "../components/OrganicEvidencePanel";
import { OrganicFarmEventPrompt } from "../components/OrganicFarmEventPrompt";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";

type ReportType = "landEligibility" | "transitionStatus" | "boundaryBuffer" | "contaminationDrift";

export function OrganicPlacesScreen({
  farm,
  farmEventRepository,
  farmReferenceRepository,
  locations,
  repository,
}: {
  farm: Farm;
  farmEventRepository: FarmEventRepository;
  farmReferenceRepository: FarmReferenceRepository;
  locations: FarmLocation[];
  repository: OrganicCertificationRepository;
}) {
  const [profiles, setProfiles] = useState<OrganicPlaceProfile[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(locations[0]?.id ?? "");
  const [organicStatus, setOrganicStatus] = useState<OrganicPlaceStatus>("transitioning");
  const [transitionStartDate, setTransitionStartDate] = useState("");
  const [lastProhibitedSubstanceDate, setLastProhibitedSubstanceDate] = useState("");
  const [organicEligibilityDate, setOrganicEligibilityDate] = useState("");
  const [certifiedOrganicSinceDate, setCertifiedOrganicSinceDate] = useState("");
  const [boundaryDescription, setBoundaryDescription] = useState("");
  const [bufferDescription, setBufferDescription] = useState("");
  const [adjacentLandUse, setAdjacentLandUse] = useState("");
  const [contaminationRisks, setContaminationRisks] = useState("");
  const [certifierApproved, setCertifierApproved] = useState("false");
  const [certifierNotes, setCertifierNotes] = useState("");
  const [evidenceType, setEvidenceType] = useState<OrganicBoundaryEvidenceType>("note");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [evidenceAttachmentUri, setEvidenceAttachmentUri] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [report, setReport] = useState<string | undefined>();

  const placeOptions = useMemo(
    () => buildFarmPlaceDisplays(locations).map((display) => ({ label: display.path, value: display.place.id })),
    [locations],
  );
  const selectedProfile = profiles.find((profile) => profile.placeId === selectedPlaceId);

  async function loadProfiles() {
    setProfiles(await repository.listPlaceProfiles(farm.id));
  }

  useEffect(() => {
    loadProfiles();
  }, [farm.id, repository]);

  useEffect(() => {
    if (!selectedPlaceId && locations[0]) {
      setSelectedPlaceId(locations[0].id);
    }
  }, [locations, selectedPlaceId]);

  useEffect(() => {
    const profile = profiles.find((candidate) => candidate.placeId === selectedPlaceId);
    setOrganicStatus(profile?.organicStatus ?? "transitioning");
    setTransitionStartDate(profile?.transitionStartDate ?? "");
    setLastProhibitedSubstanceDate(profile?.lastProhibitedSubstanceDate ?? "");
    setOrganicEligibilityDate(profile?.organicEligibilityDate ?? "");
    setCertifiedOrganicSinceDate(profile?.certifiedOrganicSinceDate ?? "");
    setBoundaryDescription(profile?.boundaryDescription ?? "");
    setBufferDescription(profile?.bufferDescription ?? "");
    setAdjacentLandUse(profile?.adjacentLandUse ?? "");
    setContaminationRisks(profile?.contaminationRisks ?? "");
    setCertifierApproved(profile?.certifierApproved ? "true" : "false");
    setCertifierNotes(profile?.certifierNotes ?? "");
  }, [profiles, selectedPlaceId]);

  async function handleSavePlaceProfile() {
    setError(undefined);
    setReport(undefined);

    try {
      await saveOrganicPlaceProfile(
        {
          farmId: farm.id,
          placeId: selectedPlaceId,
          organicStatus,
          transitionStartDate,
          lastProhibitedSubstanceDate,
          organicEligibilityDate,
          certifiedOrganicSinceDate,
          boundaryDescription,
          bufferDescription,
          adjacentLandUse,
          contaminationRisks,
          certifierApproved: certifierApproved === "true",
          certifierNotes,
        },
        { clock: systemClock, farmReferenceRepository, repository },
      );
      await loadProfiles();
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : "Organic place details could not be saved.");
    }
  }

  async function handleAddEvidence() {
    setError(undefined);
    setReport(undefined);

    try {
      await addOrganicBoundaryEvidence(
        {
          farmId: farm.id,
          placeId: selectedPlaceId,
          evidenceType,
          description: evidenceDescription,
          attachmentUri: evidenceAttachmentUri,
        },
        {
          clock: systemClock,
          farmReferenceRepository,
          idGenerator: localIdGenerator,
          repository,
        },
      );
      setEvidenceDescription("");
      setEvidenceAttachmentUri("");
      await loadProfiles();
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : "Boundary evidence could not be saved.");
    }
  }

  async function handleCreateReport(reportType: ReportType) {
    setError(undefined);
    setReport(await createOrganicPlacesReport({ farm, reportType }, { clock: systemClock, farmReferenceRepository, repository }));
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Organic Certification"
        supportingText="Track organic status, transition timing, boundaries, buffers, and local evidence by farm place."
        title="Organic places"
      />
      <OrganicDashboardButton />
      <OrganicEvidencePanel category="land" farm={farm} farmEventRepository={farmEventRepository} repository={repository} />
      {locations.length === 0 ? (
        <Card>
          <EmptyState text="Add farm places before recording organic land and buffer details." />
        </Card>
      ) : (
        <>
          <Card>
            <SectionHeading
              detail="These details help organize land eligibility and boundary evidence for certifier review."
              title="Organic place details"
            />
            <OrganicFarmEventPrompt category="land" />
            <SelectField label="Farm place" onChange={setSelectedPlaceId} options={placeOptions} value={selectedPlaceId} />
            <SelectField
              label="Organic place status"
              onChange={(value) => setOrganicStatus(value as OrganicPlaceStatus)}
              options={ORGANIC_PLACE_STATUSES.map((status) => ({ label: ORGANIC_PLACE_STATUS_LABELS[status], value: status }))}
              value={organicStatus}
            />
            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                {selectedProfile
                  ? `Current record: ${ORGANIC_PLACE_STATUS_LABELS[selectedProfile.organicStatus]} for ${buildFarmPlacePath(locations, selectedPlaceId)}`
                  : "No organic details saved for this place yet."}
              </Text>
            </View>
            <DateField label="Transition start date" onChangeText={setTransitionStartDate} placeholder="YYYY-MM-DD" value={transitionStartDate} />
            <DateField label="Last prohibited substance date" onChangeText={setLastProhibitedSubstanceDate} placeholder="YYYY-MM-DD" value={lastProhibitedSubstanceDate} />
            <DateField label="Organic eligibility date" onChangeText={setOrganicEligibilityDate} placeholder="YYYY-MM-DD or leave blank to calculate" value={organicEligibilityDate} />
            <DateField label="Certified organic since" onChangeText={setCertifiedOrganicSinceDate} placeholder="YYYY-MM-DD" value={certifiedOrganicSinceDate} />
            <FormField label="Boundary description" multiline onChangeText={setBoundaryDescription} placeholder="Fences, roads, hedgerows, signs, map notes" value={boundaryDescription} />
            <FormField label="Buffer description" multiline onChangeText={setBufferDescription} placeholder="Buffer strips, runoff diversion, neighbor boundary" value={bufferDescription} />
            <FormField label="Adjacent land use" multiline onChangeText={setAdjacentLandUse} placeholder="Neighbor crop field, road, pasture, woods" value={adjacentLandUse} />
            <FormField label="Contamination or drift risks" multiline onChangeText={setContaminationRisks} placeholder="Known concerns, incidents, or monitoring notes" value={contaminationRisks} />
            <SelectField
              label="Certifier approved in your records?"
              onChange={setCertifierApproved}
              options={[
                { label: "No / not recorded", value: "false" },
                { label: "Yes", value: "true" },
              ]}
              value={certifierApproved}
            />
            <FormField label="Certifier notes" multiline onChangeText={setCertifierNotes} placeholder="Optional notes from certifier review" value={certifierNotes} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label="Save organic place details" onPress={handleSavePlaceProfile} size="large" />
          </Card>
          <Card>
            <SectionHeading detail="Record boundary photos, maps, notes, or document references that stay local to this device." title="Boundary and buffer evidence" />
            <OrganicFarmEventPrompt category="land" />
            <SelectField
              label="Evidence type"
              onChange={(value) => setEvidenceType(value as OrganicBoundaryEvidenceType)}
              options={ORGANIC_BOUNDARY_EVIDENCE_TYPES.map((type) => ({ label: ORGANIC_BOUNDARY_EVIDENCE_TYPE_LABELS[type], value: type }))}
              value={evidenceType}
            />
            <FormField label="Evidence description" multiline onChangeText={setEvidenceDescription} placeholder="Photo of north buffer, map note, drift concern, or document reference" value={evidenceDescription} />
            <FormField label="Optional local attachment URI or note link" onChangeText={setEvidenceAttachmentUri} placeholder="Optional local URI" value={evidenceAttachmentUri} />
            <Button label="Add boundary evidence" onPress={handleAddEvidence} size="large" variant="secondary" />
          </Card>
          <Card>
            <SectionHeading title="Organic place reports" />
            <View style={styles.buttonStack}>
              <Button label="Land Eligibility Report" onPress={() => handleCreateReport("landEligibility")} size="large" variant="secondary" />
              <Button label="Transition Status Report" onPress={() => handleCreateReport("transitionStatus")} size="large" variant="secondary" />
              <Button label="Boundary and Buffer Report" onPress={() => handleCreateReport("boundaryBuffer")} size="large" variant="secondary" />
              <Button label="Contamination/Drift Report" onPress={() => handleCreateReport("contaminationDrift")} size="large" variant="secondary" />
            </View>
            {report ? <Text style={styles.report}>{report}</Text> : null}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttonStack: {
    gap: theme.spacing.sm,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  report: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  summary: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  summaryText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
});
