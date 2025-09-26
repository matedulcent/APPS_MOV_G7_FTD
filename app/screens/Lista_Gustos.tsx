import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import NavButton from "../../components/NavButton"; // importamos NavButton

const gustos = ["Frutilla al agua", "Banana", "Frambuesa", "Banana Split"];

export default function ListaGustosScreen() {
    // Rutas de navegación
    const previousRoute = "./screens/Detalle_Pedido"; // pantalla anterior
    const nextRoute = "./screens/Tipo_Pedido";       // pantalla siguiente

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

            {/* Lista de gustos */}
            <FlatList
                data={gustos}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>{item}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    navContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    item: { padding: 15, borderBottomWidth: 1, borderColor: "#ddd" },
});
