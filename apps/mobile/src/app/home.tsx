import { HomeScreen } from "../ui/screens/HomeScreen";
import { FarmRouteGate } from "../bootstrap/FarmRouteGate";

export default function HomeRoute() {
  return (
    <FarmRouteGate>
      {({ farm }) => <HomeScreen farmName={farm.name} />}
    </FarmRouteGate>
  );
}
