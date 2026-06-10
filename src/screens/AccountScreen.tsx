import { ScrollView, StyleSheet, Text, View } from "react-native";

import { type CapabilityItem, type CapabilitySnapshot } from "../shared/capabilityClient";
import { type UserSession } from "../shared/session";
import { Button } from "../ui/Buttons";
import { palette, spacing } from "../ui/theme";

type AccountScreenProps = {
  session: UserSession;
  capabilities: CapabilitySnapshot;
  onLogout: () => void;
};

const settings = ["店铺偏好", "常用发布平台", "品牌语气", "隐私与数据管理", "审核测试账号"];

export function AccountScreen({ session, capabilities, onLogout }: AccountScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.kicker}>我的</Text>
        <Text style={styles.title}>卖家账号</Text>
        <Text style={styles.subtitle}>管理额度、模板偏好、隐私和发布风格。</Text>
      </View>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>0x</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>发条鸟卖家</Text>
          <Text style={styles.profileMeta}>{session.id}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{session.remainingFreePacks}</Text>
          <Text style={styles.statLabel}>生成额度</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>Pro</Text>
          <Text style={styles.statLabel}>体验档</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>上线准备</Text>
        <Text style={styles.panelText}>真实登录、云端存储、高清导出和模型路由会放在服务端，移动端不保存 API Key。</Text>
      </View>

      <View style={styles.capabilityPanel}>
        <View style={styles.capabilityHeader}>
          <Text style={styles.panelTitle}>能力状态</Text>
          <Text style={styles.capabilityTime}>服务端</Text>
        </View>
        {capabilities.items.map((item) => (
          <View key={item.id} style={styles.capabilityRow}>
            <View style={styles.capabilityCopy}>
              <Text style={styles.capabilityLabel}>{item.label}</Text>
              <Text style={styles.capabilityDetail}>{item.detail}</Text>
            </View>
            <View style={[styles.statusPill, getStatusStyle(item)]}>
              <Text style={styles.statusText}>{getStatusLabel(item)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.list}>
        {settings.map((item) => (
          <View key={item} style={styles.row}>
            <Text style={styles.rowText}>{item}</Text>
            <Text style={styles.rowMeta}>查看</Text>
          </View>
        ))}
      </View>

      <Button label="退出登录" variant="secondary" onPress={onLogout} />
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
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: palette.ink,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "900"
  },
  profileCopy: {
    flex: 1,
    gap: 4
  },
  profileName: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  profileMeta: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17
  },
  stats: {
    flexDirection: "row",
    gap: spacing.md
  },
  stat: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: palette.surface,
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
    marginTop: 4,
    fontWeight: "800"
  },
  panel: {
    borderRadius: 8,
    backgroundColor: palette.greenSoft,
    borderWidth: 1,
    borderColor: "#C8DACD",
    padding: spacing.md,
    gap: spacing.xs
  },
  panelTitle: {
    color: palette.green,
    fontSize: 15,
    fontWeight: "900"
  },
  panelText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19
  },
  capabilityPanel: {
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden"
  },
  capabilityHeader: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.line
  },
  capabilityTime: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: "800"
  },
  capabilityRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.line
  },
  capabilityCopy: {
    flex: 1,
    gap: 4
  },
  capabilityLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  capabilityDetail: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17
  },
  statusPill: {
    minWidth: 58,
    minHeight: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  statusReady: {
    backgroundColor: palette.greenSoft
  },
  statusMock: {
    backgroundColor: palette.surfaceMuted
  },
  statusNeedsConfig: {
    backgroundColor: "#F7E4C5"
  },
  statusText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  list: {
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden"
  },
  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.line
  },
  rowText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  rowMeta: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: "800"
  }
});

function getStatusLabel(item: CapabilityItem) {
  if (item.status === "ready") {
    return "可用";
  }

  if (item.status === "configured") {
    return "已配置";
  }

  if (item.status === "needs_config") {
    return "待配置";
  }

  return "占位";
}

function getStatusStyle(item: CapabilityItem) {
  if (item.status === "ready" || item.status === "configured") {
    return styles.statusReady;
  }

  if (item.status === "needs_config") {
    return styles.statusNeedsConfig;
  }

  return styles.statusMock;
}
