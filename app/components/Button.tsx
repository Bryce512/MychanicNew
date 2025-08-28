"use client";

import type React from "react";
import {
  TouchableOpacity,
  Text,
  type ViewStyle,
  type TextStyle,
  ActivityIndicator,
} from "react-native";
import { buttonStyles } from "../theme/styles/Button.styles";
import { useTheme } from "./theme-provider";
import { colors } from "../theme/colors";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { isDark } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return isDark ? colors.gray[700] : colors.gray[200];

    switch (variant) {
      case "primary":
        return colors.primary[500];
      case "secondary":
        return isDark ? colors.gray[700] : colors.gray[200];
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return colors.primary[500];
    }
  };

  const getTextColor = () => {
    if (disabled) return isDark ? colors.gray[500] : colors.gray[400];

    switch (variant) {
      case "primary":
        return colors.white;
      case "secondary":
        return isDark ? colors.white : colors.gray[900];
      case "outline":
      case "ghost":
        return isDark ? colors.white : colors.primary[500];
      default:
        return colors.white;
    }
  };

  const getBorderColor = () => {
    if (disabled) return isDark ? colors.gray[700] : colors.gray[200];

    switch (variant) {
      case "outline":
        return isDark ? colors.gray[600] : colors.gray[300];
      default:
        return "transparent";
    }
  };

  const getPadding = () => {
    switch (size) {
      case "sm":
        return { paddingVertical: 6, paddingHorizontal: 12 };
      case "lg":
        return { paddingVertical: 12, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 10, paddingHorizontal: 16 };
    }
  };

  const buttonStylesArr = [
    buttonStyles.button,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      ...getPadding(),
    },
    variant === "outline" && buttonStyles.outline,
    fullWidth && buttonStyles.fullWidth,
    style,
  ];

  const textStylesArr = [
    buttonStyles.text,
    {
      color: getTextColor(),
      fontSize: size === "sm" ? 14 : size === "lg" ? 18 : 16,
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStylesArr}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStylesArr}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
