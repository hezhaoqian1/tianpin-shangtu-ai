import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette, spacing } from "./theme";

export type MainTab = "dashboard" | "templates" | "create" | "works" | "account";

type AppShellProps = {
  activeTab: MainTab;
  children: ReactNode;
  onSelectTab: (tab: MainTab) => void;
};

const tabs: {
  key: MainTab;
  label: string;
  mark: string;
}[] = [
  { key: "dashboard", label: "工作台", mark: "台" },
  { key: "templates", label: "模板", mark: "模" },
  { key: "create", label: "创建", mark: "+" },
  { key: "works", label: "作品", mark: "作" },
  { key: "account", label: "我的", mark: "我" }
];

export function AppShell({ activeTab, children, onSelectTab }: AppShellProps) {
  return (
    <View style={styles.shell}>
      <View style={styles.content}>{children}</View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          const create = tab.key === "create";

          return (
            <Pressable
              accessibilityRole="button"
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              style={[styles.tab, create ? styles.createTab : null]}
            >
              <View style={[styles.tabMark, active ? styles.activeMark : null, create ? styles.createMark : null]}>
                <Text style={[styles.markText, active || create ? styles.activeMarkText : null]}>{tab.mark}</Text>
              </View>
              <Text style={[styles.tabLabel, active ? styles.activeLabel : null]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: palette.paper
  },
  content: {
    flex: 1
  },
  tabBar: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: palette.line,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4
  },
  createTab: {
    marginTop: -22
  },
  tabMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  activeMark: {
    backgroundColor: palette.greenSoft
  },
  createMark: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.ink
  },
  markText: {
    color: palette.muted,
    fontSize: 19,
    fontWeight: "900"
  },
  activeMarkText: {
    color: palette.white
  },
  tabLabel: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: "800"
  },
  activeLabel: {
    color: palette.ink
  }
});
