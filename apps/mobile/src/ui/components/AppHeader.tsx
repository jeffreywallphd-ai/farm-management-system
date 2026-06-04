import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ThemedIcon } from "./ThemedIcon";
import { pushRoute } from "../navigation";
import { menuItems, type MenuRoute } from "../navigationMenu";
import { theme } from "../theme/theme";

const appDisplayName = "Fazendio";

export function AppHeader() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function handleNavigate(route: MenuRoute) {
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
          <Text style={styles.title}>{appDisplayName}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={isOpen ? "Close menu" : "Open menu"}
          accessibilityRole="button"
          onPress={() => setIsOpen((current) => !current)}
          style={styles.menuButton}
        >
          <ThemedIcon color={theme.colors.onPrimary} name={isOpen ? "close" : "menu"} size={36} />
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
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    elevation: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: theme.spacing.primaryTouchTarget,
    paddingHorizontal: theme.spacing.lg,
    shadowColor: "#0A1E15",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  container: {
    backgroundColor: theme.colors.primary,
    zIndex: 10,
  },
  menu: {
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.border,
    borderBottomLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
    borderBottomWidth: 1,
    marginHorizontal: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  menuButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.spacing.touchTarget,
    minWidth: theme.spacing.touchTarget,
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
    fontSize: 34,
    fontWeight: "800",
  },
  titleButton: {
    justifyContent: "center",
    minHeight: theme.spacing.touchTarget,
    paddingRight: theme.spacing.md,
  },
});
