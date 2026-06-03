import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem, TrackedItemKind } from "../../domain/farm/TrackedItem";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import { updateFarmName } from "../../application/use-cases/update-farm-name/updateFarmName";
import { Button } from "../components/Button";
import { CollapsibleCard } from "../components/CollapsibleCard";
import { FormField } from "../components/FormField";
import { FarmPlacesEditor, TrackedItemsEditor } from "../components/ReferenceEditors";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { theme } from "../theme/theme";

type ReferenceSection = {
  type: TrackedItemKind;
  title: string;
  addLabel: string;
  placeholder: string;
  items: TrackedItem[];
};

export type SetupSectionId = "farmProfile" | "farmPlaces" | "crops" | "materials";

export function FarmDashboardScreen({
  farm,
  locations,
  crops,
  materials,
  repository,
  onReferenceSaved,
  initialExpandedSection,
}: {
  farm: Farm;
  locations: FarmLocation[];
  crops: TrackedItem[];
  materials: TrackedItem[];
  repository: FarmReferenceRepository;
  onReferenceSaved: () => Promise<void>;
  initialExpandedSection?: SetupSectionId;
}) {
  const [expandedSection, setExpandedSection] = useState<SetupSectionId | undefined>(initialExpandedSection);
  const [farmName, setFarmName] = useState(farm.name);
  const [farmNameError, setFarmNameError] = useState<string | undefined>();
  const [isSavingFarmName, setIsSavingFarmName] = useState(false);
  const sections: ReferenceSection[] = [
    { type: "crop", title: "Crops", addLabel: "Add crop", placeholder: "Kale", items: crops },
    { type: "material", title: "Materials", addLabel: "Add material", placeholder: "Compost", items: materials },
  ];

  function toggle(section: SetupSectionId) {
    setExpandedSection((current) => (current === section ? undefined : section));
  }

  useEffect(() => {
    setExpandedSection(initialExpandedSection);
  }, [initialExpandedSection]);

  useEffect(() => {
    setFarmName(farm.name);
  }, [farm.name]);

  async function handleSaveFarmName() {
    setIsSavingFarmName(true);
    setFarmNameError(undefined);

    try {
      await updateFarmName({ farmId: farm.id, name: farmName }, { repository });
    } catch (caughtError) {
      setFarmNameError(caughtError instanceof Error ? caughtError.message : "Farm name could not be saved.");
    } finally {
      setIsSavingFarmName(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Farm setup"
        supportingText="Open just the setup section you want. Your quick farm-note capture now lives on Home."
        title={farmName}
      />
      <CollapsibleCard
        detail="Rename this local farm setup."
        isExpanded={expandedSection === "farmProfile"}
        onToggle={() => toggle("farmProfile")}
        title="Farm name"
      >
        <View style={styles.actionStack}>
          <FormField
            error={farmNameError}
            label="Farm name"
            onChangeText={setFarmName}
            onSubmitEditing={handleSaveFarmName}
            placeholder="Green Hill Farm"
            value={farmName}
          />
          <Button disabled={isSavingFarmName} label={isSavingFarmName ? "Saving..." : "Save farm name"} onPress={handleSaveFarmName} size="large" />
        </View>
      </CollapsibleCard>
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
  return type === "crop" ? "crops" : "materials";
}

const styles = StyleSheet.create({
  actionStack: {
    gap: theme.spacing.sm,
  },
});
