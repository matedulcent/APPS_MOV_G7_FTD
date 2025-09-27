import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import CategoriaProducto from "../../components/CategoriaProducto";
import ScreenHeader from "../../components/ScreenHeader";

const { height } = Dimensions.get("window");

type Categoria = {
    label: string;
    options: string[];
};

export default function VendedorProductosScreen() {
    const router = useRouter();

    const [categorias, setCategorias] = useState<Categoria[]>([
        { label: "Frutales", options: ["Frutilla", "Banana", "Frambuesa"] },
        { label: "Chocolates", options: ["Chocolate", "Choco blanco"] },
        { label: "Cremas y Dulces", options: ["Dulce de leche"] },
    ]);

    const [searchText, setSearchText] = useState("");
    const [searchVisible, setSearchVisible] = useState(false);
    const [nuevoProductoInputs, setNuevoProductoInputs] = useState<{ [label: string]: string }>({});

    const agregarProducto = (catIndex: number) => {
        const label = categorias[catIndex].label;
        const nuevoProducto = nuevoProductoInputs[label]?.trim();
        if (!nuevoProducto) return;

        setCategorias((prev) => {
            const newCats = [...prev];
            newCats[catIndex].options.push(nuevoProducto);
            return newCats;
        });

        setNuevoProductoInputs((prev) => ({ ...prev, [label]: "" }));
    };

    const removerProducto = (catIndex: number, producto: string) => {
        setCategorias((prev) => {
            const newCats = [...prev];
            newCats[catIndex].options = newCats[catIndex].options.filter(
                (p) => p !== producto
            );
            return newCats;
        });
    };

    const handleIrRecibirOrdenes = () => {
        router.push("/proveedor/Recibir_Productos");
    };

    const categoriasFiltradas = categorias.map((cat) => ({
        ...cat,
        options: cat.options.filter((prod) =>
            prod.toLowerCase().includes(searchText.toLowerCase())
        ),
    }));

    return (
        <View style={styles.container}>
            <View style={styles.headerWrapper}>
                <ScreenHeader
                    title="Gestión de Productos"
                    showSearch
                    onToggleSearch={() => setSearchVisible((prev) => !prev)}
                />
                {searchVisible && (
                    <TextInput
                        placeholder="Buscar producto..."
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                )}
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: height * 0.2 }}>
                {categoriasFiltradas.map((cat, catIndex) => (
                    <CategoriaProducto
                        key={cat.label}
                        label={cat.label}
                        productos={cat.options}
                        nuevoProducto={nuevoProductoInputs[cat.label] || ""}
                        onChangeNuevoProducto={(text) =>
                            setNuevoProductoInputs((prev) => ({ ...prev, [cat.label]: text }))
                        }
                        onAgregar={() => agregarProducto(catIndex)}
                        onRemover={(producto) => removerProducto(catIndex, producto)}
                    />
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    style={styles.irOrdenesButton}
                    onPress={handleIrRecibirOrdenes}
                >
                    <Text style={styles.irOrdenesText}>Ir a recibir órdenes</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f7f7" },
    headerWrapper: { marginTop: 20, marginHorizontal: 20 },
    searchInput: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: "#fff",
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    irOrdenesButton: {
        width: "90%",
        backgroundColor: "#ffbb33",
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: "center",
    },
    irOrdenesText: { color: "#000", fontWeight: "bold", fontSize: 18 },
});
