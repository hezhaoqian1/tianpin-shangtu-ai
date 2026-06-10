import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { copyTextToClipboard } from "../shared/clipboardClient";
import { createExportBundle, evaluateExportAction, type ExportAction } from "../shared/exportBundle";
import { type PublishPack, type UploadedAsset } from "../shared/productPipeline";
import { getLoginPromptCopy, type UserSession } from "../shared/session";
import { Button } from "../ui/Buttons";
import { CanvasPreview } from "../ui/CanvasPreview";
import { Screen } from "../ui/Screen";
import { palette, spacing } from "../ui/theme";

type ExportScreenProps = {
  pack: PublishPack;
  uploads: UploadedAsset[];
  session: UserSession;
  saveMessage: string | null;
  onLogin: () => void;
  onSaveProject: () => void | Promise<void>;
  onBack: () => void;
  onRestart: () => void;
};

export function ExportScreen({
  pack,
  uploads,
  session,
  saveMessage,
  onLogin,
  onSaveProject,
  onBack,
  onRestart
}: ExportScreenProps) {
  const [localExportMessage, setLocalExportMessage] = useState<string | null>(null);
  const bundle = useMemo(() => createExportBundle(pack, session), [pack, session]);
  const savePrompt = getLoginPromptCopy("save_history");
  const highResPrompt = getLoginPromptCopy("high_res_export");

  async function handleExportAction(action: ExportAction) {
    if (action === "copy") {
      const copyResult = await copyTextToClipboard(bundle.publishCopy);
      const result = evaluateExportAction(action, session, pack);
      if (result.status === "ready") {
        setLocalExportMessage(
          copyResult.status === "copied"
            ? result.message
            : "发布文案已准备好，当前环境不支持自动写入剪贴板，可以手动复制。"
        );
      }
      return;
    }

    const result = evaluateExportAction(action, session, pack);

    if (result.status === "login_required") {
      setLocalExportMessage(result.prompt.body);
      onLogin();
      return;
    }

    setLocalExportMessage(result.message);
    if (action === "high_res") {
      await onSaveProject();
    }
  }

  return (
    <Screen eyebrow={`发布清单 / ${bundle.platformLabel}`} title="这套图可以发布了" subtitle={bundle.summary}>
      <CanvasPreview canvas={pack.canvases[0]} uploads={uploads} compact />

      <View style={styles.accountPanel}>
        <View style={styles.accountHeader}>
          <View style={styles.accountCopy}>
            <Text style={styles.panelTitle}>{session.kind === "guest" ? savePrompt.title : "已登录卖家工作台"}</Text>
            <Text style={styles.accountText}>
              {session.kind === "guest" ? savePrompt.body : "可以保存历史作品、复用这套风格，并记录后续高清导出。"}
            </Text>
          </View>
          <View style={styles.accountBadge}>
            <Text style={styles.accountBadgeText}>{session.kind === "guest" ? "游客" : "已登录"}</Text>
          </View>
        </View>
        <View style={styles.benefits}>
          {(session.kind === "guest" ? savePrompt.benefits : ["历史作品", "风格复用", "高清导出记录"]).map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
        <View style={styles.accountActions}>
          {session.kind === "guest" ? (
            <Button label={savePrompt.primaryAction} onPress={onLogin} style={styles.accountButton} />
          ) : (
            <Button label="保存到历史" onPress={() => void onSaveProject()} style={styles.accountButton} />
          )}
          <Button
            label={bundle.highResUnlocked ? "高清导出" : "登录高清"}
            variant="secondary"
            onPress={() => handleExportAction("high_res")}
            style={styles.accountButton}
          />
        </View>
        <Text style={styles.accountFootnote}>
          {saveMessage ??
            localExportMessage ??
            (session.kind === "guest" ? highResPrompt.body : "当前作品保存在本机内存，上线版会同步到云端作品库。")}
        </Text>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>导出内容</Text>
          <Text style={styles.panelMeta}>{bundle.standardUnlocked ? "标准可导出" : "需登录"}</Text>
        </View>
        {bundle.items.map((item) => (
          <View key={item.id} style={styles.exportItem}>
            <View style={styles.exportItemBody}>
              <Text style={styles.exportItemTitle}>{item.label}</Text>
              <Text style={styles.exportItemDetail}>{item.detail}</Text>
            </View>
            <View style={styles.exportItemMeta}>
              <Text style={styles.exportItemSize}>{item.sizeLabel}</Text>
              <Text style={styles.exportItemFormat}>{item.formatLabel}</Text>
            </View>
          </View>
        ))}
        <Button label="标准导出" onPress={() => handleExportAction("standard")} />
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>发布文案包</Text>
          <Text style={styles.panelMeta}>可复制</Text>
        </View>
        <Text style={styles.description}>{bundle.publishCopy}</Text>
        <Button label="复制文案" variant="secondary" onPress={() => void handleExportAction("copy")} />
      </View>

      <View style={styles.tags}>
        {pack.copy.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="继续编辑" variant="secondary" onPress={onBack} style={styles.actionButton} />
        <Button label="再做一套" onPress={onRestart} style={styles.actionButton} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    gap: spacing.sm
  },
  accountPanel: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    gap: spacing.md
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  accountCopy: {
    flex: 1,
    gap: spacing.sm
  },
  accountText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21
  },
  accountBadge: {
    borderRadius: 999,
    backgroundColor: palette.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  accountBadgeText: {
    color: palette.green,
    fontSize: 12,
    fontWeight: "900"
  },
  benefits: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  benefit: {
    borderRadius: 999,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  benefitText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  accountActions: {
    flexDirection: "row",
    gap: spacing.md
  },
  accountButton: {
    flex: 1
  },
  accountFootnote: {
    color: palette.green,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  panelTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  panelMeta: {
    color: palette.green,
    fontSize: 12,
    fontWeight: "900"
  },
  exportItem: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingTop: spacing.md,
    gap: spacing.md
  },
  exportItemBody: {
    flex: 1,
    gap: 4
  },
  exportItemTitle: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900"
  },
  exportItemDetail: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17
  },
  exportItemMeta: {
    minWidth: 78,
    alignItems: "flex-end",
    gap: 4
  },
  exportItemSize: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  exportItemFormat: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: "800"
  },
  description: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 23
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tag: {
    borderRadius: 999,
    backgroundColor: palette.greenSoft,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  tagText: {
    color: palette.green,
    fontSize: 13,
    fontWeight: "800"
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md
  },
  actionButton: {
    flex: 1
  }
});
