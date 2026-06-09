import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { type Platform } from "../shared/productPipeline";
import { type UserSession } from "../shared/session";
import { getFeaturedTemplates, type SellerTemplate } from "../shared/templateStrategy";
import { type HistoryItem } from "../shared/workspace";
import { Button } from "../ui/Buttons";
import { TemplatePreview } from "../ui/TemplatePreview";
import { palette, spacing } from "../ui/theme";

type DashboardScreenProps = {
  session: UserSession;
  historyItems: HistoryItem[];
  onOpenHistory: (projectId: string) => void;
  onStart: (platform: Platform) => void;
  onUseTemplate: (template: SellerTemplate) => void;
};

export function DashboardScreen({
  session,
  historyItems,
  onOpenHistory,
  onStart,
  onUseTemplate
}: DashboardScreenProps) {
  const featuredTemplates = getFeaturedTemplates();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>0x 发条鸟</Text>
          <Text style={styles.title}>今天要卖什么？</Text>
        </View>
        <View style={styles.quota}>
          <Text style={styles.quotaValue}>{session.remainingFreePacks}</Text>
          <Text style={styles.quotaLabel}>生成额度</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>拍商品，生成一套发布包</Text>
          <Text style={styles.heroText}>封面、详情拼图、瑕疵说明和平台文案一次出。</Text>
        </View>
        <Button label="开始做图" variant="secondary" onPress={() => onStart("xianyu")} />
      </View>

      <View style={styles.quickGrid}>
        {[
          { label: "闲鱼卖货", platform: "xianyu" as const },
          { label: "小红书", platform: "xiaohongshu" as const },
          { label: "商品主图", platform: "shop_main" as const },
          { label: "朋友圈", platform: "wechat" as const }
        ].map((item) => (
          <Pressable key={item.label} onPress={() => onStart(item.platform)} style={styles.quickCard}>
            <Text style={styles.quickTitle}>{item.label}</Text>
            <Text style={styles.quickText}>选照片开始</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>今日推荐模板</Text>
          <Text style={styles.sectionMeta}>策略模板</Text>
        </View>
        <View style={styles.templateList}>
          {featuredTemplates.map((template) => (
            <Pressable key={template.id} onPress={() => onUseTemplate(template)} style={styles.templateCard}>
              <TemplatePreview template={template} compact />
              <View style={styles.templateCopy}>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateText}>{template.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>继续编辑</Text>
          <Text style={styles.sectionMeta}>{historyItems.length > 0 ? `${historyItems.length} 个作品` : "暂无"}</Text>
        </View>
        {historyItems.length > 0 ? (
          <View style={styles.historyList}>
            {historyItems.slice(0, 2).map((item) => (
              <Pressable key={item.id} onPress={() => onOpenHistory(item.id)} style={styles.historyItem}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historyMeta}>
                  {item.platformLabel} · {item.assetSummary}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>还没有作品</Text>
            <Text style={styles.emptyText}>做完第一套发布包后，会在这里继续编辑和复用风格。</Text>
          </View>
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  kicker: {
    color: palette.green,
    fontSize: 13,
    fontWeight: "900"
  },
  title: {
    color: palette.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    marginTop: 4
  },
  quota: {
    minWidth: 78,
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: "center",
    padding: spacing.sm
  },
  quotaValue: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  quotaLabel: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: "800"
  },
  hero: {
    borderRadius: 8,
    backgroundColor: palette.ink,
    padding: spacing.lg,
    gap: spacing.lg
  },
  heroCopy: {
    gap: spacing.xs
  },
  heroTitle: {
    color: palette.white,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900"
  },
  heroText: {
    color: "#D8D4CA",
    fontSize: 14,
    lineHeight: 20
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  quickCard: {
    width: "47%",
    minHeight: 88,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  quickTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  quickText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  section: {
    gap: spacing.md
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  sectionMeta: {
    color: palette.green,
    fontSize: 12,
    fontWeight: "900"
  },
  templateList: {
    gap: spacing.md
  },
  templateCard: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    padding: spacing.sm
  },
  templateCopy: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs
  },
  templateTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  templateText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17
  },
  historyList: {
    gap: spacing.md
  },
  historyItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    padding: spacing.md,
    gap: spacing.xs
  },
  historyTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  historyMeta: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17
  },
  emptyState: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    padding: spacing.lg,
    gap: spacing.xs
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  emptyText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19
  }
});
