import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Dropdown from "../../components/Dropdown";
import PedidoCardBottom from "../../components/PedidoCardBottom";

export default function CategoriaGustosScreen() {
    const { pedido } = useLocalSearchParams<{ pedido: string }>();
    const router = useRouter();

    const cucuruchos: { [key: string]: number } = pedido
        ? JSON.parse(decodeURIComponent(pedido))
        : {};

    const cucuruchoKeys = Object.keys(cucuruchos);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selecciones, setSelecciones] = useState<{ [key: string]: string[] }>({});

    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState("");

    const categorias = [
        { label: "Frutales", options: ["Frutilla", "Banana", "Frambuesa", "Durazno", "Cereza", "Arándano", "Mango", "Kiwi", "Maracuyá"] },
        { label: "Chocolates", options: ["Chocolate", "Choco blanco", "Chocolate amargo", "Chocolate con almendras", "DDL", "Choco menta"] },
        { label: "Cremas y Dulces", options: ["Crema americana", "Dulce de leche", "Caramelo", "Cheesecake", "Tiramisu", "Vainilla"] },
        { label: "Frutos Secos", options: ["Maní", "Almendra", "Avellana", "Pistacho", "Nuez"] },
        { label: "Exóticos", options: ["Menta granizada", "Café", "Matcha", "Yogur", "Limoncello", "Ron con pasas"] },
    ];

    const categoriasFiltradas = categorias.map((cat) => ({
        ...cat,
        options: cat.options.filter((op) =>
            op.toLowerCase().includes(searchText.toLowerCase())
        ),
    })).filter((cat) => cat.options.length > 0);

    const toggleSeleccion = (categoria: string, opcion: string) => {
        const cucurucho = cucuruchoKeys[currentIndex];
        setSelecciones((prev) => {
            const prevItems = prev[cucurucho] || [];
            const yaSeleccionado = prevItems.includes(opcion);
            let nuevasOpciones = yaSeleccionado
                ? prevItems.filter((o) => o !== opcion)
                : [...prevItems, opcion];

            const maxGustos = cucuruchos[cucurucho];
            if (nuevasOpciones.length > maxGustos) nuevasOpciones = nuevasOpciones.slice(0, maxGustos);

            return { ...prev, [cucurucho]: nuevasOpciones };
        });
    };

    const handleConfirm = () => {
        if (currentIndex < cucuruchoKeys.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            const pedidoString = encodeURIComponent(JSON.stringify(selecciones));
            router.push(`/screens/Detalle_Pedido?pedido=${pedidoString}`);
        }
    };

    const cucuruchoActual = cucuruchoKeys[currentIndex];
    const gustosSeleccionados = selecciones[cucuruchoActual] || [];

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </Pressable>
                <Text style={styles.title}>Categorías de Gustos</Text>
                <Pressable onPress={() => setShowSearch(!showSearch)} style={styles.iconButton}>
                    <Ionicons name="search" size={24} color="black" />
                </Pressable>
            </View>

            {/* Banner */}
            <Text style={styles.banner}>
                Seleccione los gustos para {cucuruchoActual} ({gustosSeleccionados.length}/{cucuruchos[cucuruchoActual]})
            </Text>

            {/* Input de búsqueda */}
            {showSearch && (
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar gusto..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            )}

            {/* Categorías */}
            {categoriasFiltradas.map((cat) => (
                <View key={cat.label} style={{ marginBottom: 20 }}>
                    <Dropdown
                        label={cat.label}
                        options={cat.options}
                        selected={gustosSeleccionados.filter((g) => cat.options.includes(g))}
                        onSelect={(item) => toggleSeleccion(cat.label, item)}
                    />
                </View>
            ))}

            {/* Pedido abajo */}
            <PedidoCardBottom
                selecciones={selecciones}
                visible={true}
                onConfirm={handleConfirm}
                currentIndex={currentIndex}
                totalVolumenes={cucuruchoKeys.length}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    iconButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    banner: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 8,
        marginBottom: 16,
    },
});
