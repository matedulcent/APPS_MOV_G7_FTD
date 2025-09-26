// app/screens/Categoria_Gustos.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Dropdown from "../../components/Dropdown";
import PedidoCardBottom from "../../components/PedidoCardBottom";

export default function CategoriaGustosScreen() {
    const router = useRouter();

    const [selecciones, setSelecciones] = useState<{ [key: string]: string[] }>({
        "Gustos Frutales": [],
        "Chocolate / DDL": [],
        "Otras Cosas": [],
    });

    const [pedidoVisible, setPedidoVisible] = useState(true);

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

    const handleConfirm = () => {
        const pedidoString = encodeURIComponent(JSON.stringify(selecciones));
        router.push(`/screens/Detalle_Pedido?pedido=${pedidoString}`);
    };

    return (
        <View style={styles.container}>
            {/* Botón volver funcional */}
            <Pressable
                style={styles.backButton}
                onPress={() => router.push("/")} // siempre va a volver al home
            >
                <Text style={styles.backButtonText}>← Volver</Text>
            </Pressable>

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

            {/* PedidoCardBottom con botón Confirmar */}
            <PedidoCardBottom
                selecciones={selecciones}
                visible={pedidoVisible}
                onConfirm={handleConfirm}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    backButton: {
        marginBottom: 20,
        padding: 8,
        backgroundColor: "#ccc",
        borderRadius: 6,
        width: 100,
        alignItems: "center",
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
