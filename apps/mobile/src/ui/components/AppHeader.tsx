import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { pushRoute } from "../navigation";
import { menuItems, type MenuRoute } from "../navigationMenu";
import { theme } from "../theme/theme";

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
          <Text style={styles.title}>Farm Notes</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={isOpen ? "Close menu" : "Open menu"}
          accessibilityRole="button"
          onPress={() => setIsOpen((current) => !current)}
          style={styles.menuButton}
        >
          {isOpen ? <CloseMenuGlyph /> : <HamburgerMenuGlyph />}
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

function HamburgerMenuGlyph() {
  return (
    <View style={styles.hamburgerIcon}>
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
    </View>
  );
}

function CloseMenuGlyph() {
  return (
    <View style={styles.closeIcon}>
      <View style={[styles.closeLine, styles.closeLineForward]} />
      <View style={[styles.closeLine, styles.closeLineBackward]} />
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
    minWidth: theme.spacing.touchTarget,
  },
  hamburgerIcon: {
    gap: 5,
    justifyContent: "center",
    width: 28,
  },
  hamburgerLine: {
    backgroundColor: theme.colors.onPrimary,
    borderRadius: 2,
    height: 3,
    width: 28,
  },
  closeIcon: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  closeLine: {
    backgroundColor: theme.colors.onPrimary,
    borderRadius: 2,
    height: 3,
    position: "absolute",
    width: 30,
  },
  closeLineForward: {
    transform: [{ rotate: "45deg" }],
  },
  closeLineBackward: {
    transform: [{ rotate: "-45deg" }],
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
