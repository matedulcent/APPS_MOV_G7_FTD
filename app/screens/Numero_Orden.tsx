import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function NumeroOrdenScreen() {
    const router = useRouter();
    const [numeroOrden, setNumeroOrden] = useState<number>(0);

    useEffect(() => {
        // Genera un número de orden aleatorio entre 1000 y 9999
        setNumeroOrden(Math.floor(1000 + Math.random() * 9000));
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>¡Pedido Confirmado!</Text>
            <Text style={styles.numero}>Orden #: {numeroOrden}</Text>

            <Pressable style={styles.button} onPress={() => router.push("/")}>
                <Text style={styles.buttonText}>Volver a Inicio</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff8e1", padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    numero: { fontSize: 32, fontWeight: "bold", marginBottom: 40, color: "#ff5722" },
    button: { backgroundColor: "#6200ee", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10 },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});
