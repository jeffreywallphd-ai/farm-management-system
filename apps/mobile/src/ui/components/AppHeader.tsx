import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { pushRoute } from "../navigation";
import { theme } from "../theme/theme";

const menuItems = [
  { label: "Home", route: "/home" },
  { label: "Record farm note", route: "/farm-events/new" },
  { label: "Farm notes timeline", route: "/farm-events" },
  { label: "Farm places", route: "/setup?section=farmPlaces" },
  { label: "Crops", route: "/setup?section=crops" },
  { label: "Materials", route: "/setup?section=materials" },
  { label: "Countable items", route: "/setup?section=countableItems" },
  { label: "Farm setup", route: "/setup" },
  { label: "Activity history", route: "/activity" },
  { label: "Recovery copy", route: "/data-safety/export" },
] as const;

export function AppHeader() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function handleNavigate(route: (typeof menuItems)[number]["route"]) {
    setIsOpen(false);
    pushRoute(router, route);
  }

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Pressable
          accessibilityLabel="Go to Home"
          accessibilityRole="button"
          onPress={() => handleNavigate("/home")}
          style={styles.titleButton}
        >
          <Text style={styles.title}>Farm Notes</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={isOpen ? "Close menu" : "Open menu"}
          accessibilityRole="button"
          onPress={() => setIsOpen((current) => !current)}
          style={styles.menuButton}
        >
          <Text style={styles.menuIcon}>{isOpen ? "Close" : "Menu"}</Text>
        </Pressable>
      </View>
      {isOpen ? (
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.route}
              onPress={() => handleNavigate(item.route)}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: theme.spacing.primaryTouchTarget,
    paddingHorizontal: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.primary,
    zIndex: 10,
  },
  menu: {
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    padding: theme.spacing.sm,
  },
  menuButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.spacing.touchTarget,
    minWidth: theme.spacing.primaryTouchTarget,
  },
  menuIcon: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  menuItem: {
    borderRadius: theme.radius.sm,
    minHeight: theme.spacing.primaryTouchTarget,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  menuItemText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  title: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.title,
    fontWeight: "800",
  },
  titleButton: {
    justifyContent: "center",
    minHeight: theme.spacing.touchTarget,
    paddingRight: theme.spacing.md,
  },
});
