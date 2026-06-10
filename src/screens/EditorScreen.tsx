import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  appendEditSuggestion,
  canSubmitEditPrompt,
  getDefaultEditPrompt,
  getLatestEditExplanation,
  normalizeEditPrompt
} from "../shared/editConversation";
import { type AppEditSource } from "../shared/editClient";
import {
  type AppGeneratedImageFallbackReason,
  type AppGeneratedImageJobStatus,
  type AppGeneratedImageSource
} from "../shared/generatedImageClient";
import { getEditStatus } from "../shared/editStatus";
import { type PublishPack, type UploadedAsset } from "../shared/productPipeline";
import { Button } from "../ui/Buttons";
import { CanvasPreview } from "../ui/CanvasPreview";
import { Screen } from "../ui/Screen";
import { palette, spacing } from "../ui/theme";

type EditorScreenProps = {
  pack: PublishPack;
  uploads: UploadedAsset[];
  onBack: () => void;
  isEditing: boolean;
  editSource?: AppEditSource;
  editFallbackReason?: string;
  editEndpointConfigured: boolean;
  isGeneratingCover: boolean;
  generatedImageJobStatus?: AppGeneratedImageJobStatus;
  generatedImageSource?: AppGeneratedImageSource;
  generatedImageFallbackReason?: AppGeneratedImageFallbackReason;
  imageGenerateEndpointConfigured: boolean;
  onApplyEdit: (userMessage: string) => void;
  onGenerateCover: () => void;
  onExport: () => void;
};

const chips = ["标题短一点", "背景真实一点", "突出 95 新", "放大瑕疵说明"];

export function EditorScreen({
  pack,
  uploads,
  onBack,
  isEditing,
  editSource,
  editFallbackReason,
  editEndpointConfigured,
  isGeneratingCover,
  generatedImageJobStatus,
  generatedImageSource,
  generatedImageFallbackReason,
  imageGenerateEndpointConfigured,
  onApplyEdit,
  onGenerateCover,
  onExport
}: EditorScreenProps) {
  const [editPrompt, setEditPrompt] = useState(() => getDefaultEditPrompt());
  const canSubmit = canSubmitEditPrompt(editPrompt) && !isEditing;
  const latestExplanation = getLatestEditExplanation(pack.history);
  const editStatus = getEditStatus({
    source: editSource,
    hasHistory: pack.history.length > 0,
    endpointConfigured: editEndpointConfigured,
    fallbackReason: editFallbackReason
  });
  const generatedStatus = getGeneratedImageStatus({
    source: generatedImageSource,
    fallbackReason: generatedImageFallbackReason,
    endpointConfigured: imageGenerateEndpointConfigured,
    isGenerating: isGeneratingCover,
    jobStatus: generatedImageJobStatus
  });

  function handleChipPress(chip: string) {
    setEditPrompt((current) => appendEditSuggestion(current, chip));
  }

  function handleApplyEdit() {
    const nextPrompt = normalizeEditPrompt(editPrompt);
    if (!nextPrompt || isEditing) {
      return;
    }

    onApplyEdit(nextPrompt);
  }

  function handleGenerateCover() {
    if (isGeneratingCover || !imageGenerateEndpointConfigured) {
      return;
    }

    onGenerateCover();
  }

  return (
    <Screen eyebrow="AI 可编辑画布" title={pack.title} subtitle={pack.summary}>
      <CanvasPreview canvas={pack.canvases[0]} uploads={uploads} />

      <View style={styles.generatePanel}>
        <View style={styles.generateCopy}>
          <Text style={styles.panelTitle}>AI 生成封面</Text>
          <Text style={styles.generateText}>{generatedStatus.detail}</Text>
        </View>
        <Button
          label={generatedStatus.actionLabel}
          onPress={handleGenerateCover}
          variant={imageGenerateEndpointConfigured && !isGeneratingCover ? "primary" : "secondary"}
        />
      </View>

      <View style={styles.toolbar}>
        {["模板", "文字", "背景", "标签", "瑕疵", "AI"].map((tool) => (
          <View key={tool} style={[styles.tool, tool === "AI" ? styles.activeTool : null]}>
            <Text style={[styles.toolText, tool === "AI" ? styles.activeToolText : null]}>{tool}</Text>
          </View>
        ))}
      </View>

      <View style={styles.aiPanel}>
        <Text style={styles.panelTitle}>对话改图</Text>
        <TextInput
          editable={!isEditing}
          multiline
          onChangeText={setEditPrompt}
          placeholder="例如：标题短一点，背景真实一点，把瑕疵说明放大"
          placeholderTextColor={palette.faint}
          style={styles.promptInput}
          value={editPrompt}
        />
        <View style={styles.chips}>
          {chips.map((chip) => (
            <Pressable key={chip} onPress={() => handleChipPress(chip)} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </Pressable>
          ))}
        </View>
        <Button
          label={isEditing ? "改图中" : canSubmit ? "应用 AI 改图" : "输入修改要求"}
          onPress={handleApplyEdit}
          variant={canSubmit ? "primary" : "secondary"}
        />
        <View style={styles.editStatusPanel}>
          <View style={styles.editStatusHeader}>
            <Text style={styles.editStatusTitle}>{editStatus.title}</Text>
            <View style={styles.editStatusBadge}>
              <Text style={styles.editStatusBadgeText}>{editStatus.label}</Text>
            </View>
          </View>
          <Text style={styles.editStatusDetail}>{editStatus.detail}</Text>
          <Text style={styles.editStatusSecurity}>{editStatus.securityNote}</Text>
        </View>
        {latestExplanation ? <Text style={styles.applied}>{latestExplanation}</Text> : null}
      </View>

      <View style={styles.detailPreview}>
        <Text style={styles.panelTitle}>详情拼图</Text>
        {pack.canvases[1] ? <CanvasPreview canvas={pack.canvases[1]} uploads={uploads} compact /> : null}
      </View>

      <View style={styles.actions}>
        <Button label="返回" variant="secondary" onPress={onBack} style={styles.actionButton} />
        <Button label="去导出" onPress={onExport} style={styles.actionButton} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.xs,
    gap: spacing.xs
  },
  tool: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6
  },
  activeTool: {
    backgroundColor: palette.ink
  },
  toolText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  activeToolText: {
    color: palette.white
  },
  aiPanel: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    gap: spacing.md
  },
  generatePanel: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    gap: spacing.md
  },
  generateCopy: {
    gap: spacing.xs
  },
  generateText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  panelTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  promptInput: {
    minHeight: 96,
    color: palette.ink,
    backgroundColor: palette.surfaceMuted,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    textAlignVertical: "top"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    borderRadius: 999,
    backgroundColor: palette.greenSoft,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  chipText: {
    color: palette.green,
    fontSize: 13,
    fontWeight: "800"
  },
  editStatusPanel: {
    borderRadius: 8,
    backgroundColor: palette.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs
  },
  editStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  editStatusTitle: {
    flex: 1,
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  editStatusBadge: {
    borderRadius: 999,
    backgroundColor: palette.greenSoft,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  editStatusBadgeText: {
    color: palette.green,
    fontSize: 11,
    fontWeight: "900"
  },
  editStatusDetail: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17
  },
  editStatusSecurity: {
    color: palette.green,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  applied: {
    color: palette.green,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  detailPreview: {
    gap: spacing.md
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md
  },
  actionButton: {
    flex: 1
  }
});

function getGeneratedImageStatus({
  source,
  fallbackReason,
  endpointConfigured,
  isGenerating,
  jobStatus
}: {
  source?: AppGeneratedImageSource;
  fallbackReason?: AppGeneratedImageFallbackReason;
  endpointConfigured: boolean;
  isGenerating: boolean;
  jobStatus?: AppGeneratedImageJobStatus;
}) {
  if (isGenerating) {
    if (jobStatus === "queued") {
      return {
        actionLabel: "排队中",
        detail: "生成任务已创建，正在排队准备调用 GPT Image 2。你可以留在当前页等待，完成后会自动替换封面。"
      };
    }

    return {
      actionLabel: "生成中",
      detail: "GPT Image 2 正在生成封面，通常需要 1-3 分钟。任务在后台进行，完成后会自动保存到云端并替换当前封面。"
    };
  }

  if (!endpointConfigured) {
    return {
      actionLabel: "配置接口后可用",
      detail: "当前没有配置生图接口，暂时不能生成真实封面。"
    };
  }

  if (source === "remote") {
    return {
      actionLabel: "重新生成",
      detail: "封面已由 GPT Image 2 生成，并保存为云端图片；保存作品后可继续在作品库打开。"
    };
  }

  if (fallbackReason === "missing_image_url") {
    return {
      actionLabel: "重试生成",
      detail: "模型返回了结果，但没有可展示的图片 URL。请重试一次。"
    };
  }

  if (fallbackReason === "remote_failed") {
    return {
      actionLabel: "重试生成",
      detail: "生图服务这次没有成功返回，可能是网络或模型耗时问题。"
    };
  }

  return {
    actionLabel: "AI 生成封面",
    detail: "基于当前商品图、平台和文案生成一张可发布封面；商品成色和瑕疵不应被美化。"
  };
}
