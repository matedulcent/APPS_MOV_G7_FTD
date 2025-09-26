// app/screens/Categoria_Volumen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Dropdown from "../../components/Dropdown";
import PedidoCardBottom from "../../components/PedidoCardBottom";

export default function CategoriaVolumenScreen() {
    const router = useRouter();

    // Selecciones de cantidades por categoría
    const [selecciones, setSelecciones] = useState<{ [key: string]: string[] }>({
        "Porciones": [],
        "Cucuruchos": [],
        "Vasos": [],
        "Kilos": [],
    });

    const [pedidoVisible, setPedidoVisible] = useState(true);

    const categorias = [
        {
            label: "Porciones",
            options: ["1/4 kg", "1/2 kg", "3/4 kg"],
        },
        {
            label: "Cucuruchos",
            options: ["1 bola", "2 bolas", "3 bolas", "4 bolas"],
        },
        {
            label: "Vasos",
            options: ["1 gusto", "2 gustos", "3 gustos"],
        },
        {
            label: "Kilos",
            options: ["1 kg", "2 kg", "3 kg"],
        },
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
        router.push(`/screens/Categoria_Gustos?pedido=${pedidoString}`);
    };

    return (
        <View style={styles.container}>
            {/* Botón volver */}
            <Pressable
                style={styles.backButton}
                onPress={() => router.push("/")}
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

            {/* PedidoCardBottom */}
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
