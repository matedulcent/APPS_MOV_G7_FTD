import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import ScreenHeader from "../../components/ScreenHeader";

type Producto = {
    id: string;
    nombre: string;
    cantidad: number;
    cliente: string;
};

export default function RecibirProductosScreen() {
    const [searchText, setSearchText] = useState("");
    const [searchVisible, setSearchVisible] = useState(false);

    // Órdenes de ejemplo
    const [ordenes, setOrdenes] = useState<Producto[]>([
        { id: "1", nombre: "Frutilla", cantidad: 2, cliente: "Juan Pérez" },
        { id: "2", nombre: "Chocolate", cantidad: 1, cliente: "María López" },
        { id: "3", nombre: "Banana", cantidad: 3, cliente: "Carlos García" },
    ]);

    const ordenesFiltradas = ordenes.filter((o) =>
        o.nombre.toLowerCase().includes(searchText.toLowerCase())
    );

    const recibirProducto = (id: string) => {
        Alert.alert("Recibido", "Producto marcado como recibido");
        // opcional: eliminar de la lista de ejemplo
        setOrdenes((prev) => prev.filter((o) => o.id !== id));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerWrapper}>
                <ScreenHeader
                    title="Recibir Productos"
                    showSearch
                    onToggleSearch={() => setSearchVisible((prev) => !prev)}
                />
                {searchVisible && (
                    <TextInput
                        placeholder="Buscar producto..."
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                )}
            </View>

            {/* Lista de órdenes */}
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {ordenesFiltradas.length === 0 && (
                    <Text style={styles.emptyText}>No hay productos por recibir</Text>
                )}
                {ordenesFiltradas.map((orden) => (
                    <View key={orden.id} style={styles.card}>
                        <Text style={styles.productText}>
                            {orden.nombre} x {orden.cantidad}
                        </Text>
                        <Text style={styles.clienteText}>Cliente: {orden.cliente}</Text>
                        <Pressable
                            style={styles.recibirButton}
                            onPress={() => recibirProducto(orden.id)}
                        >
                            <Text style={styles.recibirText}>Recibir</Text>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f7f7" },
    headerWrapper: { marginTop: 20, marginHorizontal: 20 },
    searchInput: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: "#fff",
    },
    card: {
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    productText: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
    clienteText: { fontSize: 14, marginBottom: 8 },
    recibirButton: { backgroundColor: "#4cd7c7", paddingVertical: 10, borderRadius: 8, alignItems: "center" },
    recibirText: { color: "#000", fontWeight: "bold" },
    emptyText: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#999" },
});
