import React, { useState } from "react";
import {
    Alert,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import ScreenHeader from "../../components/ScreenHeader";

type Pedido = {
    numero: number;
    envases: {
        nombre: string;
        sabores: string[];
    }[];
};

export default function RecibirProductosScreen() {
    const [searchText, setSearchText] = useState("");
    const [searchVisible, setSearchVisible] = useState(false);

    const [pedidos, setPedidos] = useState<Pedido[]>([
        {
            numero: 1,
            envases: [
                { nombre: "Cucuruchos 1 (1 bola)", sabores: ["Ron con pasas"] },
                { nombre: "Kilos 1 (1/4 Kg)", sabores: ["Choco blanco", "Chocolate con almendras"] },
            ],
        },
        {
            numero: 2,
            envases: [
                { nombre: "Cucuruchos 2 (2 bolas)", sabores: ["Frutilla", "Banana"] },
            ],
        },
    ]);

    const recibirPedido = (numero: number) => {
        Alert.alert("Recibido", `Pedido #${numero} marcado como recibido`);
        setPedidos((prev) => prev.filter((p) => p.numero !== numero));
    };

    const pedidosFiltrados = pedidos.filter((pedido) =>
        pedido.envases.some((env) => env.nombre.toLowerCase().includes(searchText.toLowerCase()))
    );

    return (
        <ImageBackground
            source={require("../../assets/images/backgrounds/fondo4.jpg")}
            style={styles.container}
        >
            <View style={styles.overlay}>
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

                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    {pedidosFiltrados.length === 0 && (
                        <Text style={styles.emptyText}>No hay pedidos por recibir</Text>
                    )}

                    {pedidosFiltrados.map((pedido) => (
                        <View key={pedido.numero} style={styles.card}>
                            <Text style={styles.orderNumber}>Pedido #{pedido.numero}</Text>
                            {pedido.envases.map((env, idx) => (
                                <View key={idx} style={{ marginBottom: 8 }}>
                                    <Text style={styles.envaseText}>{env.nombre}</Text>
                                    {env.sabores.map((sabor, sIdx) => (
                                        <Text key={sIdx} style={styles.saborText}>
                                            • {sabor}
                                        </Text>
                                    ))}
                                </View>
                            ))}
                            <Pressable
                                style={styles.recibirButton}
                                onPress={() => recibirPedido(pedido.numero)}
                            >
                                <Text style={styles.recibirText}>Recibir</Text>
                            </Pressable>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, width: "100%", height: "100%" },
    overlay: { flex: 1},
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
    orderNumber: { fontSize: 16, fontWeight: "bold", marginBottom: 8, color: "#333" },
    envaseText: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
    saborText: { fontSize: 14, marginLeft: 12, marginBottom: 2 },
    recibirButton: {
        backgroundColor: "#4cd7c7",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    recibirText: { color: "#000", fontWeight: "bold" },
    emptyText: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#999" },
});
