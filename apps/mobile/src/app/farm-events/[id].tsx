import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { FarmRouteGate } from "../../bootstrap/FarmRouteGate";
import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { FarmEventView } from "../../application/ports/FarmEventRepository";
import type { useDatabase } from "../../bootstrap/providers/DatabaseProvider";
import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import { getFarmEventDetail } from "../../application/use-cases/view-farm-events/GetFarmEventDetail";
import { getFarmNoteTranscript } from "../../application/use-cases/transcribe-farm-note/GetFarmNoteTranscript";
import { listOrganicEvidenceLinksForFarmNote } from "../../application/use-cases/manage-organic-certification/ListOrganicEvidence";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { ExpoWhisperModelRepository } from "../../infrastructure/transcription/ExpoWhisperModelRepository";
import { WhisperRnVoiceMemoTranscriptionService } from "../../infrastructure/transcription/WhisperRnVoiceMemoTranscriptionService";
import { FarmEventDetailScreen } from "../../ui/screens/FarmEventDetailScreen";
import type { FarmNoteTranscript } from "../../domain/events/FarmNoteTranscript";
import type { OrganicEvidenceLink } from "../../domain/organic/OrganicEvidenceLink";

type ReadyDatabase = Extract<ReturnType<typeof useDatabase>, { status: "ready" }>;
const transcriptionModelRepository = new ExpoWhisperModelRepository();
const transcriptionService = new WhisperRnVoiceMemoTranscriptionService({ modelRepository: transcriptionModelRepository });

export default function FarmEventDetailRoute() {
  return (
    <FarmRouteGate>
      {({ farm, database }) => <FarmEventDetailRouteContent database={database} farm={farm} />}
    </FarmRouteGate>
  );
}

function FarmEventDetailRouteContent({
  farm,
  database,
}: {
  farm: Farm;
  database: ReadyDatabase;
}) {
  const params = useLocalSearchParams<{ id?: string }>();
  const [event, setEvent] = useState<FarmEventView | null>(null);
  const [transcript, setTranscript] = useState<FarmNoteTranscript | null>(null);
  const [evidenceLinks, setEvidenceLinks] = useState<OrganicEvidenceLink[]>([]);
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true);
      const [nextEvent, nextTranscript, nextLocations] = await Promise.all([
        params.id
          ? getFarmEventDetail(farm.id, params.id, {
              farmEventRepository: database.farmEventRepository,
            })
          : Promise.resolve(null),
        params.id
          ? getFarmNoteTranscript(farm.id, params.id, {
              transcriptionRepository: database.farmNoteTranscriptRepository,
            })
          : Promise.resolve(null),
        listLocations(farm.id, database.farmReferenceRepository),
      ]);
      const nextEvidenceLinks = params.id
        ? await listOrganicEvidenceLinksForFarmNote(
            { farmId: farm.id, farmEventId: params.id },
            { repository: database.organicCertificationRepository },
          )
        : [];
      setEvent(nextEvent);
      setTranscript(nextTranscript);
      setLocations(nextLocations);
      setEvidenceLinks(nextEvidenceLinks);
      setIsLoading(false);
    }

    loadEvent();
  }, [
    database.farmEventRepository,
    database.farmNoteTranscriptRepository,
    database.farmReferenceRepository,
    farm.id,
    params.id,
  ]);

  return (
        <FarmEventDetailScreen
      event={event}
      evidenceLinks={evidenceLinks}
      farmEventRepository={database.farmEventRepository}
      idGenerator={localIdGenerator}
      isLoading={isLoading}
      locations={locations}
      onEvidenceLinksChanged={setEvidenceLinks}
          onTranscriptChanged={setTranscript}
          organicCertificationRepository={database.organicCertificationRepository}
          planningRepository={database.planningRepository}
          transcript={transcript}
      transcriptionModelRepository={transcriptionModelRepository}
      transcriptionRepository={database.farmNoteTranscriptRepository}
      transcriptionService={transcriptionService}
    />
  );
}
