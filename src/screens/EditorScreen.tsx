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
  onApplyEdit: (userMessage: string) => void;
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
  onApplyEdit,
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

  return (
    <Screen eyebrow="AI 可编辑画布" title={pack.title} subtitle={pack.summary}>
      <CanvasPreview canvas={pack.canvases[0]} uploads={uploads} />

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
