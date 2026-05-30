import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme/theme";

export function FarmNotePhotoPreview({ uri }: { uri: string }) {
  const [isUnavailable, setIsUnavailable] = useState(false);

  if (isUnavailable) {
    return (
      <View style={styles.unavailable}>
        <Text style={styles.unavailableText}>Photo unavailable on this device.</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel="Saved farm note photo"
      onError={() => setIsUnavailable(true)}
      resizeMode="cover"
      source={{ uri }}
      style={styles.photo}
    />
  );
}

const styles = StyleSheet.create({
  photo: {
    aspectRatio: 1,
    borderRadius: theme.radius.sm,
    width: 132,
  },
  unavailable: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    justifyContent: "center",
    padding: theme.spacing.sm,
    width: 132,
  },
  unavailableText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 18,
    textAlign: "center",
  },
});
