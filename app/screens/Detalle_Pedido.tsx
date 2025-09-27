import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Dimensions, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function DetallePedidoScreen() {
    const { pedido, sucursalId, userId } = useLocalSearchParams<{
        pedido: string;
        sucursalId: string;
        userId: string;
    }>();
    const router = useRouter();

    const pedidoObj: { [key: string]: string[] } = pedido
        ? JSON.parse(decodeURIComponent(pedido))
        : {};

    const ticketHeight = Dimensions.get("window").height * 0.8;

    ////////////////////////////////////////////////////////////////////////////
    console.log("##########################################################################");
    console.log("(DETALLE) SUCURSAL ID:", sucursalId);
    console.log("(DETALLE) Usuario ID:", userId);
    console.log("(DETALLE) Pedido completo:", pedido);
    ////////////////////////////////////////////////////////////////////////////

    return (
        <ImageBackground
            source={require("../../assets/images/backgrounds/fondo3.jpg")} // tu imagen almacenada
            style={styles.background}
            resizeMode="cover"
        >
            {/* Overlay semitransparente para mejorar legibilidad */}
            <View style={styles.overlay}>
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

                    <Pressable
                        style={[styles.button, { backgroundColor: "#42e9e9ff", marginTop: 12 }]}
                        onPress={() => {
                            router.push({
                                pathname: "/screens/Numero_Orden",
                                params: { pedido, sucursalId, userId },
                            });
                        }}
                    >
                        <Text style={[styles.buttonText, { fontSize: 18 }]}>Confirmar Pedido</Text>
                    </Pressable>

                    <Pressable style={[styles.button, { backgroundColor: "#f4679fff", marginTop: 12 }]} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Volver</Text>
                    </Pressable>
                </View>
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
    title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
    cucuruchoTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
    content: {},
    item: { fontSize: 16, marginLeft: 12, marginBottom: 4 },
    button: { backgroundColor: "#6200ee", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
