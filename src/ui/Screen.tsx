import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { palette, spacing } from "./theme";

type ScreenProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function Screen({ eyebrow, title, subtitle, children }: ScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: 48,
    gap: spacing.lg
  },
  header: {
    gap: spacing.sm
  },
  eyebrow: {
    color: palette.green,
    fontSize: 13,
    fontWeight: "800"
  },
  title: {
    color: palette.ink,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22
  }
});

