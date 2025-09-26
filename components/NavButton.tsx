import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

type NavButtonProps = {
    text: string;
    onPress?: () => void;
    style?: ViewStyle | ViewStyle[];
    color?: string;
};

export default function NavButton({ text, onPress, style, color = "#6200ee" }: NavButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={[styles.button, { backgroundColor: color }, style]}
        >
            <Text style={styles.text}>{text}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 120,
        marginVertical: 6,
    },
    text: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});
