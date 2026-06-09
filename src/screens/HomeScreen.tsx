import { Pressable, StyleSheet, Text, View } from "react-native";

import { type Platform } from "../shared/productPipeline";
import { type UserSession } from "../shared/session";
import { getWorkspaceSummary, type HistoryItem } from "../shared/workspace";
import { Button } from "../ui/Buttons";
import { Screen } from "../ui/Screen";
import { palette, spacing } from "../ui/theme";

type HomeScreenProps = {
  session: UserSession;
  historyItems: HistoryItem[];
  onLogin: () => void;
  onOpenHistory: (projectId: string) => void;
  onStart: (platform: Platform) => void;
};

const scenarios: {
  label: string;
  detail: string;
  platform: Platform;
}[] = [
  { label: "闲鱼卖货", detail: "真实封面 + 成色说明", platform: "xianyu" },
  { label: "小红书种草", detail: "封面标题 + 话题文案", platform: "xiaohongshu" },
  { label: "商品主图", detail: "干净背景 + 主体突出", platform: "shop_main" },
  { label: "朋友圈小店", detail: "长图/九宫格发布包", platform: "wechat" }
];

export function HomeScreen({ session, historyItems, onLogin, onOpenHistory, onStart }: HomeScreenProps) {
  const workspace = getWorkspaceSummary({ session, historyItems });

  return (
    <Screen
      eyebrow="甜拼商图 AI"
      title="今天要发布什么？"
      subtitle="上传几张随手拍，生成封面、详情拼图和能直接复制的平台文案。"
    >
      <View style={styles.promptBox}>
        <Text style={styles.promptText}>帮我把这副耳机做成闲鱼封面，真实一点，突出 95 新</Text>
        <Text style={styles.promptMeta}>自然语言会转成商品诊断、画布图层和发布文案</Text>
      </View>

      <View style={styles.sessionStrip}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionCopy}>
            <Text style={styles.sessionTitle}>{workspace.heading}</Text>
            <Text style={styles.sessionMeta}>
              {session.kind === "guest" ? workspace.loginHint : `已登录 demo 账号，${workspace.recentCountLabel}。`}
            </Text>
          </View>
          {session.kind === "guest" ? <Button label="登录/注册" variant="secondary" onPress={onLogin} /> : null}
        </View>
      </View>

      <View style={styles.grid}>
        {scenarios.map((scenario) => (
          <Pressable key={scenario.label} onPress={() => onStart(scenario.platform)} style={styles.scenario}>
            <Text style={styles.scenarioLabel}>{scenario.label}</Text>
            <Text style={styles.scenarioDetail}>{scenario.detail}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.recent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最近作品</Text>
          <Text style={styles.sectionMeta}>{workspace.recentCountLabel}</Text>
        </View>
        {historyItems.length > 0 ? (
          <View style={styles.historyList}>
            {historyItems.slice(0, 3).map((item) => (
              <Pressable key={item.id} onPress={() => onOpenHistory(item.id)} style={styles.historyItem}>
                <View style={styles.historyThumb}>
                  <Text style={styles.historyPlatform}>{item.platformLabel}</Text>
                </View>
                <View style={styles.historyBody}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyMeta}>
                    {item.styleLabel} · {item.assetSummary}
                  </Text>
                  <Text style={styles.historyTime}>{item.updatedAtLabel} · 继续编辑</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.recentRow}>
            <View style={[styles.thumb, styles.thumbOne]} />
            <View style={[styles.thumb, styles.thumbTwo]} />
            <View style={[styles.thumb, styles.thumbThree]} />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  promptBox: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 8,
    padding: spacing.lg,
    gap: spacing.sm
  },
  promptText: {
    color: palette.ink,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800"
  },
  promptMeta: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  sessionStrip: {
    backgroundColor: palette.greenSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBDCCA",
    padding: spacing.md,
    gap: 4
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  sessionCopy: {
    flex: 1,
    gap: 4
  },
  sessionTitle: {
    color: palette.green,
    fontSize: 15,
    fontWeight: "900"
  },
  sessionMeta: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18
  },
  scenario: {
    width: "47%",
    minHeight: 108,
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  scenarioLabel: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  scenarioDetail: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18
  },
  recent: {
    gap: spacing.md
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  sectionMeta: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: "800"
  },
  recentRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  thumb: {
    flex: 1,
    height: 110,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line
  },
  thumbOne: {
    backgroundColor: "#E9DED3"
  },
  thumbTwo: {
    backgroundColor: "#DDE7DE"
  },
  thumbThree: {
    backgroundColor: "#E8D9D3"
  },
  historyList: {
    gap: spacing.md
  },
  historyItem: {
    minHeight: 104,
    flexDirection: "row",
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden"
  },
  historyThumb: {
    width: 92,
    backgroundColor: palette.coralSoft,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm
  },
  historyPlatform: {
    color: palette.coral,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  historyBody: {
    flex: 1,
    padding: spacing.md,
    gap: 5,
    justifyContent: "center"
  },
  historyTitle: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900"
  },
  historyMeta: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17
  },
  historyTime: {
    color: palette.green,
    fontSize: 12,
    fontWeight: "800"
  }
});
