import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem, TrackedItemKind } from "../../domain/farm/TrackedItem";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import { Button } from "../components/Button";
import { CollapsibleCard } from "../components/CollapsibleCard";
import { FarmPlacesEditor, TrackedItemsEditor } from "../components/ReferenceEditors";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { theme } from "../theme/theme";
import { pushRoute } from "../navigation";
import { hasGrowingPlace } from "../farmPlaceDisplay";

type ReferenceSection = {
  type: TrackedItemKind;
  title: string;
  addLabel: string;
  placeholder: string;
  items: TrackedItem[];
};

export type SetupSectionId = "farmPlaces" | "farmWork" | "crops" | "materials" | "countableItems";

export function FarmDashboardScreen({
  farm,
  locations,
  crops,
  materials,
  countableItems,
  repository,
  onReferenceSaved,
  initialExpandedSection,
}: {
  farm: Farm;
  locations: FarmLocation[];
  crops: TrackedItem[];
  materials: TrackedItem[];
  countableItems: TrackedItem[];
  repository: FarmReferenceRepository;
  onReferenceSaved: () => Promise<void>;
  initialExpandedSection?: SetupSectionId;
}) {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<SetupSectionId | undefined>(initialExpandedSection);
  const hasOperationalSetup = hasGrowingPlace(locations) && crops.length > 0 && materials.length > 0 && countableItems.length > 0;
  const sections: ReferenceSection[] = [
    { type: "crop", title: "Crops", addLabel: "Add crop", placeholder: "Kale", items: crops },
    { type: "material", title: "Materials", addLabel: "Add material", placeholder: "Compost", items: materials },
    {
      type: "countableItem",
      title: "Countable items",
      addLabel: "Add countable item",
      placeholder: "Seedling trays",
      items: countableItems,
    },
  ];

  function toggle(section: SetupSectionId) {
    setExpandedSection((current) => (current === section ? undefined : section));
  }

  useEffect(() => {
    setExpandedSection(initialExpandedSection);
  }, [initialExpandedSection]);

  return (
    <Screen>
      <PageHeader
        eyebrow="Farm setup"
        supportingText="Open just the setup section you want. Your quick farm-note capture now lives on Home."
        title={farm.name}
      />
      <CollapsibleCard
        detail={`${locations.length} saved place${locations.length === 1 ? "" : "s"}`}
        isExpanded={expandedSection === "farmPlaces"}
        onToggle={() => toggle("farmPlaces")}
        title="Farm places"
      >
        <FarmPlacesEditor
          farmId={farm.id}
          locations={locations}
          onReferenceSaved={onReferenceSaved}
          repository={repository}
        />
      </CollapsibleCard>
      <CollapsibleCard
        detail={hasOperationalSetup ? "Manual work records are ready." : "Add at least one growing place plus basic crops and items."}
        isExpanded={expandedSection === "farmWork"}
        onToggle={() => toggle("farmWork")}
        title="Farm work"
      >
        <View style={styles.actionStack}>
          <Text style={styles.helperText}>
            These structured records are available when you need them, but quick voice/photo farm notes are the main pilot loop.
          </Text>
          <Button label="Record harvest" onPress={() => pushRoute(router, "/harvest/new")} size="large" variant="secondary" />
          <Button label="Record material use" onPress={() => pushRoute(router, "/material-use/new")} size="large" variant="secondary" />
          <Button label="Record inventory count" onPress={() => pushRoute(router, "/inventory-count/new")} size="large" variant="secondary" />
          <Button label="View activity history" onPress={() => pushRoute(router, "/activity")} size="large" variant="secondary" />
          <Button label="Create recovery copy" onPress={() => pushRoute(router, "/data-safety/export")} size="large" variant="secondary" />
        </View>
      </CollapsibleCard>
      {sections.map((section) => (
        <CollapsibleCard
          detail={`${section.items.length} saved`}
          isExpanded={expandedSection === sectionIdForType(section.type)}
          key={section.type}
          onToggle={() => toggle(sectionIdForType(section.type))}
          title={section.title}
        >
          <TrackedItemsEditor
            addLabel={section.addLabel}
            farmId={farm.id}
            items={section.items}
            kind={section.type}
            onReferenceSaved={onReferenceSaved}
            placeholder={section.placeholder}
            repository={repository}
            title={section.title}
          />
        </CollapsibleCard>
      ))}
    </Screen>
  );
}

function sectionIdForType(type: TrackedItemKind): SetupSectionId {
  if (type === "countableItem") {
    return "countableItems";
  }

  return type === "crop" ? "crops" : "materials";
}

const styles = StyleSheet.create({
  actionStack: {
    gap: theme.spacing.sm,
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
});
