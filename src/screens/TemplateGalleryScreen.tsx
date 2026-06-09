import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { sellerTemplates, type SellerTemplate, getPlatformLabel } from "../shared/templateStrategy";
import { TemplatePreview } from "../ui/TemplatePreview";
import { palette, spacing } from "../ui/theme";

type TemplateGalleryScreenProps = {
  onUseTemplate: (template: SellerTemplate) => void;
};

const filters = ["全部", "闲鱼", "小红书", "主图", "朋友圈"];

export function TemplateGalleryScreen({ onUseTemplate }: TemplateGalleryScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.kicker}>模板广场</Text>
        <Text style={styles.title}>不是套壳，是卖货策略</Text>
        <Text style={styles.subtitle}>每个模板都包含平台尺寸、拍摄清单、画布布局和文案语气。</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((filter, index) => (
          <View key={filter} style={[styles.filter, index === 0 ? styles.activeFilter : null]}>
            <Text style={[styles.filterText, index === 0 ? styles.activeFilterText : null]}>{filter}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.grid}>
        {sellerTemplates.map((template) => (
          <Pressable key={template.id} onPress={() => onUseTemplate(template)} style={styles.card}>
            <TemplatePreview template={template} />
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{template.title}</Text>
                <View style={styles.platformBadge}>
                  <Text style={styles.platformText}>{getPlatformLabel(template.platform)}</Text>
                </View>
              </View>
              <Text style={styles.cardText}>{template.subtitle}</Text>
              <View style={styles.tags}>
                {[template.category, template.goal, template.style].map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.templateMeta}>
                <Text style={styles.metaText}>需要：{template.requiredShots.join(" / ")}</Text>
                <Text style={styles.metaText}>输出：{template.outputs.join(" / ")}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: 110,
    gap: spacing.lg
  },
  header: {
    gap: spacing.sm
  },
  kicker: {
    color: palette.green,
    fontSize: 13,
    fontWeight: "900"
  },
  title: {
    color: palette.ink,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900"
  },
  subtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21
  },
  filters: {
    gap: spacing.sm
  },
  filter: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  activeFilter: {
    backgroundColor: palette.ink,
    borderColor: palette.ink
  },
  filterText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  activeFilterText: {
    color: palette.white
  },
  grid: {
    gap: spacing.lg
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden"
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.sm
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  cardTitle: {
    flex: 1,
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  platformBadge: {
    borderRadius: 999,
    backgroundColor: palette.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  platformText: {
    color: palette.green,
    fontSize: 12,
    fontWeight: "900"
  },
  cardText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tag: {
    borderRadius: 999,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tagText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  templateMeta: {
    gap: 4
  },
  metaText: {
    color: palette.faint,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  }
});
