import type { ReactNode, RefObject } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "./AppHeader";
import { theme } from "../theme/theme";

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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  inner: {
    width: "100%",
    gap: theme.spacing.lg,
  },
});
