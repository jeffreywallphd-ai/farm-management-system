import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";

import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem, TrackedItemKind } from "../../domain/farm/TrackedItem";
import { addLocation } from "../../application/use-cases/add-location/addLocation";
import { addTrackedItem } from "../../application/use-cases/add-tracked-item/addTrackedItem";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FormField } from "../components/FormField";
import { ListRow } from "../components/ListRow";
import { LocalDataNotice } from "../components/LocalDataNotice";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";
import { pushRoute } from "../navigation";

type ReferenceSection =
  | { type: "location"; title: string; addLabel: string; placeholder: string; items: FarmLocation[] }
  | {
      type: TrackedItemKind;
      title: string;
      addLabel: string;
      placeholder: string;
      items: TrackedItem[];
    };

export function FarmDashboardScreen({
  farm,
  locations,
  crops,
  materials,
  countableItems,
  repository,
  onReferenceSaved,
}: {
  farm: Farm;
  locations: FarmLocation[];
  crops: TrackedItem[];
  materials: TrackedItem[];
  countableItems: TrackedItem[];
  repository: FarmReferenceRepository;
  onReferenceSaved: () => Promise<void>;
}) {
  const router = useRouter();
  const sections: ReferenceSection[] = [
    {
      type: "location",
      title: "Locations",
      addLabel: "Add location",
      placeholder: "North Field",
      items: locations,
    },
    { type: "crop", title: "Crops", addLabel: "Add crop", placeholder: "Kale", items: crops },
    {
      type: "material",
      title: "Materials",
      addLabel: "Add material",
      placeholder: "Compost",
      items: materials,
    },
    {
      type: "countableItem",
      title: "Countable items",
      addLabel: "Add countable item",
      placeholder: "Seedling trays",
      items: countableItems,
    },
  ];

  return (
    <Screen>
      <PageHeader
        eyebrow="Mobile Pilot 1"
        supportingText="Add the places and items you will need for later field records."
        title={farm.name}
      />
      <LocalDataNotice />
      <Card>
        <SectionHeading detail="Record field work and review what is saved locally." title="Farm work" />
        <View style={styles.actionStack}>
          <Button label="Record harvest" onPress={() => pushRoute(router, "/harvest/new")} />
          <Button label="Record material use" onPress={() => pushRoute(router, "/material-use/new")} variant="secondary" />
          <Button label="Record inventory count" onPress={() => pushRoute(router, "/inventory-count/new")} variant="secondary" />
          <Button label="View activity history" onPress={() => pushRoute(router, "/activity")} variant="secondary" />
          <Button label="Create recovery copy" onPress={() => pushRoute(router, "/data-safety/export")} variant="secondary" />
        </View>
      </Card>
      <Card>
        <SectionHeading
          detail="Setup stays on this device and supports local harvest records."
          title="Local setup"
        />
        <Text style={styles.progress}>
          {locations.length + crops.length + materials.length + countableItems.length} saved setup items
        </Text>
      </Card>
      {sections.map((section) => (
        <ReferenceCard
          farmId={farm.id}
          key={section.type}
          onReferenceSaved={onReferenceSaved}
          repository={repository}
          section={section}
        />
      ))}
    </Screen>
  );
}

function ReferenceCard({
  farmId,
  section,
  repository,
  onReferenceSaved,
}: {
  farmId: string;
  section: ReferenceSection;
  repository: FarmReferenceRepository;
  onReferenceSaved: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd() {
    setIsSaving(true);
    setError(undefined);

    try {
      if (section.type === "location") {
        await addLocation(
          { farmId, name },
          { clock: systemClock, idGenerator: localIdGenerator, repository },
        );
      } else {
        await addTrackedItem(
          { farmId, kind: section.type, name },
          { clock: systemClock, idGenerator: localIdGenerator, repository },
        );
      }

      setName("");
      await onReferenceSaved();
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : "This item could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <SectionHeading title={section.title} />
      <View style={styles.list}>
        {section.items.length === 0 ? (
          <EmptyState text={`No ${section.title.toLowerCase()} yet.`} />
        ) : (
          section.items.map((item) => <ListRow key={item.id} title={item.name} />)
        )}
      </View>
      <FormField
        error={error}
        label="Name"
        onChangeText={setName}
        onSubmitEditing={handleAdd}
        placeholder={section.placeholder}
        value={name}
      />
      <Button disabled={isSaving} label={isSaving ? "Saving..." : section.addLabel} onPress={handleAdd} variant="secondary" />
    </Card>
  );
}

const styles = StyleSheet.create({
  progress: {
    color: theme.colors.success,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  list: {
    gap: theme.spacing.sm,
  },
  actionStack: {
    gap: theme.spacing.sm,
  },
});
