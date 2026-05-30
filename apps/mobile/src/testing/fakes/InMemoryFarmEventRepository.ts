import type { FarmEvent, FarmEventAttachment, FarmEventId } from "../../domain/events/FarmEvent";
import type { FarmId } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { FarmEventRepository, FarmEventView } from "../../application/ports/FarmEventRepository";

export class InMemoryFarmEventRepository implements FarmEventRepository {
  private events: FarmEvent[] = [];
  private attachments: FarmEventAttachment[] = [];

  constructor(private readonly references: { locations: FarmLocation[] }) {}

  async saveFarmEvent(event: FarmEvent, attachments: FarmEventAttachment[]): Promise<void> {
    this.events.push(event);
    this.attachments.push(...attachments);
  }

  async listFarmEvents(farmId: FarmId): Promise<FarmEventView[]> {
    return this.events
      .filter((event) => event.farmId === farmId)
      .sort(
        (left, right) =>
          right.capturedAt.localeCompare(left.capturedAt) || right.createdAt.localeCompare(left.createdAt),
      )
      .map((event) => this.toView(event));
  }

  async getFarmEventDetail(farmId: FarmId, id: FarmEventId): Promise<FarmEventView | null> {
    const event = this.events.find((candidate) => candidate.farmId === farmId && candidate.id === id);
    return event ? this.toView(event) : null;
  }

  private toView(event: FarmEvent): FarmEventView {
    return {
      event,
      place: event.placeId ? this.references.locations.find((place) => place.id === event.placeId) : undefined,
      attachments: this.attachments.filter((attachment) => attachment.eventId === event.id),
    };
  }
}

