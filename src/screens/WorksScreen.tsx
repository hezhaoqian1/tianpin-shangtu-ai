import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { type Platform } from "../shared/productPipeline";
import { type HistoryItem } from "../shared/workspace";
import { Button } from "../ui/Buttons";
import { palette, spacing } from "../ui/theme";

type WorksScreenProps = {
  historyItems: HistoryItem[];
  onOpenHistory: (projectId: string) => void;
  onStart: (platform: Platform) => void;
};

export function WorksScreen({ historyItems, onOpenHistory, onStart }: WorksScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.kicker}>作品库</Text>
        <Text style={styles.title}>你的卖货资产</Text>
        <Text style={styles.subtitle}>草稿、导出记录和同款复用会集中保存在这里。</Text>
      </View>

      <View style={styles.tabs}>
        {["草稿", "已导出", "同款复用"].map((label, index) => (
          <View key={label} style={[styles.filter, index === 0 ? styles.activeFilter : null]}>
            <Text style={[styles.filterText, index === 0 ? styles.activeFilterText : null]}>{label}</Text>
          </View>
        ))}
      </View>

      {historyItems.length > 0 ? (
        <View style={styles.list}>
          {historyItems.map((item) => (
            <Pressable key={item.id} onPress={() => onOpenHistory(item.id)} style={styles.item}>
              <View style={styles.thumb}>
                <Text style={styles.thumbText}>{item.platformLabel}</Text>
              </View>
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {item.styleLabel} · {item.assetSummary}
                </Text>
                <Text style={styles.itemAction}>{item.updatedAtLabel} · 继续编辑</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>还没有保存作品</Text>
          <Text style={styles.emptyText}>登录后的第一套发布包会出现在这里，后续可以一键复用风格。</Text>
          <Button label="做第一套发布图" onPress={() => onStart("xianyu")} />
        </View>
      )}
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
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  subtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21
  },
  tabs: {
    flexDirection: "row",
    gap: spacing.sm
  },
  filter: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    alignItems: "center",
    justifyContent: "center"
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
  list: {
    gap: spacing.md
  },
  item: {
    minHeight: 112,
    flexDirection: "row",
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden"
  },
  thumb: {
    width: 96,
    backgroundColor: palette.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm
  },
  thumbText: {
    color: palette.green,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  itemBody: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "center",
    gap: spacing.xs
  },
  itemTitle: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900"
  },
  itemMeta: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17
  },
  itemAction: {
    color: palette.green,
    fontSize: 12,
    fontWeight: "900"
  },
  empty: {
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    gap: spacing.md
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21
  }
});
