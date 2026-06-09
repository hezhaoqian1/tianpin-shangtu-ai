import { StyleSheet, Text, View } from "react-native";

import { type SellerTemplate } from "../shared/templateStrategy";
import { palette, spacing } from "./theme";

type TemplatePreviewProps = {
  template: SellerTemplate;
  compact?: boolean;
};

export function TemplatePreview({ template, compact = false }: TemplatePreviewProps) {
  return (
    <View style={[styles.preview, { backgroundColor: template.backgroundColor }, compact ? styles.compact : null]}>
      <View style={[styles.photo, { borderColor: template.accentColor }]}>
        <View style={[styles.productBody, { backgroundColor: template.accentColor }]} />
        <View style={styles.productHighlight} />
      </View>
      <View style={styles.copyBlock}>
        <View style={[styles.titleLine, { backgroundColor: template.accentColor }]} />
        <View style={styles.metaLine} />
      </View>
      <View style={[styles.badge, { backgroundColor: template.accentColor }]}>
        <Text style={styles.badgeText}>{template.outputs[0]}</Text>
      </View>
      {!compact ? <Text style={styles.caption}>{template.category}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    minHeight: 150,
    borderRadius: 8,
    padding: spacing.md,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: palette.line
  },
  compact: {
    width: 128,
    minHeight: 112
  },
  photo: {
    height: 84,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.58)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  productBody: {
    width: "48%",
    height: 34,
    borderRadius: 18,
    opacity: 0.88
  },
  productHighlight: {
    position: "absolute",
    width: "26%",
    height: 8,
    borderRadius: 999,
    top: 28,
    backgroundColor: "rgba(255,255,255,0.72)"
  },
  copyBlock: {
    marginTop: spacing.sm,
    gap: 6
  },
  titleLine: {
    width: "64%",
    height: 10,
    borderRadius: 999
  },
  metaLine: {
    width: "42%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(32,32,29,0.18)"
  },
  badge: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  badgeText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: "900"
  },
  caption: {
    position: "absolute",
    left: spacing.md,
    bottom: spacing.md,
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800"
  }
});
