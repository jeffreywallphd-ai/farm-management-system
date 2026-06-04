export const menuItems = [
  { label: "Home", route: "/home" },
  { label: "Farm planning", route: "/planning" },
  { label: "Manage farm tasks", route: "/planning/boards" },
  { label: "Farmhands", route: "/farmhands" },
  { label: "Farm setup", route: "/setup" },
  { label: "Organic certification", route: "/organic" },
] as const;

export type MenuRoute = (typeof menuItems)[number]["route"];
