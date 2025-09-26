import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Dropdown from "../../components/Dropdown";
import NavButton from "../../components/NavButton";
import PedidoCard from "../../components/PedidoCard";
import { RootStackParamList } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CategoriaGustosScreen() {
    const navigation = useNavigation<NavigationProp>();

    const previousRoute = "../";
    const nextRoute = "./screens/Detalle_Pedido";

    const [selecciones, setSelecciones] = useState<{
        [key: string]: string[];
    }>({
        "Gustos Frutales": [],
        "Chocolate / DDL": [],
        "Otras Cosas": [],
    });

    const categorias = [
        { label: "Gustos Frutales", options: ["Frutilla", "Banana", "Frambuesa", "Banana Split"] },
        { label: "Chocolate / DDL", options: ["Chocolate", "DDL", "Choco amargo"] },
        { label: "Otras Cosas", options: ["Crema americana", "Granizado"] },
    ];

    const toggleSeleccion = (categoria: string, opcion: string) => {
        console.log(`Toggling ${opcion} in ${categoria}`);
        setSelecciones((prev) => {
            const yaSeleccionado = prev[categoria].includes(opcion);
            const nuevasOpciones = yaSeleccionado
                ? prev[categoria].filter((o) => o !== opcion)
                : [...prev[categoria], opcion];
            return { ...prev, [categoria]: nuevasOpciones };
        });
    };

    return (
        <View style={styles.container}>
            {/* Scroll para que todo el contenido sea visible */}
            <ScrollView contentContainerStyle={{ paddingBottom: 320 }}>
                {/* Botones de navegación */}
                <View style={styles.navContainer}>
                    <NavButton text="Anterior" route={`/${previousRoute.toLowerCase()}`} style={{ margin: 10 }} />
                    <NavButton text="Siguiente" route={`/${nextRoute.toLowerCase()}`} style={{ margin: 10 }} />
                </View>

                {/* Dropdowns y lista de selecciones */}
                {categorias.map((cat) => (
                    <View key={cat.label} style={{ marginBottom: 20 }}>
                        <Dropdown
                            label={cat.label}
                            options={cat.options}
                            onSelect={(item) => toggleSeleccion(cat.label, item)}
                        />

                        <View style={styles.seleccionesContainer}>
                            {selecciones[cat.label].map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.seleccionItem}
                                    onPress={() => toggleSeleccion(cat.label, item)}
                                >
                                    <Text style={styles.seleccionText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* PedidoCard fija abajo */}
            <PedidoCard selecciones={selecciones || {}} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    navContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    seleccionesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
        gap: 10,
        paddingHorizontal: 10,
    },
    seleccionItem: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#4caf50",
        borderRadius: 8,
        backgroundColor: "#e8f5e9",
    },
    seleccionText: {
        color: "#2e7d32",
        fontWeight: "bold",
    },
});
