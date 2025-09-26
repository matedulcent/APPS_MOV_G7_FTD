import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import NavButton from "../../components/NavButton";

export default function DetallePedidoScreen() {
    const { pedido } = useLocalSearchParams<{ pedido: string }>(); // ✅ corregido
    const router = useRouter();

    const pedidoObj = pedido ? JSON.parse(decodeURIComponent(pedido)) : {};

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll}>
                <Text style={styles.title}>Detalle del Pedido</Text>
                {Object.keys(pedidoObj).length > 0 ? (
                    Object.entries(pedidoObj).map(([categoria, items], i) => (
                        <View key={i} style={styles.categoria}>
                            <Text style={styles.categoriaTitle}>{categoria}</Text>
                            {(items as string[]).map((item, j) => (
                                <Text key={j} style={styles.item}>
                                    - {item}
                                </Text>
                            ))}
                        </View>
                    ))
                ) : (
                    <Text>No hay productos seleccionados</Text>
                )}
            </ScrollView>

            <NavButton text="Volver" onPress={() => router.back()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    scroll: { flex: 1 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
    categoria: { marginBottom: 15 },
    categoriaTitle: { fontSize: 18, fontWeight: "600" },
    item: { fontSize: 16, marginLeft: 10 },
});
