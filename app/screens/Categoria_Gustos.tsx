import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Dropdown from "../../components/Dropdown";
import PedidoCardBottom from "../../components/PedidoCardBottom";

export default function CategoriaGustosScreen() {
    const { pedido } = useLocalSearchParams<{ pedido: string }>();
    const router = useRouter();

    // Diccionario: Cucurucho → cantidad de gustos
    const cucuruchos: { [key: string]: number } = pedido
        ? JSON.parse(decodeURIComponent(pedido))
        : {};

    const cucuruchoKeys = Object.keys(cucuruchos);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [selecciones, setSelecciones] = useState<{ [key: string]: string[] }>({});

    const categorias = [
        { label: "Gustos Frutales", options: ["Frutilla", "Banana", "Frambuesa", "Banana Split"] },
        { label: "Chocolate / DDL", options: ["Chocolate", "DDL", "Choco amargo"] },
        { label: "Otras Cosas", options: ["Crema americana", "Granizado"] },
    ];

    const toggleSeleccion = (categoria: string, opcion: string) => {
        const cucurucho = cucuruchoKeys[currentIndex];
        setSelecciones((prev) => {
            const prevItems = prev[cucurucho] || [];
            const yaSeleccionado = prevItems.includes(opcion);
            let nuevasOpciones = yaSeleccionado
                ? prevItems.filter((o) => o !== opcion)
                : [...prevItems, opcion];

            // Limitamos según cantidad de gustos
            const maxGustos = cucuruchos[cucurucho];
            if (nuevasOpciones.length > maxGustos) nuevasOpciones = nuevasOpciones.slice(0, maxGustos);

            return { ...prev, [cucurucho]: nuevasOpciones };
        });
    };

    const handleConfirm = () => {
        if (currentIndex < cucuruchoKeys.length - 1) {
            setCurrentIndex(currentIndex + 1); // Avanzamos al siguiente cucurucho
        } else {
            // Finalizamos selección y pasamos al detalle
            const pedidoString = encodeURIComponent(JSON.stringify(selecciones));
            router.push(`/screens/Detalle_Pedido?pedido=${pedidoString}`);
        }
    };

    const cucuruchoActual = cucuruchoKeys[currentIndex];
    const gustosSeleccionados = selecciones[cucuruchoActual] || [];

    return (
        <View style={styles.container}>
            {/* Botón Volver */}
            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>← Volver</Text>
            </Pressable>

            <Text style={styles.banner}>
                Seleccione los gustos para {cucuruchoActual} ({gustosSeleccionados.length}/{cucuruchos[cucuruchoActual]})
            </Text>

            {categorias.map((cat) => (
                <View key={cat.label} style={{ marginBottom: 20 }}>
                    <Dropdown
                        label={cat.label}
                        options={cat.options}
                        selected={gustosSeleccionados.filter((g) => cat.options.includes(g))}
                        onSelect={(item) => toggleSeleccion(cat.label, item)}
                    />
                </View>
            ))}

            <PedidoCardBottom selecciones={selecciones} visible={true} onConfirm={handleConfirm} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    backButton: {
        marginBottom: 12,
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
    banner: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
});
