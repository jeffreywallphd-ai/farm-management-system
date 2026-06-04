import type { FarmEventView } from "../../ports/FarmEventRepository";
import type { FarmEventRepository } from "../../ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import {
  ORGANIC_EVIDENCE_CATEGORIES,
  ORGANIC_EVIDENCE_CATEGORY_LABELS,
  type OrganicEvidenceCategory,
  type OrganicEvidenceLink,
} from "../../../domain/organic/OrganicEvidenceLink";

export interface OrganicEvidenceLinkView {
  link: OrganicEvidenceLink;
  farmEvent?: FarmEventView;
}

export interface OrganicReviewQueueItem {
  farmEvent: FarmEventView;
  links: OrganicEvidenceLink[];
  reason: "markedForReview" | "noOrganicEvidenceLink";
}

export interface OrganicEvidenceReviewGroup {
  category: OrganicEvidenceCategory;
  label: string;
  links: OrganicEvidenceLinkView[];
  missingPrompts: string[];
  staleLinkCount: number;
}

export interface OrganicEvidenceReview {
  groups: OrganicEvidenceReviewGroup[];
  totalLinks: number;
  staleLinkCount: number;
  missingCategoryCount: number;
}

export async function listOrganicEvidenceLinksForFarmNote(
  input: { farmId: string; farmEventId: string },
  dependencies: { repository: OrganicCertificationRepository },
): Promise<OrganicEvidenceLink[]> {
  return dependencies.repository.listOrganicEvidenceLinks(input.farmId, { farmEventId: input.farmEventId });
}

export async function listOrganicEvidenceLinkViews(
  input: { farmId: string; category?: OrganicEvidenceCategory },
  dependencies: { farmEventRepository: FarmEventRepository; repository: OrganicCertificationRepository },
): Promise<OrganicEvidenceLinkView[]> {
  const links = await dependencies.repository.listOrganicEvidenceLinks(input.farmId, { category: input.category });
  const events = await dependencies.farmEventRepository.listFarmEvents(input.farmId);
  const eventsById = new Map(events.map((event) => [event.event.id, event]));
  return links.map((link) => ({ link, farmEvent: eventsById.get(link.farmEventId) }));
}

export async function listOrganicEvidenceReview(
  input: { farmId: string; categories?: OrganicEvidenceCategory[] },
  dependencies: { farmEventRepository: FarmEventRepository; repository: OrganicCertificationRepository },
): Promise<OrganicEvidenceReview> {
  const categories = input.categories ?? [...ORGANIC_EVIDENCE_CATEGORIES];
  const views = await listOrganicEvidenceLinkViews({ farmId: input.farmId }, dependencies);
  const groups = categories.map((category): OrganicEvidenceReviewGroup => {
    const links = views.filter((view) => view.link.category === category);
    const staleLinkCount = links.filter((view) => !view.farmEvent).length;
    return {
      category,
      label: ORGANIC_EVIDENCE_CATEGORY_LABELS[category],
      links,
      missingPrompts: links.length === 0 ? [`No linked evidence has been added for ${ORGANIC_EVIDENCE_CATEGORY_LABELS[category]}.`] : [],
      staleLinkCount,
    };
  });

  return {
    groups,
    totalLinks: views.length,
    staleLinkCount: groups.reduce((total, group) => total + group.staleLinkCount, 0),
    missingCategoryCount: groups.filter((group) => group.missingPrompts.length > 0).length,
  };
}

export async function listOrganicReviewQueue(
  input: { farmId: string },
  dependencies: { farmEventRepository: FarmEventRepository; repository: OrganicCertificationRepository },
): Promise<OrganicReviewQueueItem[]> {
  const [events, links] = await Promise.all([
    dependencies.farmEventRepository.listFarmEvents(input.farmId),
    dependencies.repository.listOrganicEvidenceLinks(input.farmId),
  ]);
  const linksByEvent = new Map<string, OrganicEvidenceLink[]>();
  for (const link of links) {
    linksByEvent.set(link.farmEventId, [link, ...(linksByEvent.get(link.farmEventId) ?? [])]);
  }

  return events
    .map((farmEvent): OrganicReviewQueueItem | null => {
      const eventLinks = linksByEvent.get(farmEvent.event.id) ?? [];
      if (farmEvent.event.needsOrganicReview) {
        return { farmEvent, links: eventLinks, reason: "markedForReview" };
      }
      if (eventLinks.length === 0) {
        return { farmEvent, links: eventLinks, reason: "noOrganicEvidenceLink" };
      }
      return null;
    })
    .filter((item): item is OrganicReviewQueueItem => item !== null);
}
