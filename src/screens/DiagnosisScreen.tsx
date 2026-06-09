import { StyleSheet, Text, View } from "react-native";

import { getAnalysisStatus } from "../shared/aiStatus";
import { type AppAnalysisSource } from "../shared/analysisClient";
import { type ProductAnalysis, type UploadedAsset } from "../shared/productPipeline";
import { Button } from "../ui/Buttons";
import { Screen } from "../ui/Screen";
import { palette, spacing } from "../ui/theme";

type DiagnosisScreenProps = {
  analysis: ProductAnalysis;
  analysisSource: AppAnalysisSource;
  analysisFallbackReason?: string;
  endpointConfigured: boolean;
  uploads: UploadedAsset[];
  onBack: () => void;
  onContinue: () => void;
};

export function DiagnosisScreen({
  analysis,
  analysisSource,
  analysisFallbackReason,
  endpointConfigured,
  uploads,
  onBack,
  onContinue
}: DiagnosisScreenProps) {
  const aiStatus = getAnalysisStatus({
    source: analysisSource,
    endpointConfigured,
    fallbackReason: analysisFallbackReason
  });

  return (
    <Screen
      eyebrow="商品诊断"
      title={analysis.productName}
      subtitle="AI 先做质检报告，再生成发布资产包。默认保留真实成色和可见瑕疵。"
    >
      <View style={styles.statRow}>
        <Stat label="素材" value={`${uploads.length} 张`} />
        <Stat label="成色" value={analysis.condition.label} />
        <Stat label={analysisSource === "remote" ? "远端 AI" : "快速模式"} value={`${Math.round(analysis.condition.confidence * 100)}%`} />
      </View>

      <View style={styles.aiStatusPanel}>
        <View style={styles.aiStatusHeader}>
          <Text style={styles.aiStatusTitle}>{aiStatus.title}</Text>
          <View style={styles.aiStatusBadge}>
            <Text style={styles.aiStatusBadgeText}>{aiStatus.label}</Text>
          </View>
        </View>
        <Text style={styles.aiStatusDetail}>{aiStatus.detail}</Text>
        <Text style={styles.aiStatusSecurity}>{aiStatus.securityNote}</Text>
      </View>

      <Panel title="建议突出">
        {analysis.sellingPoints.map((point) => (
          <Text key={point} style={styles.bullet}>• {point}</Text>
        ))}
      </Panel>

      <Panel title="建议补拍">
        {analysis.missingShots.map((shot) => (
          <Text key={shot} style={styles.bullet}>• {shot}</Text>
        ))}
      </Panel>

      <Panel title="真实模式提醒" tone="coral">
        {analysis.truthfulnessWarnings.map((warning) => (
          <Text key={warning} style={styles.bullet}>• {warning}</Text>
        ))}
      </Panel>

      <View style={styles.actions}>
        <Button label="返回" variant="secondary" onPress={onBack} style={styles.actionButton} />
        <Button label="生成方案" onPress={onContinue} style={styles.actionButton} />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Panel({ title, tone, children }: { title: string; tone?: "coral"; children: React.ReactNode }) {
  return (
    <View style={[styles.panel, tone === "coral" ? styles.coralPanel : null]}>
      <Text style={styles.panelTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  stat: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md
  },
  statValue: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  statLabel: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 4
  },
  panel: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    gap: spacing.sm
  },
  aiStatusPanel: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    gap: spacing.sm
  },
  aiStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  aiStatusTitle: {
    flex: 1,
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  aiStatusBadge: {
    borderRadius: 999,
    backgroundColor: palette.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  aiStatusBadgeText: {
    color: palette.green,
    fontSize: 12,
    fontWeight: "900"
  },
  aiStatusDetail: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20
  },
  aiStatusSecurity: {
    color: palette.green,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  },
  coralPanel: {
    backgroundColor: palette.coralSoft,
    borderColor: "#E5C8BE"
  },
  panelTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  bullet: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md
  },
  actionButton: {
    flex: 1
  }
});
