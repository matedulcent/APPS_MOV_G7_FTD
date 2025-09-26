import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

interface DropdownProps {
    label: string;
    options: string[];
    onSelect: (value: string) => void;
}

export default function Dropdown({ label, options, onSelect }: DropdownProps) {
    const [open, setOpen] = useState(false);

    return (
        <View style={styles.container}>
            <Pressable style={styles.header} onPress={() => setOpen(!open)}>
                <Text style={styles.label}>{label}</Text>
            </Pressable>

            {open && (
                <FlatList
                    data={options}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.option}
                            onPress={() => {
                                onSelect(item);
                                setOpen(false);
                            }}
                        >
                            <Text>{item}</Text>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: 10, borderWidth: 1, borderRadius: 8 },
    header: { padding: 12, backgroundColor: "#f2f2f2" },
    label: { fontWeight: "bold" },
    option: { padding: 12, borderTopWidth: 1, borderColor: "#ddd" },
});
