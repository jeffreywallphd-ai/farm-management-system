import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { theme } from "../theme/theme";

export type ThemedIconName =
  | "archive"
  | "arrowLeft"
  | "arrowRight"
  | "board"
  | "bug"
  | "calendar"
  | "camera"
  | "check"
  | "clipboard"
  | "clock"
  | "close"
  | "download"
  | "edit"
  | "farmhand"
  | "grid"
  | "gps"
  | "harvest"
  | "history"
  | "home"
  | "leaf"
  | "map"
  | "material"
  | "menu"
  | "microphone"
  | "minus"
  | "organic"
  | "package"
  | "pause"
  | "phone"
  | "place"
  | "play"
  | "plus"
  | "report"
  | "save"
  | "search"
  | "seed"
  | "setup"
  | "soil"
  | "sprout"
  | "stop"
  | "task";

export function getThemedIconForText(text: string, fallback: ThemedIconName = "leaf"): ThemedIconName {
  const normalized = text.toLowerCase();

  if (normalized === "yes" || normalized.includes(" yes") || normalized.includes("complete") || normalized.includes("done")) return "check";
  if (normalized === "no" || normalized.includes(" no") || normalized.includes("not recorded")) return "minus";
  if (normalized.includes("cancel") || normalized.includes("close") || normalized.includes("remove")) return "close";
  if (normalized.includes("archive")) return "archive";
  if (normalized.includes("back")) return "arrowLeft";
  if (normalized.includes("call") || normalized.includes("phone")) return "phone";
  if (normalized.includes("camera") || normalized.includes("photo")) return "camera";
  if (normalized.includes("choose")) return "plus";
  if (normalized.includes("count")) return "harvest";
  if (normalized.includes("create recovery") || normalized.includes("export") || normalized.includes("recovery copy")) return "download";
  if (normalized.includes("edit") || normalized.includes("adjust")) return "edit";
  if (normalized.includes("farm work board") || normalized.includes("board") || normalized.includes("manage task")) return "board";
  if (normalized.includes("farmhand") || normalized.includes("assigned")) return "farmhand";
  if (normalized.includes("find") || normalized.includes("search")) return "search";
  if (normalized.includes("geometry") || normalized.includes("map") || normalized.includes("boundary")) return "map";
  if (normalized.includes("gps") || normalized.includes("coordinate") || normalized.includes("location")) return "gps";
  if (normalized.includes("harvest")) return "harvest";
  if (normalized.includes("history") || normalized.includes("timeline")) return "history";
  if (normalized.includes("in progress") || normalized.includes("active")) return "clock";
  if (normalized.includes("input") || normalized.includes("material") || normalized.includes("compost") || normalized.includes("manure")) return "material";
  if (normalized.includes("organic") || normalized.includes("certification") || normalized.includes("osp")) return "organic";
  if (normalized.includes("package")) return "package";
  if (normalized.includes("pause")) return "pause";
  if (normalized.includes("pest") || normalized.includes("weed") || normalized.includes("disease") || normalized.includes("mulch")) return "bug";
  if (normalized.includes("place") || normalized.includes("farm setup")) return "place";
  if (normalized.includes("plan") || normalized.includes("goal") || normalized.includes("task")) return "task";
  if (normalized.includes("play")) return "play";
  if (normalized.includes("profile") || normalized.includes("setup") || normalized.includes("enable")) return "setup";
  if (normalized.includes("record") || normalized.includes("memo") || normalized.includes("audio") || normalized.includes("instruction")) return "microphone";
  if (normalized.includes("report") || normalized.includes("inspection") || normalized.includes("renewal")) return "report";
  if (normalized.includes("sale") || normalized.includes("storage") || normalized.includes("traceability") || normalized.includes("lot")) return "package";
  if (normalized.includes("save")) return "save";
  if (normalized.includes("schedule") || normalized.includes("time")) return "calendar";
  if (normalized.includes("direct seed") || normalized.includes("seed") || normalized.includes("planting")) return "seed";
  if (normalized.includes("soil") || normalized.includes("rotation") || normalized.includes("erosion")) return "soil";
  if (normalized.includes("start")) return "play";
  if (normalized.includes("stop")) return "stop";
  if (normalized.includes("transplant")) return "sprout";
  if (normalized.includes("unit") || normalized.includes("lb") || normalized.includes("oz") || normalized.includes("kg") || normalized.includes("gal")) return "material";
  if (normalized.includes("use current")) return "gps";

  return fallback;
}

export function shouldShowTrailingArrow(text: string): boolean {
  const normalized = text.toLowerCase();
  return normalized.startsWith("open ") || normalized.startsWith("back ") || normalized.includes("report") || normalized.includes("preview");
}

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
  const accent = accentColor ?? theme.colors.secondary;

  return (
    <IconFrame size={size}>
      <IconShape accent={accent} color={color} name={name} scale={scale} />
      {shouldAddFarmAccent(name) ? <FarmAccentLeaf accent={accent} scale={scale} /> : null}
    </IconFrame>
  );
}

function IconShape({
  accent,
  color,
  name,
  scale,
}: {
  accent: string;
  color: string;
  name: ThemedIconName;
  scale: number;
}) {
  if (name === "arrowLeft" || name === "arrowRight") {
    return <Chevron color={color} direction={name === "arrowRight" ? "right" : "left"} scale={scale} />;
  }

  if (name === "menu") {
    return (
      <>
        {[0, 1, 2].map((item) => (
          <Line color={color} height={2.6} key={item} left={4} scale={scale} top={7 + item * 7} width={20} />
        ))}
      </>
    );
  }

  if (name === "close") {
    return (
      <>
        <Line color={color} height={2.6} left={5} rotate="45deg" scale={scale} top={13} width={19} />
        <Line color={color} height={2.6} left={5} rotate="-45deg" scale={scale} top={13} width={19} />
      </>
    );
  }

  if (name === "plus" || name === "minus") {
    return (
      <>
        <Line color={color} height={2.6} left={6} scale={scale} top={13} width={16} />
        {name === "plus" ? <Line color={color} height={16} left={13} scale={scale} top={6} width={2.6} /> : null}
      </>
    );
  }

  if (name === "check") {
    return (
      <>
        <Line color={color} height={3} left={6} rotate="45deg" scale={scale} top={14} width={8} />
        <Line color={color} height={3} left={12} rotate="-45deg" scale={scale} top={12} width={13} />
      </>
    );
  }

  if (name === "microphone") {
    return (
      <>
        <Box borderColor={color} height={17} left={9} radius={8} scale={scale} top={2} width={10} />
        <Line color={accent} height={9} left={13} scale={scale} top={18} width={2.5} />
        <Line color={accent} height={2.5} left={8} scale={scale} top={25} width={12} />
        <View
          style={[
            styles.arc,
            {
              borderBottomColor: color,
              borderLeftColor: color,
              borderRadius: 10 * scale,
              borderRightColor: color,
              borderTopColor: "transparent",
              borderWidth: Math.max(1.8, 2 * scale),
              height: 14 * scale,
              left: 5 * scale,
              top: 10 * scale,
              width: 18 * scale,
            },
          ]}
        />
      </>
    );
  }

  if (name === "camera") {
    return (
      <>
        <Box borderColor={color} height={17} left={3} radius={5} scale={scale} top={8} width={22} />
        <Box backgroundColor={theme.colors.primarySubtle} borderColor={color} height={5} left={8} radius={3} scale={scale} top={5} width={8} />
        <Box borderColor={accent} height={8} left={10} radius={4} scale={scale} top={12} width={8} />
      </>
    );
  }

  if (name === "play" || name === "pause" || name === "stop") {
    if (name === "play") {
      return <Triangle color={color} scale={scale} />;
    }
    if (name === "pause") {
      return (
        <>
          <Line color={color} height={18} left={8} scale={scale} top={5} width={4} />
          <Line color={color} height={18} left={16} scale={scale} top={5} width={4} />
        </>
      );
    }
    return <Box backgroundColor={color} borderColor={color} height={15} left={7} radius={3} scale={scale} top={7} width={15} />;
  }

  if (name === "calendar" || name === "clock") {
    if (name === "clock") {
      return (
        <>
          <Box borderColor={color} height={22} left={3} radius={11} scale={scale} top={3} width={22} />
          <Line color={accent} height={8} left={13} scale={scale} top={7} width={2} />
          <Line color={accent} height={2} left={13} scale={scale} top={14} width={7} />
        </>
      );
    }
    return (
      <>
        <Box borderColor={color} height={21} left={4} radius={4} scale={scale} top={5} width={20} />
        <Line color={color} height={2} left={4} scale={scale} top={11} width={20} />
        <Line color={accent} height={5} left={8} scale={scale} top={2} width={2} />
        <Line color={accent} height={5} left={18} scale={scale} top={2} width={2} />
        {[0, 1, 2, 3].map((item) => (
          <Dot color={accent} key={item} left={8 + (item % 2) * 7} scale={scale} size={2.8} top={15 + Math.floor(item / 2) * 5} />
        ))}
      </>
    );
  }

  if (name === "clipboard" || name === "task" || name === "board" || name === "grid") {
    if (name === "board" || name === "grid") {
      return (
        <>
          <Box borderColor={color} height={20} left={4} radius={4} scale={scale} top={5} width={20} />
          <Line color={color} height={20} left={14} scale={scale} top={5} width={2} />
          <Line color={color} height={2} left={4} scale={scale} top={15} width={20} />
          <Line color={accent} height={2} left={7} rotate="-18deg" scale={scale} top={11} width={6} />
          <Line color={accent} height={2} left={17} rotate="-18deg" scale={scale} top={21} width={5} />
        </>
      );
    }
    return (
      <>
        <Box borderColor={color} height={22} left={5} radius={4} scale={scale} top={4} width={18} />
        <Box backgroundColor={theme.colors.primarySubtle} borderColor={color} height={7} left={9} radius={4} scale={scale} top={1} width={10} />
        <Line color={accent} height={2} left={10} scale={scale} top={12} width={9} />
        <Line color={accent} height={2} left={10} scale={scale} top={17} width={9} />
        {name === "task" ? <Line color={accent} height={2} left={10} scale={scale} top={22} width={6} /> : null}
        <Line color={color} height={2} left={7} rotate="45deg" scale={scale} top={12} width={4} />
        <Line color={color} height={2} left={9} rotate="-45deg" scale={scale} top={11} width={6} />
      </>
    );
  }

  if (name === "save") {
    return (
      <>
        <Box borderColor={color} height={21} left={4} radius={4} scale={scale} top={4} width={20} />
        <Box backgroundColor={theme.colors.primarySubtle} borderColor={accent} height={7} left={8} radius={2} scale={scale} top={4} width={11} />
        <Box borderColor={color} height={7} left={9} radius={2} scale={scale} top={17} width={10} />
      </>
    );
  }

  if (name === "edit") {
    return (
      <>
        <Line color={color} height={4} left={7} rotate="-38deg" scale={scale} top={13} width={17} />
        <Line color={accent} height={3} left={5} rotate="-38deg" scale={scale} top={18} width={7} />
        <Line color={color} height={2} left={4} scale={scale} top={24} width={18} />
      </>
    );
  }

  if (name === "download") {
    return (
      <>
        <Line color={color} height={14} left={13} scale={scale} top={4} width={2.6} />
        <Line color={color} height={2.6} left={8} rotate="45deg" scale={scale} top={15} width={8} />
        <Line color={color} height={2.6} left={13} rotate="-45deg" scale={scale} top={15} width={8} />
        <Line color={accent} height={2.6} left={5} scale={scale} top={24} width={18} />
      </>
    );
  }

  if (name === "phone") {
    return (
      <>
        <Line color={color} height={5} left={6} rotate="35deg" scale={scale} top={6} width={8} />
        <Line color={color} height={5} left={15} rotate="35deg" scale={scale} top={18} width={8} />
        <Line color={color} height={4} left={8} rotate="52deg" scale={scale} top={13} width={15} />
      </>
    );
  }

  if (name === "map" || name === "gps" || name === "place") {
    if (name === "gps") {
      return (
        <>
          <Box borderColor={color} height={20} left={4} radius={10} scale={scale} top={4} width={20} />
          <Box borderColor={accent} height={9} left={9.5} radius={5} scale={scale} top={9.5} width={9} />
          <Line color={color} height={2} left={1} scale={scale} top={13} width={6} />
          <Line color={color} height={2} left={21} scale={scale} top={13} width={6} />
        </>
      );
    }
    if (name === "map") {
      return (
        <>
          <Box borderColor={color} height={18} left={3} radius={3} scale={scale} top={6} width={22} />
          <Line color={accent} height={18} left={10} scale={scale} top={6} width={2} />
          <Line color={accent} height={18} left={17} scale={scale} top={6} width={2} />
          <Line color={color} height={2} left={5} rotate="-22deg" scale={scale} top={15} width={18} />
        </>
      );
    }
    return (
      <>
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
              transform: [{ rotate: "45deg" }],
              width: 16 * scale,
            },
          ]}
        />
        <Dot color={accent} left={11.5} scale={scale} size={5} top={8} />
      </>
    );
  }

  if (name === "home") {
    return (
      <>
        <Line color={color} height={3} left={5} rotate="-35deg" scale={scale} top={11} width={12} />
        <Line color={color} height={3} left={13} rotate="35deg" scale={scale} top={11} width={12} />
        <Box borderColor={color} height={12} left={7} radius={2} scale={scale} top={14} width={14} />
        <Line color={accent} height={8} left={14} scale={scale} top={18} width={2} />
      </>
    );
  }

  if (name === "report" || name === "organic") {
    return (
      <>
        <Box borderColor={color} height={22} left={6} radius={3} scale={scale} top={3} width={16} />
        <Line color={accent} height={2} left={10} scale={scale} top={10} width={8} />
        <Line color={accent} height={2} left={10} scale={scale} top={15} width={8} />
        {name === "organic" ? <Dot color={accent} left={11} scale={scale} size={7} top={18} /> : null}
      </>
    );
  }

  if (name === "farmhand") {
    return (
      <>
        <Box borderColor={color} height={8} left={10} radius={4} scale={scale} top={4} width={8} />
        <Box borderColor={color} height={12} left={6} radius={6} scale={scale} top={15} width={16} />
        <Line color={accent} height={7} left={14} scale={scale} top={18} width={2} />
      </>
    );
  }

  if (name === "harvest" || name === "material" || name === "soil" || name === "seed" || name === "sprout" || name === "leaf" || name === "setup") {
    return <PlantIcon accent={accent} color={color} name={name} scale={scale} />;
  }

  if (name === "bug") {
    return (
      <>
        <Box borderColor={color} height={14} left={8} radius={7} scale={scale} top={8} width={12} />
        <Line color={accent} height={2} left={4} scale={scale} top={12} width={7} />
        <Line color={accent} height={2} left={17} scale={scale} top={12} width={7} />
        <Line color={accent} height={2} left={5} rotate="25deg" scale={scale} top={18} width={7} />
        <Line color={accent} height={2} left={16} rotate="-25deg" scale={scale} top={18} width={7} />
        <Dot color={color} left={11} scale={scale} size={2.4} top={12} />
        <Dot color={color} left={15} scale={scale} size={2.4} top={12} />
      </>
    );
  }

  if (name === "package" || name === "archive") {
    return (
      <>
        <Box borderColor={color} height={17} left={5} radius={3} scale={scale} top={9} width={18} />
        <Line color={accent} height={2} left={5} scale={scale} top={14} width={18} />
        <Line color={color} height={2} left={10} scale={scale} top={6} width={8} />
      </>
    );
  }

  if (name === "history") {
    return (
      <>
        <Box borderColor={color} height={20} left={5} radius={10} scale={scale} top={5} width={20} />
        <Line color={accent} height={7} left={14} scale={scale} top={9} width={2} />
        <Line color={accent} height={2} left={14} scale={scale} top={15} width={6} />
        <Line color={color} height={2} left={3} rotate="-45deg" scale={scale} top={6} width={7} />
      </>
    );
  }

  if (name === "search") {
    return (
      <>
        <Box borderColor={color} height={14} left={5} radius={7} scale={scale} top={5} width={14} />
        <Line color={accent} height={3} left={16} rotate="45deg" scale={scale} top={18} width={9} />
      </>
    );
  }

  return <PlantIcon accent={accent} color={color} name="leaf" scale={scale} />;
}

function PlantIcon({
  accent,
  color,
  name,
  scale,
}: {
  accent: string;
  color: string;
  name: ThemedIconName;
  scale: number;
}) {
  if (name === "soil") {
    return (
      <>
        <Line color={color} height={2.4} left={5} scale={scale} top={20} width={18} />
        <Line color={accent} height={2.4} left={7} scale={scale} top={15} width={14} />
        <Line color={color} height={10} left={13} scale={scale} top={5} width={2.4} />
        <Leaf accent={accent} color={color} left={8} scale={scale} top={7} />
        <Leaf accent={accent} color={color} left={14} rotate="35deg" scale={scale} top={4} />
      </>
    );
  }

  if (name === "harvest") {
    return (
      <>
        <Box borderColor={color} height={12} left={6} radius={3} scale={scale} top={13} width={17} />
        <Leaf accent={accent} color={color} left={5} rotate="-18deg" scale={scale} top={7} />
        <Leaf accent={accent} color={color} left={12} rotate="14deg" scale={scale} top={5} />
        <Leaf accent={accent} color={color} left={18} rotate="28deg" scale={scale} top={8} />
      </>
    );
  }

  if (name === "material") {
    return (
      <>
        <Box borderColor={color} height={18} left={7} radius={4} scale={scale} top={8} width={14} />
        <Line color={accent} height={2} left={9} scale={scale} top={14} width={10} />
        <Line color={accent} height={2} left={9} scale={scale} top={18} width={10} />
        <Leaf accent={accent} color={color} left={15} scale={scale} top={3} />
      </>
    );
  }

  return (
    <>
      <Line color={color} height={21} left={13} rotate="18deg" scale={scale} top={5} width={2.4} />
      <Leaf accent={accent} color={color} left={5} rotate="-22deg" scale={scale} top={8} />
      <Leaf accent={accent} color={color} left={13} rotate="35deg" scale={scale} top={3} />
    </>
  );
}

function shouldAddFarmAccent(name: ThemedIconName): boolean {
  return !["arrowLeft", "arrowRight", "close", "leaf", "menu", "minus", "plus", "setup", "sprout"].includes(name);
}

function FarmAccentLeaf({ accent, scale }: { accent: string; scale: number }) {
  return (
    <View
      style={[
        styles.accentLeaf,
        {
          backgroundColor: accent,
          borderBottomLeftRadius: 5 * scale,
          borderTopRightRadius: 5 * scale,
          height: 6 * scale,
          left: 20 * scale,
          opacity: 0.9,
          top: 3 * scale,
          transform: [{ rotate: "32deg" }],
          width: 8 * scale,
        },
      ]}
    />
  );
}

function Leaf({
  accent,
  color,
  left,
  rotate = "-22deg",
  scale,
  top,
}: {
  accent: string;
  color: string;
  left: number;
  rotate?: string;
  scale: number;
  top: number;
}) {
  return (
    <View
      style={[
        styles.leafShape,
        {
          backgroundColor: theme.colors.primarySubtle,
          borderBottomLeftRadius: 10 * scale,
          borderColor: color,
          borderTopRightRadius: 10 * scale,
          borderWidth: Math.max(1.3, 1.6 * scale),
          height: 10 * scale,
          left: left * scale,
          top: top * scale,
          transform: [{ rotate }],
          width: 14 * scale,
        },
      ]}
    >
      <View style={[styles.leafVein, { backgroundColor: accent, height: 1.4 * scale, left: 3 * scale, top: 4 * scale, width: 8 * scale }]} />
    </View>
  );
}

function Triangle({ color, scale }: { color: string; scale: number }) {
  return (
    <View
      style={[
        styles.triangle,
        {
          borderBottomWidth: 8 * scale,
          borderLeftColor: color,
          borderLeftWidth: 13 * scale,
          borderTopWidth: 8 * scale,
          left: 9 * scale,
          top: 6 * scale,
        },
      ]}
    />
  );
}

function Chevron({ color, direction, scale }: { color: string; direction: "left" | "right"; scale: number }) {
  return (
    <View
      style={[
        styles.chevron,
        {
          borderColor: color,
          borderRadius: 2 * scale,
          borderRightWidth: 3 * scale,
          borderTopWidth: 3 * scale,
          height: 12 * scale,
          left: direction === "right" ? 8 * scale : 9 * scale,
          top: 8 * scale,
          transform: [{ rotate: direction === "right" ? "45deg" : "-135deg" }],
          width: 12 * scale,
        },
      ]}
    />
  );
}

function Box({
  backgroundColor = "transparent",
  borderColor,
  height,
  left,
  radius,
  scale,
  top,
  width,
}: {
  backgroundColor?: string;
  borderColor: string;
  height: number;
  left: number;
  radius: number;
  scale: number;
  top: number;
  width: number;
}) {
  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor,
          borderColor,
          borderRadius: radius * scale,
          borderWidth: backgroundColor === borderColor ? 0 : Math.max(1.6, 1.9 * scale),
          height: height * scale,
          left: left * scale,
          top: top * scale,
          width: width * scale,
        },
      ]}
    />
  );
}

function Dot({ color, left, scale, size, top }: { color: string; left: number; scale: number; size: number; top: number }) {
  return <View style={[styles.dot, { backgroundColor: color, height: size * scale, left: left * scale, top: top * scale, width: size * scale }]} />;
}

function Line({
  color,
  height,
  left,
  rotate,
  scale,
  top,
  width,
}: {
  color: string;
  height: number;
  left: number;
  rotate?: string;
  scale: number;
  top: number;
  width: number;
}) {
  return (
    <View
      style={[
        styles.line,
        {
          backgroundColor: color,
          height: height * scale,
          left: left * scale,
          top: top * scale,
          transform: rotate ? [{ rotate }] : undefined,
          width: width * scale,
        },
      ]}
    />
  );
}

function IconFrame({ children, size }: { children: ReactNode; size: number }) {
  return <View style={{ height: size, position: "relative", width: size }}>{children}</View>;
}

const styles = StyleSheet.create({
  accentLeaf: {
    position: "absolute",
  },
  arc: {
    position: "absolute",
  },
  box: {
    position: "absolute",
  },
  chevron: {
    backgroundColor: "transparent",
    position: "absolute",
  },
  dot: {
    borderRadius: 999,
    position: "absolute",
  },
  leafShape: {
    position: "absolute",
  },
  leafVein: {
    borderRadius: 999,
    position: "absolute",
  },
  line: {
    borderRadius: 999,
    position: "absolute",
  },
  pin: {
    position: "absolute",
  },
  triangle: {
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
    height: 0,
    position: "absolute",
    width: 0,
  },
});
