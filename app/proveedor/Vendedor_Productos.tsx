// app/screens/VendedorProductos.tsx
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import ScreenHeader from "../../components/ScreenHeader";

type Categoria = {
    label: string;
    options: string[];
};

export default function VendedorProductosScreen() {
    const [categorias, setCategorias] = useState<Categoria[]>([
        { label: "Frutales", options: ["Frutilla", "Banana", "Frambuesa"] },
        { label: "Chocolates", options: ["Chocolate", "Choco blanco"] },
        { label: "Cremas y Dulces", options: ["Dulce de leche"] },
    ]);

    const [nuevoProducto, setNuevoProducto] = useState("");

    const agregarProducto = (catIndex: number) => {
        if (!nuevoProducto.trim()) return;
        setCategorias((prev) => {
            const newCats = [...prev];
            newCats[catIndex].options.push(nuevoProducto.trim());
            return newCats;
        });
        setNuevoProducto("");
    };

    const removerProducto = (catIndex: number, prodIndex: number) => {
        setCategorias((prev) => {
            const newCats = [...prev];
            newCats[catIndex].options.splice(prodIndex, 1);
            return newCats;
        });
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Gestión de Productos" showSearch={false} />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
                {categorias.map((cat, catIndex) => (
                    <View key={cat.label} style={styles.categoria}>
                        <Text style={styles.categoriaLabel}>{cat.label}</Text>
                        {cat.options.map((prod, prodIndex) => (
                            <View key={prod} style={styles.producto}>
                                <Text>{prod}</Text>
                                <Pressable
                                    style={styles.removerBtn}
                                    onPress={() => removerProducto(catIndex, prodIndex)}
                                >
                                    <Text style={{ color: "white" }}>X</Text>
                                </Pressable>
                            </View>
                        ))}
                        <View style={styles.nuevoProductoContainer}>
                            <TextInput
                                placeholder="Nuevo producto..."
                                value={nuevoProducto}
                                onChangeText={setNuevoProducto}
                                style={styles.input}
                            />
                            <Pressable
                                style={styles.agregarBtn}
                                onPress={() => agregarProducto(catIndex)}
                            >
                                <Text style={{ color: "white" }}>Agregar</Text>
                            </Pressable>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    categoria: { marginBottom: 24, padding: 12, backgroundColor: "#ffd8d8", borderRadius: 12 },
    categoriaLabel: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
    producto: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6, padding: 6, backgroundColor: "#fff", borderRadius: 8 },
    removerBtn: { backgroundColor: "#e91e63", paddingHorizontal: 8, borderRadius: 6 },
    nuevoProductoContainer: { flexDirection: "row", marginTop: 8 },
    input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 8 },
    agregarBtn: { backgroundColor: "#4cd7c7", marginLeft: 8, paddingHorizontal: 12, justifyContent: "center", borderRadius: 8 },
});
