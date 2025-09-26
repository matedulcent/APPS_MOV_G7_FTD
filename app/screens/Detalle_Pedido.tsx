// app/screens/Detalle_Pedido.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function DetallePedidoScreen() {
    const { pedido } = useLocalSearchParams<{ pedido: string }>();
    const router = useRouter();

    const pedidoObj: { [key: string]: string[] } = pedido
        ? JSON.parse(decodeURIComponent(pedido))
        : {};

    // Flatten todas las opciones seleccionadas en un array de strings
    const productos: string[] = Object.values(pedidoObj).flat() as string[];

    const screenHeight = Dimensions.get("window").height;

    return (
        <View style={styles.container}>
            <View style={[styles.ticket, { height: screenHeight * 0.6 }]}>
                {/* Muesca tipo ticket */}
                <View style={styles.ticketNotch} />

                {/* Título */}
                <Text style={styles.title}>Detalle del Pedido</Text>

                {/* Scroll de productos */}
                <ScrollView style={styles.content}>
                    {productos.length > 0 ? (
                        productos.map((item, i) => (
                            <Text key={i} style={styles.item}>🍦 {item}</Text>
                        ))
                    ) : (
                        <Text style={styles.noItems}>No hay productos seleccionados</Text>
                    )}
                </ScrollView>

                {/* Botón Volver */}
                <Pressable style={styles.button} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Volver</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center", // centramos verticalmente
        alignItems: "center",     // centramos horizontalmente
        backgroundColor: "#f0f0f0",
    },
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
    ticketNotch: {
        width: 40,
        height: 5,
        backgroundColor: "#ffd54f",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 12,
    },
    content: {
        maxHeight: "70%",
        marginBottom: 16,
    },
    item: {
        fontSize: 16,
        marginBottom: 8,
    },
    noItems: {
        fontSize: 16,
        fontStyle: "italic",
        color: "#555",
    },
    button: {
        backgroundColor: "#6200ee",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
