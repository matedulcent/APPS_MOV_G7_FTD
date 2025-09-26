import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Dropdown from "../../components/Dropdown";
import NavButton from "../../components/NavButton"; // importamos NavButton
import { RootStackParamList } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TipoPedidoScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [pedido, setPedido] = useState<string>("");

    // Rutas de navegación
    const previousRoute = "./screens/Lista_Gustos"; // pantalla anterior
    const nextRoute = "./";       // pantalla siguiente

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

            {/* Dropdown */}
            <Dropdown
                label="Selecciona el tipo"
                options={["Cucurucho", "1/4 Kg", "1 Kg", "Vaso"]}
                onSelect={setPedido}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
    navContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
});
