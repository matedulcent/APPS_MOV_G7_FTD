// app/components/ScreenHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

interface ScreenHeaderProps {
    title: string;
    showSearch?: boolean;
    onToggleSearch?: () => void;
}

export default function ScreenHeader({
    title,
    showSearch = false,
    onToggleSearch,
}: ScreenHeaderProps) {
    const router = useRouter();

    return (
        <LinearGradient
            colors={["#ffffff", "#f9f9f9"]}
            style={styles.headerContainer}
        >
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={styles.iconButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </Pressable>

                <Text style={styles.title}>{title}</Text>

                {onToggleSearch ? (
                    <Pressable onPress={onToggleSearch} style={styles.iconButton}>
                        <Ionicons name="search" size={24} color="#333" />
                    </Pressable>
                ) : (
                    <View style={styles.iconButton} />
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        width: "100%",
        borderTopLeftRadius: 16,   // 🔹 redondea arriba izquierda
        borderTopRightRadius: 16,  // 🔹 redondea arriba derecha
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        elevation: 4, // sombra en Android
        shadowColor: "#000", // sombra en iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: "hidden", // 🔹 asegura que el gradiente respete los bordes redondeados
        marginBottom: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
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
        color: "#222",
    },
});
