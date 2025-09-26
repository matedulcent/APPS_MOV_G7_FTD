import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Dropdown from "../../components/Dropdown";
import NavButton from "../../components/NavButton";
import PedidoCardBottom from "../../components/PedidoCardBottom";
import { RootStackParamList } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CategoriaGustosScreen() {
    const navigation = useNavigation<NavigationProp>();

    const previousRoute = "../";
    const nextRoute = "./screens/Detalle_Pedido";

    const [selecciones, setSelecciones] = useState<{ [key: string]: string[] }>({
        "Gustos Frutales": [],
        "Chocolate / DDL": [],
        "Otras Cosas": [],
    });

    const [pedidoVisible, setPedidoVisible] = useState(false);

    const categorias = [
        { label: "Gustos Frutales", options: ["Frutilla", "Banana", "Frambuesa", "Banana Split"] },
        { label: "Chocolate / DDL", options: ["Chocolate", "DDL", "Choco amargo"] },
        { label: "Otras Cosas", options: ["Crema americana", "Granizado"] },
    ];

    const toggleSeleccion = (categoria: string, opcion: string) => {
        setSelecciones((prev) => {
            const prevItems = prev[categoria] || [];
            const yaSeleccionado = prevItems.includes(opcion);
            const nuevasOpciones = yaSeleccionado
                ? prevItems.filter((o) => o !== opcion)
                : [...prevItems, opcion];
            return { ...prev, [categoria]: nuevasOpciones };
        });
    };

    // Contador total de productos
    const totalProductos = Object.values(selecciones).flat().length;

    return (
        <View style={styles.container}>
            <View style={styles.navContainer}>
                <NavButton text="Anterior" route={`/${previousRoute.toLowerCase()}`} style={{ margin: 10 }} />
                <NavButton text="Siguiente" route={`/${nextRoute.toLowerCase()}`} style={{ margin: 10 }} />
            </View>

            {categorias.map((cat) => (
                <View key={cat.label} style={{ marginBottom: 20 }}>
                    <Dropdown
                        label={cat.label}
                        options={cat.options}
                        selected={selecciones[cat.label]}
                        onSelect={(item) => toggleSeleccion(cat.label, item)}
                    />
                </View>
            ))}

            {/* Barra inferior: toggle para desplegar/retraer carta */}
            <TouchableOpacity
                style={styles.triggerBar}
                onPress={() => setPedidoVisible(!pedidoVisible)}
            >
                <Text style={styles.triggerText}>Ver Pedido ({totalProductos})</Text>
            </TouchableOpacity>

            <PedidoCardBottom selecciones={selecciones} visible={pedidoVisible} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    navContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    triggerBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: "#2196f3",
        alignItems: "center",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    triggerText: { color: "white", fontWeight: "bold" },
});
