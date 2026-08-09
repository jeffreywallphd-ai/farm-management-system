import type { ThemedIconName } from "./components/ThemedIcon";

export const menuItems = [
  { icon: "home", label: "Home", route: "/home" },
  { icon: "task", label: "Farm planning", route: "/planning" },
  { icon: "board", label: "Manage farm tasks", route: "/planning/boards" },
  { icon: "material", label: "Inventory management", route: "/inventory" },
  { icon: "farmhand", label: "Farmhands", route: "/farmhands" },
  { icon: "setup", label: "Farm setup", route: "/setup" },
  { icon: "organic", label: "Organic certification", route: "/organic" },
] as const satisfies readonly { icon: ThemedIconName; label: string; route: string }[];

export type MenuRoute = (typeof menuItems)[number]["route"];
