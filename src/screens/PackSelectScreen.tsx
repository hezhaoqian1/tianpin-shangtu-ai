import { Pressable, StyleSheet, Text, View } from "react-native";

import { type PublishPack, type UploadedAsset } from "../shared/productPipeline";
import { Button } from "../ui/Buttons";
import { CanvasPreview } from "../ui/CanvasPreview";
import { Screen } from "../ui/Screen";
import { palette, spacing } from "../ui/theme";

type PackSelectScreenProps = {
  packs: PublishPack[];
  uploads: UploadedAsset[];
  onBack: () => void;
  onSelect: (pack: PublishPack) => void;
};

export function PackSelectScreen({ packs, uploads, onBack, onSelect }: PackSelectScreenProps) {
  return (
    <Screen eyebrow="方案选择" title="先给你三套发布资产" subtitle="每套都有封面、详情图和平台文案，选中后还能继续对话修改。">
      {packs.map((pack) => (
        <Pressable key={pack.id} onPress={() => onSelect(pack)} style={styles.card}>
          <CanvasPreview canvas={pack.canvases[0]} uploads={uploads} compact />
          <View style={styles.cardText}>
            <View style={styles.titleRow}>
              <Text style={styles.packTitle}>{pack.title}</Text>
              <View style={pack.platformFitLabel === "首推" ? styles.recommendedBadge : styles.secondaryBadge}>
                <Text style={pack.platformFitLabel === "首推" ? styles.recommendedText : styles.secondaryText}>
                  {pack.platformFitLabel}
                </Text>
              </View>
            </View>
            <Text style={styles.packSummary}>{pack.summary}</Text>
            <Text style={styles.packCopy}>{pack.copy.titles[0]}</Text>
          </View>
        </Pressable>
      ))}
      <Button label="返回诊断" variant="secondary" onPress={onBack} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md,
    gap: spacing.md
  },
  cardText: {
    gap: spacing.xs
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  packTitle: {
    flex: 1,
    color: palette.ink,
    fontSize: 19,
    fontWeight: "900"
  },
  recommendedBadge: {
    borderRadius: 999,
    backgroundColor: palette.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  secondaryBadge: {
    borderRadius: 999,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  recommendedText: {
    color: palette.green,
    fontSize: 12,
    fontWeight: "900"
  },
  secondaryText: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: "900"
  },
  packSummary: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20
  },
  packCopy: {
    color: palette.green,
    fontSize: 14,
    fontWeight: "800"
  }
});
