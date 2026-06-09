import { StyleSheet, Text, View } from "react-native";

import { type Platform } from "../shared/productPipeline";
import { evaluateUploadReadiness, getUploadGuidance } from "../shared/uploadGuidance";
import { Button } from "../ui/Buttons";
import { Screen } from "../ui/Screen";
import { palette, spacing } from "../ui/theme";

type UploadScreenProps = {
  platform: Platform;
  uploadError: string | null;
  isAnalyzing: boolean;
  onBack: () => void;
  onPickGallery: () => void;
  onUseSample: () => void;
};

const platformLabels: Record<Platform, string> = {
  xianyu: "闲鱼卖货",
  xiaohongshu: "小红书种草",
  shop_main: "商品主图",
  wechat: "朋友圈小店"
};

export function UploadScreen({
  platform,
  uploadError,
  isAnalyzing,
  onBack,
  onPickGallery,
  onUseSample
}: UploadScreenProps) {
  const guidance = getUploadGuidance(platform);
  const readiness = evaluateUploadReadiness([], platform);

  return (
    <Screen
      eyebrow={platformLabels[platform]}
      title="先放入商品照片"
      subtitle="可以直接从相册选择 3-8 张商品图；现场演示也可以使用稳定样例图。"
    >
      <View style={styles.dropZone}>
        <Text style={styles.dropTitle}>选择商品照片</Text>
        <Text style={styles.dropText}>{guidance.toneHint}</Text>
      </View>

      {uploadError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{uploadError}</Text>
        </View>
      ) : null}

      <View style={styles.checklist}>
        <View style={styles.checkHeader}>
          <Text style={styles.checkTitle}>{guidance.title}</Text>
          <Text style={styles.checkMeta}>3-8 张</Text>
        </View>
        {guidance.requiredShots.map((item, index) => (
          <View key={item} style={styles.checkItem}>
            <Text style={styles.checkIndex}>{index + 1}</Text>
            <Text style={styles.checkText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.qualityBox}>
        <Text style={styles.qualityTitle}>上传后自动检查</Text>
        {readiness.messages.map((message) => (
          <Text key={message} style={styles.qualityText}>{message}</Text>
        ))}
        <Text style={styles.qualityText}>同时检查图片数量、基础分辨率和是否适合高清导出。</Text>
      </View>

      <View style={styles.actions}>
        <Button label="返回" variant="secondary" onPress={onBack} style={styles.actionButton} />
        <Button label={isAnalyzing ? "诊断中" : "选相册图"} onPress={onPickGallery} style={styles.actionButton} />
      </View>
      <Button label={isAnalyzing ? "正在生成诊断" : "使用样例图"} variant="secondary" onPress={onUseSample} />
      <Text style={styles.hint}>样例图会模拟耳机商品，适合面试现场稳定演示完整链路。</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dropZone: {
    minHeight: 184,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: palette.green,
    backgroundColor: palette.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm
  },
  dropTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  dropText: {
    color: palette.muted,
    fontSize: 14,
    textAlign: "center"
  },
  checklist: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md,
    gap: spacing.sm
  },
  checkHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.xs
  },
  checkTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  checkMeta: {
    color: palette.green,
    fontSize: 12,
    fontWeight: "900"
  },
  qualityBox: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md,
    gap: spacing.xs
  },
  qualityTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  qualityText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18
  },
  errorBox: {
    backgroundColor: palette.coralSoft,
    borderColor: "#E5C8BE",
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md
  },
  errorText: {
    color: palette.coral,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  checkIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.surfaceMuted,
    color: palette.ink,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "900"
  },
  checkText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "700"
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md
  },
  actionButton: {
    flex: 1
  },
  hint: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center"
  }
});
