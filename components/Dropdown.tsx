import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

interface DropdownProps {
    label: string;
    options: string[];
    selected: string[];
    onSelect: (value: string) => void;
    icon?: keyof typeof MaterialIcons.glyphMap; // ✅ clave del glyphMap
}

export default function Dropdown({
    label,
    options,
    selected,
    onSelect,
    icon,
}: DropdownProps) {
    const [open, setOpen] = useState(false);

    return (
        <View style={[styles.container, open && styles.containerOpen]}>
            {/* Header */}
            <Pressable style={styles.header} onPress={() => setOpen(!open)}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {icon && (
                        <MaterialIcons
                            name={icon}
                            size={20}
                            color="#333"
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Text style={styles.label}>
                        {label} {selected.length ? `(${selected.length})` : ""}
                    </Text>
                </View>
                <MaterialIcons
                    name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={24}
                    color="#333"
                />
            </Pressable>

            {/* Lista */}
            {open && (
                <FlatList
                    data={options}
                    keyExtractor={(item) => item}
                    style={styles.dropdownList}
                    scrollEnabled={false} // 👈 evita conflicto con ScrollView padre
                    renderItem={({ item }) => {
                        const isSelected = selected.includes(item);
                        return (
                            <Pressable
                                style={[styles.option, isSelected && styles.optionSelected]}
                                onPress={() => onSelect(item)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        isSelected && styles.optionTextSelected,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </Pressable>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        borderWidth: 2,
        borderRadius: 12, // ✅ redondea todas las esquinas
        borderColor: "#ccc",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: "hidden", // ✅ asegura que las opciones sigan el borde redondeado
    },
    containerOpen: { borderColor: "#6200ee" },
    header: {
        padding: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
    },
    label: { fontWeight: "bold", fontSize: 16 },
    dropdownList: {
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    option: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    optionSelected: { backgroundColor: "#e8f5e9" },
    optionText: { fontSize: 15 },
    optionTextSelected: { fontWeight: "bold", color: "#388e3c" },
});
