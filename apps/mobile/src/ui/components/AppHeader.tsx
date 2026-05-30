import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { pushRoute } from "../navigation";
import { theme } from "../theme/theme";

const menuItems = [
  { label: "Record farm note", route: "/farm-events/new" },
  { label: "Farm notes timeline", route: "/farm-events" },
  { label: "Farm setup", route: "/" },
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
        <Text style={styles.title}>Farm Notes</Text>
        <Pressable
          accessibilityLabel={isOpen ? "Close menu" : "Open menu"}
          accessibilityRole="button"
          onPress={() => setIsOpen((current) => !current)}
          style={styles.menuButton}
        >
          <Text style={styles.menuIcon}>{isOpen ? "×" : "☰"}</Text>
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
    minHeight: 56,
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
    minHeight: 48,
    minWidth: 48,
  },
  menuIcon: {
    color: theme.colors.onPrimary,
    fontSize: 28,
    fontWeight: "700",
  },
  menuItem: {
    borderRadius: theme.radius.sm,
    minHeight: 48,
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
});
