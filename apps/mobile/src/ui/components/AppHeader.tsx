import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ThemedIcon } from "./ThemedIcon";
import { pushRoute } from "../navigation";
import { menuItems, type MenuRoute } from "../navigationMenu";
import { useUiDensity } from "../theme/UiDensity";
import { theme } from "../theme/theme";

const appDisplayName = "Fazendio";
const logoVineOverlay = require("../../../assets/images/logo-vine-overlay.png");

function HeaderMenuIcon({ isOpen }: { isOpen: boolean }) {
  if (isOpen) {
    return (
      <View style={styles.menuIconFrame}>
        <View style={[styles.menuIconLine, styles.menuIconCloseLineOne]} />
        <View style={[styles.menuIconLine, styles.menuIconCloseLineTwo]} />
      </View>
    );
  }

  return (
    <View style={styles.menuIconFrame}>
      <View style={styles.hamburgerLines}>
        <View style={styles.menuIconLine} />
        <View style={styles.menuIconLine} />
        <View style={styles.menuIconLine} />
      </View>
    </View>
  );
}

export function AppHeader() {
  const router = useRouter();
  const density = useUiDensity();
  const [isOpen, setIsOpen] = useState(false);

  function handleNavigate(route: MenuRoute) {
    setIsOpen(false);
    pushRoute(router, route);
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bar,
          {
            minHeight: density.isUngloved ? 62 : theme.spacing.primaryTouchTarget,
            paddingHorizontal: density.isUngloved ? theme.spacing.md : theme.spacing.lg,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Go to Home"
          accessibilityRole="button"
          onPress={() => handleNavigate("/home")}
          style={[styles.titleButton, { minHeight: density.isUngloved ? 44 : theme.spacing.touchTarget }]}
        >
          <View style={styles.logoLockup}>
            <Image accessible={false} resizeMode="contain" source={logoVineOverlay} style={styles.logoVine} />
            <Text style={styles.title}>{appDisplayName}</Text>
            <Text style={styles.betaBadge}>BETA</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityLabel={isOpen ? "Close menu" : "Open menu"}
          accessibilityRole="button"
          onPress={() => setIsOpen((current) => !current)}
          style={[
            styles.menuButton,
            {
              minHeight: density.isUngloved ? 44 : theme.spacing.touchTarget,
              minWidth: density.isUngloved ? 44 : theme.spacing.touchTarget,
            },
          ]}
        >
          <HeaderMenuIcon isOpen={isOpen} />
        </Pressable>
      </View>
      {isOpen ? (
        <View style={[styles.menu, { padding: density.isUngloved ? theme.spacing.xs : theme.spacing.sm }]}>
          {menuItems.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.route}
              onPress={() => handleNavigate(item.route)}
              style={[
                styles.menuItem,
                {
                  gap: density.isUngloved ? theme.spacing.sm : theme.spacing.md,
                  minHeight: density.isUngloved ? 48 : theme.spacing.primaryTouchTarget,
                  paddingHorizontal: density.isUngloved ? theme.spacing.sm : theme.spacing.md,
                },
              ]}
            >
              <ThemedIcon accentColor={theme.colors.secondary} color={theme.colors.primary} name={item.icon} size={density.isUngloved ? 20 : 24} />
              <Text style={[styles.menuItemText, density.isUngloved ? styles.compactMenuItemText : null]}>{item.label}</Text>
              <ThemedIcon color={theme.colors.primary} name="arrowRight" size={density.isUngloved ? 18 : 22} />
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
    borderBottomLeftRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
    elevation: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#0A1E15",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  container: {
    backgroundColor: "transparent",
    zIndex: 10,
  },
  hamburgerLines: {
    gap: 5,
  },
  betaBadge: {
    bottom: 3,
    color: theme.colors.primarySoft,
    fontFamily: theme.typography.logoFontFamily,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 12,
    letterSpacing: 0.6,
    position: "absolute",
    right: -33,
    zIndex: 2,
  },
  logoLockup: {
    justifyContent: "center",
    position: "relative",
  },
  logoVine: {
    bottom: 7,
    height: 42,
    left: -6,
    opacity: 0.32,
    position: "absolute",
    width: 158,
    zIndex: 0,
  },
  menu: {
    backgroundColor: theme.colors.primarySubtle,
    borderBottomColor: theme.colors.iconBorder,
    borderBottomLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
    borderBottomWidth: 1,
    marginHorizontal: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  menuButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconCloseLineOne: {
    left: 6,
    position: "absolute",
    top: 16,
    transform: [{ rotate: "45deg" }],
  },
  menuIconCloseLineTwo: {
    left: 6,
    position: "absolute",
    top: 16,
    transform: [{ rotate: "-45deg" }],
  },
  menuIconFrame: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  menuIconLine: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 999,
    height: 3,
    width: 24,
  },
  menuItem: {
    alignItems: "center",
    borderRadius: theme.radius.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  menuItemText: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  compactMenuItemText: {
    fontSize: theme.typography.small,
    fontWeight: "600",
    lineHeight: 18,
  },
  title: {
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.logoFontFamily,
    fontSize: 34,
    fontWeight: theme.typography.headingFontWeight,
    zIndex: 1,
  },
  titleButton: {
    justifyContent: "center",
    paddingRight: theme.spacing.md,
  },
});
