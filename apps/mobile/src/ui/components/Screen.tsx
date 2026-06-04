import type { ReactNode, RefObject } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "./AppHeader";
import { theme } from "../theme/theme";

const footerHills = require("../../../assets/images/farm-footer-hills.png");
const headerSky = require("../../../assets/images/farm-header-sky.png");
const headerToContentSpacing = Math.round(theme.spacing.xl * 0.6);

export function Screen({
  children,
  contentRef,
  scrollViewRef,
}: {
  children: ReactNode;
  contentRef?: RefObject<View | null>;
  scrollViewRef?: RefObject<ScrollView | null>;
}) {
  const insets = useSafeAreaInsets();
  const headerImageHeight = insets.top + theme.spacing.primaryTouchTarget;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardAvoidingView}
    >
      <SafeAreaView style={styles.safeArea}>
        <View pointerEvents="none" style={[styles.headerImageFrame, { height: headerImageHeight }]}>
          <Image accessible={false} resizeMode="stretch" source={headerSky} style={styles.headerImage} />
        </View>
        <AppHeader />
        <View pointerEvents="none" style={styles.footerImageFrame}>
          <Image accessible={false} resizeMode="stretch" source={footerHills} style={styles.footerImage} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
          style={styles.scrollView}
        >
          <View collapsable={false} ref={contentRef} style={styles.inner}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  footerImageFrame: {
    bottom: 0,
    height: 88,
    left: 0,
    opacity: 0.72,
    position: "absolute",
    right: 0,
  },
  footerImage: {
    height: "100%",
    width: "100%",
  },
  headerImageFrame: {
    left: 0,
    opacity: 0.88,
    position: "absolute",
    right: 0,
    top: 0,
  },
  headerImage: {
    height: "100%",
    width: "100%",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: headerToContentSpacing,
    paddingBottom: theme.spacing.xl + 42,
  },
  inner: {
    width: "100%",
    gap: theme.spacing.lg,
  },
});
