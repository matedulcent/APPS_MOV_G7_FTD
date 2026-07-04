import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from "react-native";
import { PINK } from "../constants/brand";

const isWeb = Platform.OS === "web";

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: "solid" | "outline" | "ghost";
  color?: string;
  disabled?: boolean;
  loading?: boolean;
};

/** Botón de acción compartido por toda la app: mismo estilo que usa index.tsx. */
export default function ActionButton({
  label,
  onPress,
  icon,
  variant = "solid",
  color = PINK,
  disabled = false,
  loading = false,
}: Props) {
  const isSolid = variant === "solid";
  const isOutline = variant === "outline";
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isSolid && { backgroundColor: color },
        isOutline && { backgroundColor: "transparent", borderWidth: 1.5, borderColor: color },
        variant === "ghost" && { backgroundColor: "transparent" },
        (pressed || isDisabled) && { opacity: 0.7 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSolid ? "#fff" : color} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={19}
              color={isSolid ? "#fff" : color}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              styles.buttonText,
              { color: isSolid ? "#fff" : color },
              variant === "ghost" && { fontWeight: "600" },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isWeb ? 13 : 14,
    borderRadius: 14,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 15.5,
  },
});
