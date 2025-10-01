import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
    label: string;
    productos: string[];
    nuevoProducto: string;
    onChangeNuevoProducto: (text: string) => void;
    onAgregar: () => void;
    onRemover: (producto: string) => void;
};

export default function CategoriaProducto({
    label,
    productos,
    nuevoProducto,
    onChangeNuevoProducto,
    onAgregar,
    onRemover,
}: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            {productos.map((prod) => (
                <View key={prod} style={styles.productRow}>
                    <Text style={styles.productText}>{prod}</Text>
                    <Pressable
                        style={styles.removeButton}
                        onPress={() => onRemover(prod)}
                    >
                        <Text style={styles.removeText}>X</Text>
                    </Pressable>
                </View>
            ))}

            <View style={styles.addRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Nuevo producto"
                    value={nuevoProducto}
                    onChangeText={onChangeNuevoProducto}
                />
                <Pressable style={styles.addButton} onPress={onAgregar}>
                    <Text style={styles.addText}>Agregar</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 12,
        // Sombra iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Elevation Android
        elevation: 3,
    },
    label: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
    productRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    productText: { fontSize: 16 },
    removeButton: {
        backgroundColor: "#ff6b6b",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    removeText: { color: "#fff", fontWeight: "bold" },
    addRow: { flexDirection: "row", marginTop: 8, gap: 8 },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: "#fff",
    },
    addButton: {
        backgroundColor: "#4cd7c7",
        paddingHorizontal: 12,
        justifyContent: "center",
        borderRadius: 8,
    },
    addText: { fontWeight: "bold", color: "#000" },
});

