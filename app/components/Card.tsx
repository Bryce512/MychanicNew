"use client";

import type React from "react";
import { View, type ViewStyle } from "react-native";
import { cardStyles } from "../theme/styles/Card.styles";
import { useTheme } from "./theme-provider";
import { colors } from "../theme/colors";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function Card({ children, style }: CardProps) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        cardStyles.card,
        {
          backgroundColor: isDark ? colors.gray[800] : colors.white,
          borderColor: isDark ? colors.gray[700] : colors.gray[200],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, style }: CardProps) {
  return <View style={[cardStyles.cardHeader, style]}>{children}</View>;
}

export function CardContent({ children, style }: CardProps) {
  return <View style={[cardStyles.cardContent, style]}>{children}</View>;
}

export function CardFooter({ children, style }: CardProps) {
  return <View style={[cardStyles.cardFooter, style]}>{children}</View>;
}
