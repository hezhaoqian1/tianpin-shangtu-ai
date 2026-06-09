import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { palette, spacing } from "../ui/theme";

type LaunchScreenProps = {
  onDone: () => void;
};

export function LaunchScreen({ onDone }: LaunchScreenProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const cards = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(spin, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false
        }),
        Animated.timing(cards, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false
        })
      ]),
      Animated.timing(fade, {
        toValue: 1,
        duration: 360,
        useNativeDriver: false
      })
    ]).start();

    const timer = setTimeout(onDone, 2050);
    return () => clearTimeout(timer);
  }, [cards, fade, onDone, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  });

  return (
    <Pressable accessibilityRole="button" onPress={onDone} style={styles.screen}>
      <View style={styles.logoStage}>
        <Animated.View style={[styles.spring, { transform: [{ rotate }] }]}>
          <Text style={styles.springText}>0x</Text>
        </Animated.View>
        <View style={styles.birdBody}>
          <View style={styles.birdWing} />
          <View style={styles.birdEye} />
        </View>
      </View>
      <View style={styles.cardRow}>
        {["封面", "详情", "文案"].map((label, index) => (
          <Animated.View
            key={label}
            style={[
              styles.assetCard,
              {
                opacity: cards,
                transform: [
                  {
                    translateY: cards.interpolate({
                      inputRange: [0, 1],
                      outputRange: [22 + index * 6, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.assetLabel}>{label}</Text>
          </Animated.View>
        ))}
      </View>
      <Animated.View style={[styles.copy, { opacity: fade }]}>
        <Text style={styles.brand}>0x 发条鸟</Text>
        <Text style={styles.title}>AI 卖货图助手</Text>
        <Text style={styles.subtitle}>拍几张图，AI 做成能发布的卖货图。</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.paper,
    padding: spacing.xl,
    gap: spacing.xl
  },
  logoStage: {
    width: 168,
    height: 132,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  spring: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: palette.green,
    alignItems: "center",
    justifyContent: "center"
  },
  springText: {
    color: palette.green,
    fontSize: 18,
    fontWeight: "900"
  },
  birdBody: {
    width: 112,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.ink,
    transform: [{ rotate: "-6deg" }],
    position: "relative"
  },
  birdWing: {
    position: "absolute",
    left: 28,
    top: 22,
    width: 44,
    height: 24,
    borderRadius: 14,
    backgroundColor: "#444640"
  },
  birdEye: {
    position: "absolute",
    right: 24,
    top: 18,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: palette.surface
  },
  cardRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  assetCard: {
    width: 76,
    height: 96,
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: "center",
    justifyContent: "flex-end",
    padding: spacing.sm
  },
  assetLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  copy: {
    alignItems: "center",
    gap: spacing.xs
  },
  brand: {
    color: palette.green,
    fontSize: 16,
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
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center"
  }
});
