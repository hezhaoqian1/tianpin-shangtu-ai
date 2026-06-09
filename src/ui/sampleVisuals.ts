export type SampleVisualKind = "headphones_front" | "headphones_case" | "headphones_wear" | "headphones_side";

export type SampleVisual = {
  kind: SampleVisualKind;
  label: string;
};

const sampleVisuals: Record<string, SampleVisual> = {
  "sample://headphones/front": {
    kind: "headphones_front",
    label: "耳机正面"
  },
  "sample://headphones/case": {
    kind: "headphones_case",
    label: "包装配件"
  },
  "sample://headphones/wear": {
    kind: "headphones_wear",
    label: "耳罩磨损"
  },
  "sample://headphones/side": {
    kind: "headphones_side",
    label: "侧面角度"
  }
};

export function getSampleVisual(uri?: string): SampleVisual | null {
  if (!uri) {
    return null;
  }

  return sampleVisuals[uri] ?? null;
}
