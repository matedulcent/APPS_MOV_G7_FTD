import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
    label: string;
    productos: string[];
    nuevoProducto: string;
    onChangeNuevoProducto: (text: string) => void;
    onAgregar: () => void;
    onRemover: (index: number) => void;
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
        <View style={styles.categoria}>
            <Text style={styles.categoriaLabel}>{label}</Text>

            {productos.map((prod, index) => (
                <View key={prod} style={styles.producto}>
                    <Text>{prod}</Text>
                    <Pressable style={styles.removerBtn} onPress={() => onRemover(index)}>
                        <Text style={{ color: "white" }}>X</Text>
                    </Pressable>
                </View>
            ))}

            <View style={styles.nuevoProductoContainer}>
                <TextInput
                    placeholder="Nuevo producto..."
                    value={nuevoProducto}
                    onChangeText={onChangeNuevoProducto}
                    style={styles.input}
                />
                <Pressable style={styles.agregarBtn} onPress={onAgregar}>
                    <Text style={{ color: "white" }}>Agregar</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    categoria: {
        marginHorizontal: 16,
        marginBottom: 24,
        padding: 12,
        backgroundColor: "#ffd8d8",
        borderRadius: 12,
    },
    categoriaLabel: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
    producto: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        padding: 6,
        backgroundColor: "#fff",
        borderRadius: 8,
    },
    removerBtn: {
        backgroundColor: "#e91e63",
        paddingHorizontal: 8,
        borderRadius: 6,
        justifyContent: "center",
    },
    nuevoProductoContainer: { flexDirection: "row", marginTop: 8 },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    agregarBtn: {
        backgroundColor: "#4cd7c7",
        marginLeft: 8,
        paddingHorizontal: 12,
        justifyContent: "center",
        borderRadius: 8,
    },
});
