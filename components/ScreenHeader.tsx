// app/components/ScreenHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ScreenHeaderProps {
    title: string;
    showSearch?: boolean;
    onToggleSearch?: () => void;
}

export default function ScreenHeader({ title, showSearch = false, onToggleSearch }: ScreenHeaderProps) {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>

            <Text style={styles.title}>{title}</Text>

            {onToggleSearch ? (
                <Pressable onPress={onToggleSearch} style={styles.iconButton}>
                    <Ionicons name="search" size={24} color="black" />
                </Pressable>
            ) : (
                <View style={styles.iconButton} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    iconButton: {
        padding: 8,
        width: 40,
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
});
