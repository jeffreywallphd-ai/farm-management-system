import "expo-dev-client";

import { Stack } from "expo-router";

import { DatabaseProvider } from "../bootstrap/providers/DatabaseProvider";

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DatabaseProvider>
  );
}
