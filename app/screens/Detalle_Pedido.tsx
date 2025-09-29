import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    ImageBackground,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";

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

    console.log("##########################################################################");
    console.log("(DETALLE) SUCURSAL ID:", sucursalId);
    console.log("(DETALLE) Usuario ID:", userId);
    console.log("(DETALLE) Pedido completo:", pedido);
    console.log("##########################################################################");

    return (
        <ImageBackground
            source={require("../../assets/images/backgrounds/fondo3.jpg")}
            style={styles.background}
            resizeMode={isSmallScreen ? "stretch" : "cover"}
        >
            <View style={styles.overlay}>
                <View style={styles.ticket}>
                    <View style={styles.ticketNotch} />
                    <Text style={styles.title}>Detalle del Pedido</Text>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {Object.entries(pedidoObj).map(([cucurucho, gustos]) => (
                            <View key={cucurucho} style={{ marginBottom: height * 0.015 }}>
                                <Text style={styles.cucuruchoTitle}>{cucurucho}</Text>
                                {gustos.map((gusto, i) => (
                                    <Text key={i} style={styles.item}>🍦 {gusto}</Text>
                                ))}
                            </View>
                        ))}
                    </ScrollView>

                    <View style={{ marginTop: 10 }}>
                        <Pressable
                            style={[styles.button, { backgroundColor: "#42e9e9ff" }]}
                            onPress={() =>
                                router.push({
                                    pathname: "/screens/Numero_Orden",
                                    params: { pedido, sucursalId, userId },
                                })
                            }
                        >
                            <Text style={[styles.buttonText, { fontSize: isWeb ? 18 : width * 0.045 }]}>
                                Confirmar Pedido
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[styles.button, { backgroundColor: "#f4679fff", marginTop: 10 }]}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.buttonText, { fontSize: isWeb ? 16 : width * 0.04 }]}>
                                Volver
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width,
        height,
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: isWeb ? 40 : width * 0.05,
        backgroundColor: "rgba(255,255,255,0.6)",
    },
    ticket: {
        width: "90%",
        backgroundColor: "#fff8e1",
        borderRadius: 16,
        padding: isWeb ? 16 : width * 0.04,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        flex: 1, 
    },
    ticketNotch: {
        width: isWeb ? 40 : width * 0.1,
        height: isWeb ? 5 : height * 0.008,
        backgroundColor: "#ffd54f",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: height * 0.1,
    },
    title: {
        fontSize: isWeb ? 22 : width * 0.055,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: height * 0.015,
    },
    cucuruchoTitle: {
        fontSize: isWeb ? 18 : width * 0.045,
        fontWeight: "bold",
        marginBottom: height * 0.005,
    },
    content: {
        flexGrow: 1,
    },
    item: {
        fontSize: isWeb ? 16 : width * 0.04,
        marginLeft: width * 0.03,
        marginBottom: height * 0.005,
    },
    button: {
        backgroundColor: "#6200ee",
        paddingVertical: isWeb ? 12 : height * 0.02,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: isWeb ? 16 : width * 0.04,
    },
});
