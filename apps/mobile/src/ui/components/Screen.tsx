import type { ReactNode, RefObject } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "./AppHeader";
import { theme } from "../theme/theme";

const footerHills = require("../../../assets/images/farm-footer-hills.png");

export function Screen({
  children,
  contentRef,
  scrollViewRef,
}: {
  children: ReactNode;
  contentRef?: RefObject<View | null>;
  scrollViewRef?: RefObject<ScrollView | null>;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardAvoidingView}
    >
      <SafeAreaView style={styles.safeArea}>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl + 42,
  },
  inner: {
    width: "100%",
    gap: theme.spacing.lg,
  },
});
