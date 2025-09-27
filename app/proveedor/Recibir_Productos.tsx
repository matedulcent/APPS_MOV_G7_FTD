import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import ScreenHeader from "../../components/ScreenHeader";

// Diccionario ejemplo: envase -> lista de sabores
type PedidoCompleto = {
    [envase: string]: string[];
};

export default function RecibirProductosScreen() {
    const [searchText, setSearchText] = useState("");
    const [searchVisible, setSearchVisible] = useState(false);

    // Pedidos de ejemplo
    const [pedidos, setPedidos] = useState<PedidoCompleto>({
        "Cucuruchos 1 (1 bola)": ["Ron con pasas"],
        "Kilos 1 (1/4 Kg)": ["Choco blanco", "Chocolate con almendras"],
    });

    // Filtrado de envases por buscador
    const pedidosFiltrados = Object.entries(pedidos).filter(([envase]) =>
        envase.toLowerCase().includes(searchText.toLowerCase())
    );

    const recibirPedido = (envase: string) => {
        Alert.alert("Recibido", `${envase} marcado como recibido`);
        setPedidos((prev) => {
            const copy = { ...prev };
            delete copy[envase];
            return copy;
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerWrapper}>
                <ScreenHeader
                    title="Recibir Pedidos"
                    showSearch
                    onToggleSearch={() => setSearchVisible((prev) => !prev)}
                />
                {searchVisible && (
                    <TextInput
                        placeholder="Buscar envase..."
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                )}
            </View>

            {/* Lista de pedidos */}
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {pedidosFiltrados.length === 0 && (
                    <Text style={styles.emptyText}>No hay pedidos por recibir</Text>
                )}

                {pedidosFiltrados.map(([envase, sabores]) => (
                    <View key={envase} style={styles.card}>
                        <Text style={styles.envaseText}>{envase}</Text>
                        {sabores.map((sabor, idx) => (
                            <Text key={idx} style={styles.saborText}>
                                • {sabor}
                            </Text>
                        ))}
                        <Pressable
                            style={styles.recibirButton}
                            onPress={() => recibirPedido(envase)}
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
    envaseText: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
    saborText: { fontSize: 14, marginLeft: 12, marginBottom: 2 },
    recibirButton: { backgroundColor: "#4cd7c7", paddingVertical: 10, borderRadius: 8, alignItems: "center", marginTop: 8 },
    recibirText: { color: "#000", fontWeight: "bold" },
    emptyText: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#999" },
});
