// app/screens/Categoria_Volumen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Dropdown from "../../components/Dropdown";

export default function CategoriaVolumenScreen() {
    const router = useRouter();

    // Selecciones con cantidades
    const [selecciones, setSelecciones] = useState<{ [key: string]: { opcion: string; cantidad: number }[] }>({
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
        Cucuruchos: 0,
        Kilos: 4,
        Vasos: 0,
    };

    const toggleSeleccion = (categoria: string, opcion: string) => {
        setSelecciones((prev) => {
            const prevItems = prev[categoria] || [];
            const existe = prevItems.find((i) => i.opcion === opcion);

            let nuevasOpciones;
            if (existe) {
                // Si ya estaba, lo sacamos
                nuevasOpciones = prevItems.filter((i) => i.opcion !== opcion);
            } else {
                // Lo agregamos con cantidad inicial 1
                nuevasOpciones = [...prevItems, { opcion, cantidad: 1 }];
            }
            return { ...prev, [categoria]: nuevasOpciones };
        });
    };

    const updateCantidad = (categoria: string, opcion: string, delta: number) => {
        setSelecciones((prev) => {
            const nuevasOpciones = prev[categoria].map((item) =>
                item.opcion === opcion
                    ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
                    : item
            );
            return { ...prev, [categoria]: nuevasOpciones };
        });
    };

    const handleConfirm = () => {
        const pedidoFinal: { [key: string]: number } = {};

        Object.entries(selecciones).forEach(([categoria, items]) => {
            items.forEach(({ opcion, cantidad }, index) => {
                let sabores = cantidadSabores[categoria] || 1;

                if (categoria === "Cucuruchos" || categoria === "Vasos") {
                    sabores = parseInt(opcion[0]);
                }

                // Guardamos multiplicado por la cantidad elegida
                pedidoFinal[`${categoria} ${index + 1} (${opcion})`] = sabores * cantidad;
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
                        selected={selecciones[cat.label].map((i) => i.opcion)}
                        onSelect={(item) => toggleSeleccion(cat.label, item)}
                    />

                    {/* Mostrar seleccionados con contador */}
                    {selecciones[cat.label].map(({ opcion, cantidad }) => (
                        <View key={opcion} style={styles.itemRow}>
                            <Text style={styles.itemText}>{opcion}</Text>
                            <View style={styles.counter}>
                                <Pressable
                                    style={styles.counterButton}
                                    onPress={() => updateCantidad(cat.label, opcion, -1)}
                                >
                                    <Text style={styles.counterText}>−</Text>
                                </Pressable>
                                <Text style={styles.counterValue}>{cantidad}</Text>
                                <Pressable
                                    style={styles.counterButton}
                                    onPress={() => updateCantidad(cat.label, opcion, 1)}
                                >
                                    <Text style={styles.counterText}>＋</Text>
                                </Pressable>
                            </View>
                        </View>
                    ))}
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
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
    },
    itemText: { fontSize: 16 },
    counter: {
        flexDirection: "row",
        alignItems: "center",
    },
    counterButton: {
        backgroundColor: "#eee",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    counterText: { fontSize: 18, fontWeight: "bold" },
    counterValue: { fontSize: 16, fontWeight: "bold", minWidth: 20, textAlign: "center" },
    button: {
        backgroundColor: "#6200ee",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
