import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { theme } from "../theme/theme";

export type ThemedIconName =
  | "arrowRight"
  | "calendar"
  | "clock"
  | "clipboard"
  | "close"
  | "grid"
  | "leaf"
  | "menu"
  | "microphone"
  | "place";

export function ThemedIcon({
  accentColor,
  color = theme.colors.primary,
  name,
  size = 28,
}: {
  accentColor?: string;
  color?: string;
  name: ThemedIconName;
  size?: number;
}) {
  const scale = size / 28;
  const accent = accentColor ?? color;

  if (name === "microphone") {
    return (
      <IconFrame size={size}>
        <View
          style={[
            styles.micCapsule,
            {
              borderColor: color,
              borderRadius: 8 * scale,
              borderWidth: Math.max(1.8, 2 * scale),
              height: 17 * scale,
              left: 9 * scale,
              top: 2 * scale,
              width: 10 * scale,
            },
          ]}
        />
        <View style={[styles.line, { backgroundColor: accent, height: 9 * scale, left: 13 * scale, top: 18 * scale, width: 2.5 * scale }]} />
        <View style={[styles.line, { backgroundColor: accent, height: 2.5 * scale, left: 8 * scale, top: 25 * scale, width: 12 * scale }]} />
        <View
          style={[
            styles.micArc,
            {
              borderBottomColor: color,
              borderLeftColor: color,
              borderRightColor: color,
              borderWidth: Math.max(1.8, 2 * scale),
              borderTopColor: "transparent",
              borderRadius: 10 * scale,
              height: 14 * scale,
              left: 5 * scale,
              top: 10 * scale,
              width: 18 * scale,
            },
          ]}
        />
      </IconFrame>
    );
  }

  if (name === "clipboard") {
    return (
      <IconFrame size={size}>
        <View
          style={[
            styles.roundedBox,
            {
              borderColor: color,
              borderRadius: 4 * scale,
              borderWidth: Math.max(1.8, 2 * scale),
              height: 22 * scale,
              left: 5 * scale,
              top: 4 * scale,
              width: 18 * scale,
            },
          ]}
        />
        <View
          style={[
            styles.roundedBox,
            {
              backgroundColor: theme.colors.primarySubtle,
              borderColor: color,
              borderRadius: 4 * scale,
              borderWidth: Math.max(1.5, 1.8 * scale),
              height: 7 * scale,
              left: 9 * scale,
              top: 1 * scale,
              width: 10 * scale,
            },
          ]}
        />
        <View style={[styles.line, { backgroundColor: accent, height: 2 * scale, left: 10 * scale, top: 12 * scale, width: 9 * scale }]} />
        <View style={[styles.line, { backgroundColor: accent, height: 2 * scale, left: 10 * scale, top: 17 * scale, width: 9 * scale }]} />
        <View style={[styles.checkLine, { backgroundColor: color, height: 2 * scale, left: 7 * scale, top: 12 * scale, width: 4 * scale, transform: [{ rotate: "45deg" }] }]} />
        <View style={[styles.checkLine, { backgroundColor: color, height: 2 * scale, left: 9 * scale, top: 11 * scale, width: 6 * scale, transform: [{ rotate: "-45deg" }] }]} />
      </IconFrame>
    );
  }

  if (name === "grid") {
    return (
      <IconFrame size={size}>
        {[0, 1, 2, 3].map((item) => (
          <View
            key={item}
            style={[
              styles.roundedBox,
              {
                borderColor: color,
                borderRadius: 3 * scale,
                borderWidth: Math.max(1.8, 2 * scale),
                height: 8 * scale,
                left: (5 + (item % 2) * 10) * scale,
                top: (5 + Math.floor(item / 2) * 10) * scale,
                width: 8 * scale,
              },
            ]}
          />
        ))}
      </IconFrame>
    );
  }

  if (name === "calendar") {
    return (
      <IconFrame size={size}>
        <View
          style={[
            styles.roundedBox,
            {
              borderColor: color,
              borderRadius: 4 * scale,
              borderWidth: Math.max(1.8, 2 * scale),
              height: 21 * scale,
              left: 4 * scale,
              top: 5 * scale,
              width: 20 * scale,
            },
          ]}
        />
        <View style={[styles.line, { backgroundColor: color, height: 2 * scale, left: 4 * scale, top: 11 * scale, width: 20 * scale }]} />
        <View style={[styles.line, { backgroundColor: accent, height: 5 * scale, left: 8 * scale, top: 2 * scale, width: 2 * scale }]} />
        <View style={[styles.line, { backgroundColor: accent, height: 5 * scale, left: 18 * scale, top: 2 * scale, width: 2 * scale }]} />
        {[0, 1, 2, 3].map((item) => (
          <View
            key={item}
            style={[
              styles.dot,
              {
                backgroundColor: accent,
                height: 2.8 * scale,
                left: (8 + (item % 2) * 7) * scale,
                top: (15 + Math.floor(item / 2) * 5) * scale,
                width: 2.8 * scale,
              },
            ]}
          />
        ))}
      </IconFrame>
    );
  }

  if (name === "clock") {
    return (
      <IconFrame size={size}>
        <View
          style={[
            styles.roundedBox,
            {
              borderColor: color,
              borderRadius: 11 * scale,
              borderWidth: Math.max(1.8, 2 * scale),
              height: 22 * scale,
              left: 3 * scale,
              top: 3 * scale,
              width: 22 * scale,
            },
          ]}
        />
        <View style={[styles.line, { backgroundColor: accent, height: 8 * scale, left: 13 * scale, top: 7 * scale, width: 2 * scale }]} />
        <View style={[styles.line, { backgroundColor: accent, height: 2 * scale, left: 13 * scale, top: 14 * scale, width: 7 * scale }]} />
      </IconFrame>
    );
  }

  if (name === "leaf") {
    return (
      <IconFrame size={size}>
        <View style={[styles.line, { backgroundColor: color, height: 21 * scale, left: 13 * scale, top: 5 * scale, width: 2.4 * scale, transform: [{ rotate: "18deg" }] }]} />
        <View
          style={[
            styles.leafShape,
            {
              backgroundColor: theme.colors.primarySubtle,
              borderColor: color,
              borderBottomLeftRadius: 12 * scale,
              borderTopRightRadius: 12 * scale,
              borderWidth: Math.max(1.6, 1.8 * scale),
              height: 12 * scale,
              left: 5 * scale,
              top: 8 * scale,
              width: 17 * scale,
              transform: [{ rotate: "-22deg" }],
            },
          ]}
        />
        <View
          style={[
            styles.leafShape,
            {
              backgroundColor: theme.colors.primarySoft,
              borderColor: accent,
              borderBottomLeftRadius: 11 * scale,
              borderTopRightRadius: 11 * scale,
              borderWidth: Math.max(1.4, 1.6 * scale),
              height: 10 * scale,
              left: 13 * scale,
              top: 3 * scale,
              width: 14 * scale,
              transform: [{ rotate: "35deg" }],
            },
          ]}
        />
      </IconFrame>
    );
  }

  if (name === "place") {
    return (
      <IconFrame size={size}>
        <View
          style={[
            styles.pin,
            {
              borderColor: color,
              borderRadius: 10 * scale,
              borderWidth: Math.max(1.8, 2 * scale),
              height: 20 * scale,
              left: 6 * scale,
              top: 2 * scale,
              width: 16 * scale,
              transform: [{ rotate: "45deg" }],
            },
          ]}
        />
        <View style={[styles.dot, { backgroundColor: accent, height: 5 * scale, left: 11.5 * scale, top: 8 * scale, width: 5 * scale }]} />
      </IconFrame>
    );
  }

  if (name === "arrowRight") {
    return (
      <IconFrame size={size}>
        <View style={[styles.line, { backgroundColor: color, height: 2.4 * scale, left: 7 * scale, top: 13 * scale, width: 14 * scale }]} />
        <View style={[styles.line, { backgroundColor: color, height: 2.4 * scale, left: 16 * scale, top: 9 * scale, width: 8 * scale, transform: [{ rotate: "45deg" }] }]} />
        <View style={[styles.line, { backgroundColor: color, height: 2.4 * scale, left: 16 * scale, top: 17 * scale, width: 8 * scale, transform: [{ rotate: "-45deg" }] }]} />
      </IconFrame>
    );
  }

  if (name === "menu") {
    return (
      <IconFrame size={size}>
        {[0, 1, 2].map((item) => (
          <View
            key={item}
            style={[styles.line, { backgroundColor: color, height: 2.6 * scale, left: 4 * scale, top: (7 + item * 7) * scale, width: 20 * scale }]}
          />
        ))}
      </IconFrame>
    );
  }

  return (
    <IconFrame size={size}>
      <View style={[styles.line, { backgroundColor: color, height: 2.6 * scale, left: 5 * scale, top: 13 * scale, width: 19 * scale, transform: [{ rotate: "45deg" }] }]} />
      <View style={[styles.line, { backgroundColor: color, height: 2.6 * scale, left: 5 * scale, top: 13 * scale, width: 19 * scale, transform: [{ rotate: "-45deg" }] }]} />
    </IconFrame>
  );
}

function IconFrame({ children, size }: { children: ReactNode; size: number }) {
  return <View style={{ height: size, position: "relative", width: size }}>{children}</View>;
}

const styles = StyleSheet.create({
  checkLine: {
    borderRadius: 999,
    position: "absolute",
  },
  dot: {
    borderRadius: 999,
    position: "absolute",
  },
  leafShape: {
    position: "absolute",
  },
  line: {
    borderRadius: 999,
    position: "absolute",
  },
  micArc: {
    position: "absolute",
  },
  micCapsule: {
    position: "absolute",
  },
  pin: {
    position: "absolute",
  },
  roundedBox: {
    position: "absolute",
  },
});
