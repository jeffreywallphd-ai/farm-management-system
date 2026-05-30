import type { FarmEvent, FarmEventAttachment, FarmEventId } from "../../domain/events/FarmEvent";
import type { FarmId } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";

export interface FarmEventView {
  event: FarmEvent;
  place?: FarmLocation;
  attachments: FarmEventAttachment[];
}

export interface FarmEventRepository {
  saveFarmEvent(event: FarmEvent, attachments: FarmEventAttachment[]): Promise<void>;
  listFarmEvents(farmId: FarmId): Promise<FarmEventView[]>;
  getFarmEventDetail(farmId: FarmId, id: FarmEventId): Promise<FarmEventView | null>;
}

