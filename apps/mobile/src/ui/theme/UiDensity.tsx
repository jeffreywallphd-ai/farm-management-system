import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { theme } from "./theme";

export type UiDensityMode = "gloved" | "ungloved";

interface UiDensityContextValue {
  buttonMinHeight: number;
  cardGap: number;
  cardPadding: number;
  contentGap: number;
  contentPaddingHorizontal: number;
  contentPaddingTop: number;
  fieldGap: number;
  inputMinHeight: number;
  inputPaddingHorizontal: number;
  inputPaddingVertical: number;
  isUngloved: boolean;
  mode: UiDensityMode;
  optionMinHeight: number;
  optionPadding: number;
  selectHintVisible: boolean;
  toggleMode: () => void;
}

const defaultDensityContext: UiDensityContextValue = {
  buttonMinHeight: 48,
  cardGap: theme.spacing.sm,
  cardPadding: theme.spacing.md,
  contentGap: theme.spacing.md,
  contentPaddingHorizontal: theme.spacing.md,
  contentPaddingTop: theme.spacing.sm,
  fieldGap: theme.spacing.xs,
  inputMinHeight: 44,
  inputPaddingHorizontal: theme.spacing.sm,
  inputPaddingVertical: theme.spacing.sm,
  isUngloved: true,
  mode: "ungloved",
  optionMinHeight: 48,
  optionPadding: theme.spacing.sm,
  selectHintVisible: false,
  toggleMode: () => undefined,
};

const UiDensityContext = createContext<UiDensityContextValue>(defaultDensityContext);

export function UiDensityProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<UiDensityMode>("ungloved");
  const isUngloved = mode === "ungloved";

  const value = useMemo<UiDensityContextValue>(
    () => ({
      buttonMinHeight: isUngloved ? 48 : theme.spacing.primaryTouchTarget,
      cardGap: isUngloved ? theme.spacing.sm : theme.spacing.md,
      cardPadding: isUngloved ? theme.spacing.md : theme.spacing.lg,
      contentGap: isUngloved ? theme.spacing.md : theme.spacing.lg,
      contentPaddingHorizontal: isUngloved ? theme.spacing.md : theme.spacing.lg,
      contentPaddingTop: isUngloved ? theme.spacing.sm : Math.round(theme.spacing.xl * 0.6),
      fieldGap: isUngloved ? theme.spacing.xs : theme.spacing.sm,
      inputMinHeight: isUngloved ? 44 : theme.spacing.touchTarget,
      inputPaddingHorizontal: isUngloved ? theme.spacing.sm : theme.spacing.md,
      inputPaddingVertical: isUngloved ? theme.spacing.sm : theme.spacing.md,
      isUngloved,
      mode,
      optionMinHeight: isUngloved ? 48 : theme.spacing.primaryTouchTarget,
      optionPadding: isUngloved ? theme.spacing.sm : theme.spacing.md,
      selectHintVisible: !isUngloved,
      toggleMode: () => setMode((current) => (current === "gloved" ? "ungloved" : "gloved")),
    }),
    [isUngloved, mode],
  );

  return <UiDensityContext.Provider value={value}>{children}</UiDensityContext.Provider>;
}

export function useUiDensity() {
  return useContext(UiDensityContext);
}
