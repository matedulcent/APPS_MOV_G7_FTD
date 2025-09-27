import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={placeholder || "Buscar..."}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 8,
        backgroundColor: "#fff",
    },
});
