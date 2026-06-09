import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { type Platform } from "../shared/productPipeline";
import { getFeaturedTemplates, type SellerTemplate } from "../shared/templateStrategy";
import { Button } from "../ui/Buttons";
import { TemplatePreview } from "../ui/TemplatePreview";
import { palette, spacing } from "../ui/theme";

type CreateScreenProps = {
  onStart: (platform: Platform) => void;
  onUseTemplate: (template: SellerTemplate) => void;
};

export function CreateScreen({ onStart, onUseTemplate }: CreateScreenProps) {
  const templates = getFeaturedTemplates();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.kicker}>创建发布包</Text>
        <Text style={styles.title}>从拍商品开始</Text>
        <Text style={styles.subtitle}>选择平台或模板，接下来上传 3-8 张图，AI 会生成可编辑发布资产。</Text>
      </View>

      <View style={styles.primaryPanel}>
        <Text style={styles.primaryTitle}>最快路径</Text>
        <Text style={styles.primaryText}>闲鱼卖货默认使用真实成色策略，会保留瑕疵并生成说明图。</Text>
        <Button label="拍/选商品图" variant="secondary" onPress={() => onStart("xianyu")} />
      </View>

      <View style={styles.platformGrid}>
        {[
          { label: "闲鱼", detail: "真实成色", platform: "xianyu" as const },
          { label: "小红书", detail: "种草封面", platform: "xiaohongshu" as const },
          { label: "商品主图", detail: "干净主体", platform: "shop_main" as const },
          { label: "朋友圈", detail: "九宫格", platform: "wechat" as const }
        ].map((item) => (
          <Pressable key={item.label} onPress={() => onStart(item.platform)} style={styles.platformCard}>
            <Text style={styles.platformTitle}>{item.label}</Text>
            <Text style={styles.platformText}>{item.detail}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>从模板开始</Text>
        <View style={styles.templateList}>
          {templates.map((template) => (
            <Pressable key={template.id} onPress={() => onUseTemplate(template)} style={styles.templateRow}>
              <TemplatePreview template={template} compact />
              <View style={styles.templateCopy}>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateText}>{template.outputs.join(" / ")}</Text>
              </View>
            </Pressable>
          ))}
        </View>
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
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  subtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21
  },
  primaryPanel: {
    borderRadius: 8,
    backgroundColor: palette.ink,
    padding: spacing.lg,
    gap: spacing.md
  },
  primaryTitle: {
    color: palette.white,
    fontSize: 20,
    fontWeight: "900"
  },
  primaryText: {
    color: "#D8D4CA",
    fontSize: 14,
    lineHeight: 20
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  platformCard: {
    width: "47%",
    minHeight: 86,
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  platformTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  platformText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  section: {
    gap: spacing.md
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  templateList: {
    gap: spacing.md
  },
  templateRow: {
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
  }
});
