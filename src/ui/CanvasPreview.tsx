import { Image, StyleSheet, Text, View } from "react-native";

import { type CanvasAsset, type UploadedAsset } from "../shared/productPipeline";
import { getSampleVisual, type SampleVisualKind } from "./sampleVisuals";
import { palette } from "./theme";

type CanvasPreviewProps = {
  canvas: CanvasAsset;
  uploads: UploadedAsset[];
  compact?: boolean;
};

const imageColors = ["#DED8C9", "#D9E4DE", "#E8D6D0", "#D7D9E4"];

export function CanvasPreview({ canvas, uploads, compact = false }: CanvasPreviewProps) {
  const uploadMap = new Map(uploads.map((asset) => [asset.id, asset]));

  return (
    <View
      style={[
        styles.canvas,
        {
          aspectRatio: canvas.width / canvas.height,
          backgroundColor: canvas.background.value
        },
        compact ? styles.compactCanvas : null
      ]}
    >
      {canvas.layers.map((layer, index) => {
        if (layer.type === "image") {
          const upload = uploadMap.get(layer.imageId);
          const canRenderImage = upload?.uri && !upload.uri.startsWith("sample://");
          const sampleVisual = getSampleVisual(upload?.uri);

          return (
            <View
              key={layer.id}
              style={[
                styles.imageLayer,
                percentBox(canvas, layer.x, layer.y, layer.width, layer.height),
                {
                  borderRadius: layer.cornerRadius ? Math.max(4, layer.cornerRadius / 4) : 8,
                  backgroundColor: imageColors[index % imageColors.length]
                }
              ]}
            >
              {canRenderImage ? (
                <Image source={{ uri: upload.uri }} style={styles.image} resizeMode="cover" />
              ) : sampleVisual ? (
                <SampleProductVisual kind={sampleVisual.kind} label={sampleVisual.label} />
              ) : (
                <Text style={styles.imageLabel}>{upload?.label ?? layer.imageId}</Text>
              )}
            </View>
          );
        }

        if (layer.type === "text") {
          return (
            <Text
              key={layer.id}
              numberOfLines={2}
              style={[
                styles.textLayer,
                percentPosition(canvas, layer.x, layer.y),
                {
                  color: layer.color,
                  fontSize: compact ? Math.max(12, layer.fontSize / 4) : Math.max(14, layer.fontSize / 3.2),
                  fontWeight: layer.fontWeight === "bold" ? "900" : "600"
                }
              ]}
            >
              {layer.text}
            </Text>
          );
        }

        if (layer.type === "label") {
          return (
            <View
              key={layer.id}
              style={[
                styles.labelLayer,
                percentPosition(canvas, layer.x, layer.y),
                {
                  backgroundColor: layer.backgroundColor
                }
              ]}
            >
              <Text style={[styles.labelText, { color: layer.color }]}>{layer.text}</Text>
            </View>
          );
        }

        return (
          <View key={layer.id} style={styles.callout}>
            <Text style={styles.calloutText}>{layer.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function SampleProductVisual({ kind, label }: { kind: SampleVisualKind; label: string }) {
  if (kind === "headphones_case") {
    return (
      <View style={styles.sampleVisual}>
        <View style={styles.caseBox}>
          <Text style={styles.caseBrand}>SONY</Text>
          <Text style={styles.caseModel}>WH-1000XM5</Text>
        </View>
        <View style={styles.accessoryCable} />
        <Text style={styles.sampleCaption}>{label}</Text>
      </View>
    );
  }

  if (kind === "headphones_wear") {
    return (
      <View style={styles.sampleVisual}>
        <View style={styles.earPadLarge}>
          <View style={styles.wearMark} />
          <View style={styles.wearMarkSmall} />
        </View>
        <Text style={styles.sampleCaption}>{label}</Text>
      </View>
    );
  }

  if (kind === "headphones_side") {
    return (
      <View style={styles.sampleVisual}>
        <View style={styles.sideBand} />
        <View style={styles.sideCup} />
        <Text style={styles.sampleCaption}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.sampleVisual}>
      <View style={styles.headBand} />
      <View style={styles.leftCup} />
      <View style={styles.rightCup} />
      <View style={styles.bridgePad} />
      <Text style={styles.sampleCaption}>{label}</Text>
    </View>
  );
}

function percentBox(canvas: CanvasAsset, x: number, y: number, width: number, height: number) {
  return {
    left: `${(x / canvas.width) * 100}%`,
    top: `${(y / canvas.height) * 100}%`,
    width: `${(width / canvas.width) * 100}%`,
    height: `${(height / canvas.height) * 100}%`
  } as const;
}

function percentPosition(canvas: CanvasAsset, x: number, y: number) {
  return {
    left: `${(x / canvas.width) * 100}%`,
    top: `${(y / canvas.height) * 100}%`
  } as const;
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.line,
    position: "relative"
  },
  compactCanvas: {
    minHeight: 180
  },
  imageLayer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(32,32,29,0.08)"
  },
  imageLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  sampleVisual: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.24)"
  },
  headBand: {
    position: "absolute",
    top: "18%",
    width: "58%",
    height: "42%",
    borderRadius: 999,
    borderWidth: 10,
    borderColor: "#343632",
    borderBottomColor: "transparent"
  },
  leftCup: {
    position: "absolute",
    left: "24%",
    top: "47%",
    width: "19%",
    height: "30%",
    borderRadius: 18,
    backgroundColor: "#242622"
  },
  rightCup: {
    position: "absolute",
    right: "24%",
    top: "47%",
    width: "19%",
    height: "30%",
    borderRadius: 18,
    backgroundColor: "#242622"
  },
  bridgePad: {
    position: "absolute",
    top: "23%",
    width: "30%",
    height: "8%",
    borderRadius: 999,
    backgroundColor: "#5E6158"
  },
  caseBox: {
    width: "62%",
    height: "48%",
    borderRadius: 10,
    backgroundColor: "#F8F7F1",
    borderWidth: 1,
    borderColor: "rgba(32,32,29,0.18)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  caseBrand: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  caseModel: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "800"
  },
  accessoryCable: {
    position: "absolute",
    right: "18%",
    bottom: "22%",
    width: "18%",
    height: "18%",
    borderRadius: 999,
    borderWidth: 4,
    borderColor: "#353832"
  },
  earPadLarge: {
    width: "46%",
    height: "58%",
    borderRadius: 26,
    backgroundColor: "#2C2E2A",
    alignItems: "center",
    justifyContent: "center"
  },
  wearMark: {
    width: "54%",
    height: "12%",
    borderRadius: 999,
    backgroundColor: "#8B7A6B",
    transform: [{ rotate: "-12deg" }]
  },
  wearMarkSmall: {
    width: "36%",
    height: "8%",
    borderRadius: 999,
    backgroundColor: "#A08C7A",
    marginTop: 8,
    transform: [{ rotate: "8deg" }]
  },
  sideBand: {
    position: "absolute",
    top: "22%",
    left: "28%",
    width: "42%",
    height: "13%",
    borderRadius: 999,
    backgroundColor: "#343632",
    transform: [{ rotate: "-18deg" }]
  },
  sideCup: {
    position: "absolute",
    top: "41%",
    width: "32%",
    height: "34%",
    borderRadius: 20,
    backgroundColor: "#262823"
  },
  sampleCaption: {
    position: "absolute",
    bottom: 10,
    color: palette.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  textLayer: {
    position: "absolute",
    maxWidth: "82%"
  },
  labelLayer: {
    position: "absolute",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  labelText: {
    fontSize: 12,
    fontWeight: "800"
  },
  callout: {
    position: "absolute",
    right: "7%",
    bottom: "9%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.coral,
    backgroundColor: palette.coralSoft,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  calloutText: {
    color: palette.coral,
    fontSize: 12,
    fontWeight: "800"
  }
});
