import "expo-dev-client";

import { Stack } from "expo-router";

import { DatabaseProvider } from "../bootstrap/providers/DatabaseProvider";
import { UiDensityProvider } from "../ui/theme/UiDensity";
import { theme } from "../ui/theme/theme";

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <UiDensityProvider>
        <Stack
          screenOptions={{
            animation: "none",
            contentStyle: { backgroundColor: theme.colors.background },
            headerShown: false,
          }}
        />
      </UiDensityProvider>
    </DatabaseProvider>
  );
}
