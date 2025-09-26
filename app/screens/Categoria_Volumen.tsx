// app/screens/Categoria_Volumen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Dropdown from "../../components/Dropdown";

export default function CategoriaVolumenScreen() {
    const router = useRouter();

    const [selecciones, setSelecciones] = useState<{ [key: string]: string[] }>({
        Cucuruchos: [],
        Kilos: [],
        Vasos: [],
    });

    const categorias = [
        { label: "Cucuruchos", options: ["1 bola", "2 bolas", "3 bolas", "4 bolas"] },
        { label: "Kilos", options: ["1/4 Kg", "1/2 Kg", "1 Kg"] },
        { label: "Vasos", options: ["1 bola", "2 bolas", "3 bolas", "4 bolas"] },
    ];

    // Diccionario de cantidad de sabores por categoría
    const cantidadSabores: { [key: string]: number } = {
        Cucuruchos: 0, // se determina por el número de bolas seleccionado
        Kilos: 4,      // siempre 4 sabores
        Vasos: 0,      // se determina por el número de bolas seleccionado
    };

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
        const pedidoFinal: { [key: string]: number } = {};

        Object.entries(selecciones).forEach(([categoria, items]) => {
            items.forEach((item, index) => {
                let cantidad = cantidadSabores[categoria] || 1;

                // Si es Cucuruchos o Vasos, tomamos la cantidad del string
                if (categoria === "Cucuruchos" || categoria === "Vasos") {
                    cantidad = parseInt(item[0]);
                }

                pedidoFinal[`${categoria} ${index + 1} (${item})`] = cantidad;
            });
        });

        const pedidoString = encodeURIComponent(JSON.stringify(pedidoFinal));
        router.push(`/screens/Categoria_Gustos?pedido=${pedidoString}`);
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
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

            <Pressable style={styles.button} onPress={handleConfirm}>
                <Text style={styles.buttonText}>Siguiente</Text>
            </Pressable>
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
    backButtonText: { fontSize: 16, fontWeight: "bold" },
    button: {
        backgroundColor: "#6200ee",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
