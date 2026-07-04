import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { BORDER, INK, PINK } from "../constants/brand";

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
                            color={PINK}
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
                    color={PINK}
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
        borderWidth: 1.5,
        borderRadius: 14, // ✅ redondea todas las esquinas
        borderColor: BORDER,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        overflow: "hidden", // ✅ asegura que las opciones sigan el borde redondeado
    },
    containerOpen: { borderColor: PINK },
    header: {
        padding: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fafafa",
    },
    label: { fontWeight: "700", fontSize: 16, color: INK },
    dropdownList: {
        borderTopWidth: 1,
        borderColor: BORDER,
    },
    option: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: BORDER,
    },
    optionSelected: { backgroundColor: "#fff0f6" },
    optionText: { fontSize: 15, color: INK },
    optionTextSelected: { fontWeight: "700", color: PINK },
});
