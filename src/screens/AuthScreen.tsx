import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "../ui/Buttons";
import { palette, spacing } from "../ui/theme";

type AuthScreenProps = {
  onComplete: () => void;
};

export function AuthScreen({ onComplete }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.brand}>0x 发条鸟</Text>
        <Text style={styles.title}>{mode === "login" ? "登录卖家工作台" : "创建卖家账号"}</Text>
        <Text style={styles.subtitle}>保存作品、复用模板、记录风格偏好，跨设备找回你的卖货资产。</Text>
      </View>

      <View style={styles.previewPanel}>
        <View style={styles.previewPhoto} />
        <View style={styles.previewCopy}>
          <Text style={styles.previewTitle}>今天生成 3 套发布图</Text>
          <Text style={styles.previewText}>封面、详情拼图、瑕疵说明和平台文案会保存在账号里。</Text>
        </View>
      </View>

      <View style={styles.form}>
        <TextInput
          keyboardType="phone-pad"
          placeholder="手机号"
          placeholderTextColor={palette.faint}
          style={styles.input}
        />
        <View style={styles.codeRow}>
          <TextInput
            keyboardType="number-pad"
            placeholder="验证码"
            placeholderTextColor={palette.faint}
            style={[styles.input, styles.codeInput]}
          />
          <Button label="获取验证码" variant="secondary" onPress={() => undefined} style={styles.codeButton} />
        </View>
        <Button label={mode === "login" ? "登录" : "注册并进入"} onPress={onComplete} />
      </View>

      <View style={styles.oauth}>
        <Button label="微信登录" variant="secondary" onPress={onComplete} />
        <Button label="Apple 登录" variant="secondary" onPress={onComplete} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setMode((current) => (current === "login" ? "register" : "login"))}
        style={styles.switcher}
      >
        <Text style={styles.switcherText}>{mode === "login" ? "还没有账号？注册" : "已有账号？登录"}</Text>
      </Pressable>

      <Text style={styles.privacy}>只处理你主动选择的照片，不自动发布，不在移动端保存模型 API Key。</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: 42,
    justifyContent: "center",
    gap: spacing.lg,
    backgroundColor: palette.paper
  },
  header: {
    gap: spacing.sm
  },
  brand: {
    color: palette.green,
    fontSize: 14,
    fontWeight: "900"
  },
  title: {
    color: palette.ink,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900"
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22
  },
  previewPanel: {
    minHeight: 156,
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  previewPhoto: {
    width: 112,
    height: 126,
    borderRadius: 8,
    backgroundColor: palette.greenSoft,
    borderWidth: 1,
    borderColor: "#C8DACD"
  },
  previewCopy: {
    flex: 1,
    gap: spacing.sm
  },
  previewTitle: {
    color: palette.ink,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900"
  },
  previewText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19
  },
  form: {
    gap: spacing.md
  },
  input: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
    color: palette.ink,
    fontSize: 15,
    fontWeight: "700"
  },
  codeRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  codeInput: {
    flex: 1
  },
  codeButton: {
    minWidth: 112
  },
  oauth: {
    gap: spacing.md
  },
  switcher: {
    alignItems: "center"
  },
  switcherText: {
    color: palette.green,
    fontSize: 14,
    fontWeight: "900"
  },
  privacy: {
    color: palette.faint,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center"
  }
});
