import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import Dropdown from "../../components/Dropdown";
import NavButton from "../../components/NavButton"; // importa tu NavButton
import { RootStackParamList } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CategoriaGustosScreen() {
    const navigation = useNavigation<NavigationProp>();

    // Rutas para navegación
    const previousRoute = "../";      // nombre de la pantalla anterior
    const nextRoute = "./screens/Detalle_Pedido";      // nombre de la pantalla siguiente

    return (
        <View style={styles.container}>
            {/* Botones de navegación en extremos */}
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

            {/* Dropdowns */}
            <Dropdown
                label="Gustos Frutales"
                options={["Frutilla", "Banana", "Frambuesa", "Banana Split"]}
                onSelect={(item) => console.log("Elegido:", item)}
            />
            <Dropdown
                label="Chocolate / DDL"
                options={["Chocolate", "DDL", "Choco amargo"]}
                onSelect={(item) => console.log("Elegido:", item)}
            />
            <Dropdown
                label="Otras Cosas"
                options={["Crema americana", "Granizado"]}
                onSelect={(item) => console.log("Elegido:", item)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    navContainer: {
        flexDirection: "row",
        justifyContent: "space-between", // coloca un botón a cada extremo
        marginBottom: 20,
    },
});
