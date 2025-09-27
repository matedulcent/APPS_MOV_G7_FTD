// app/screens/Numero_Orden.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

export default function NumeroOrdenScreen() {
    const router = useRouter();
    const { pedido, sucursalId, userId } = useLocalSearchParams<{
        pedido?: string;
        sucursalId?: string;
        userId?: string;
    }>();

    const [numeroOrden, setNumeroOrden] = useState<number>(0);

    useEffect(() => {
        // Genera un número de orden aleatorio entre 1000 y 9999
        const orden = Math.floor(1000 + Math.random() * 9000);
        setNumeroOrden(orden);

        console.log("##########################################################################");
        console.log("(SELECCION GUSTOS) SUCURSAL ID:", sucursalId);
        console.log("(SELECCION GUSTOS) Usuario ID:", userId);
        console.log("(SELECCION GUSTOS) Pedido Completo:", pedido);
        console.log("##########################################################################");
    }, [sucursalId, userId]);

    return (
        <ImageBackground
            source={require("../../assets/images/backgrounds/fondo4.jpg")} // 👈 ruta de tu imagen
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <Text style={styles.title}>¡Pedido Confirmado!</Text>
                <Text style={styles.numero}>Orden #: {numeroOrden}</Text>

                <Pressable style={[styles.button, { backgroundColor: "#f4679fff", marginTop: 12 }]} onPress={() => router.push("/")}>
                    <Text style={styles.buttonText}>Volver a Inicio</Text>
                </Pressable>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    numero: { fontSize: 32, fontWeight: "bold", marginBottom: 40, color: "#ff5722" },
    button: { backgroundColor: "#6200ee", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10 },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});
