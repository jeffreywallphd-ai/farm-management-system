import { useRouter } from "expo-router";

import { pushRoute } from "../navigation";
import { Button } from "./Button";

export function OrganicDashboardButton() {
  const router = useRouter();
  return (
    <Button
      label="Back to organic dashboard"
      onPress={() => pushRoute(router, "/organic")}
      size="large"
      variant="secondary"
    />
  );
}
