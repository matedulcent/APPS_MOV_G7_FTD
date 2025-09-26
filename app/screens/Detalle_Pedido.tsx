import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import NavButton from "../../components/NavButton"; // importa tu NavButton
import { RootStackParamList } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DetallePedidoScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();
    const { pedido } = route.params as { pedido: string };

    // Rutas de navegación
    const previousRoute = "./screens/Categoria_Gustos"; // pantalla anterior
    const nextRoute = "./screens/Lista_Gustos";       // pantalla siguiente (ejemplo)

    return (
        <View style={styles.container}>
            {/* Botones de navegación */}
            <View style={styles.navContainer}>
                <NavButton
                    text="Anterior"
                    route={`/${previousRoute.toLowerCase()}`}
                    style={{ margin: 10 }}
                />
                <NavButton
                    text="Siguiente"
                    route={`/${nextRoute.toLowerCase()}`}
                    style={{ margin: 10 }}
                />
            </View>

            {/* Contenido */}
            <Text style={styles.text}>Pedido: {pedido}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    navContainer: {
        flexDirection: "row",
        justifyContent: "space-between", // botones en los extremos
        marginBottom: 20,
    },
    text: { fontSize: 18, marginBottom: 20 },
});
