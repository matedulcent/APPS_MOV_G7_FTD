import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function DetallePedidoScreen() {
    const { pedido } = useLocalSearchParams<{ pedido: string }>();
    const router = useRouter();

    const pedidoObj: { [key: string]: string[] } = pedido
        ? JSON.parse(decodeURIComponent(pedido))
        : {};

    const ticketHeight = Dimensions.get("window").height * 0.8;

    return (
        <View style={styles.container}>
            <View style={[styles.ticket, { height: ticketHeight }]}>
                <View style={styles.ticketNotch} />
                <Text style={styles.title}>Detalle del Pedido</Text>

                <ScrollView style={[styles.content, { maxHeight: ticketHeight - 180 }]}>
                    {Object.entries(pedidoObj).map(([cucurucho, gustos]) => (
                        <View key={cucurucho} style={{ marginBottom: 12 }}>
                            <Text style={styles.cucuruchoTitle}>{cucurucho}</Text>
                            {gustos.map((gusto, i) => (
                                <Text key={i} style={styles.item}>🍦 {gusto}</Text>
                            ))}
                        </View>
                    ))}
                </ScrollView>

                {/* Botón para confirmar pedido */}
                <Pressable
                    style={[styles.button, { backgroundColor: "#ff5722", marginTop: 12 }]}
                    onPress={() => router.push("/screens/NumeroOrden")}
                >
                    <Text style={[styles.buttonText, { fontSize: 18 }]}>Confirmar Pedido</Text>
                </Pressable>

                {/* Botón para volver */}
                <Pressable style={styles.button} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Volver</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0" },
    ticket: {
        width: "90%",
        backgroundColor: "#fff8e1",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    ticketNotch: { width: 40, height: 5, backgroundColor: "#ffd54f", borderRadius: 3, alignSelf: "center", marginBottom: 10 },
    title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
    cucuruchoTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
    content: {},
    item: { fontSize: 16, marginLeft: 12, marginBottom: 4 },
    button: { backgroundColor: "#6200ee", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
