import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import EnvaseCard from "../../components/EnvaseCard";
import ScreenHeader from "../../components/ScreenHeader";

const { height } = Dimensions.get("window");

type Subcategoria = {
    id: string;
    nombre: string;
    maxSabores: number;
};

type Envase = {
    id: string;
    nombre: string;
    subcategorias: Subcategoria[];
};

export default function VendedorEnvasesScreen() {
    const router = useRouter();

    const [envases, setEnvases] = useState<Envase[]>([
        { id: "1", nombre: "Kilo", subcategorias: [] },
        { id: "2", nombre: "Medio Kilo", subcategorias: [] },
    ]);

    const [nuevoNombre, setNuevoNombre] = useState("");
    const [searchText, setSearchText] = useState("");
    const [searchVisible, setSearchVisible] = useState(false);

    const [subInputs, setSubInputs] = useState<{ [envaseId: string]: { nombre: string; max: string } }>({});

    const agregarEnvase = () => {
        if (!nuevoNombre) return Alert.alert("Error", "Debes ingresar nombre del envase");
        const nuevo: Envase = { id: Math.random().toString(), nombre: nuevoNombre, subcategorias: [] };
        setEnvases((prev) => [...prev, nuevo]);
        setNuevoNombre("");
    };

    const eliminarEnvase = (id: string) => setEnvases((prev) => prev.filter((e) => e.id !== id));

    const agregarSubcategoria = (envaseId: string, nombre: string, max: number) => {
        setEnvases((prev) =>
            prev.map((env) =>
                env.id === envaseId
                    ? { ...env, subcategorias: [...env.subcategorias, { id: Math.random().toString(), nombre, maxSabores: max }] }
                    : env
            )
        );
    };

    const handleVendedorGustos = () => router.push("/proveedor/Vendedor_Productos");

    const envasesFiltrados = envases.filter((env) =>
        env.nombre.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerWrapper}>
                <ScreenHeader
                    title="Panel de Envases"
                    showSearch
                    onToggleSearch={() => setSearchVisible((prev) => !prev)}
                />
                {searchVisible && (
                    <TextInput
                        placeholder="Buscar envase..."
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                )}
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: height * 0.2 }}>
                {/* Formulario agregar envase */}
                <View style={styles.form}>
                    <TextInput
                        placeholder="Nombre del envase"
                        style={styles.input}
                        value={nuevoNombre}
                        onChangeText={setNuevoNombre}
                    />
                    <Pressable style={styles.addButton} onPress={agregarEnvase}>
                        <Text style={styles.buttonText}>Agregar Envase</Text>
                    </Pressable>
                </View>

                {/* Lista de envases */}
                {envasesFiltrados.map((env) => (
                    <EnvaseCard
                        key={env.id}
                        id={env.id}
                        nombre={env.nombre}
                        subcategorias={env.subcategorias}
                        subInput={subInputs[env.id] || { nombre: "", max: "" }}
                        onChangeSubInput={(field, value) =>
                            setSubInputs((prev) => ({
                                ...prev,
                                [env.id]: { ...prev[env.id], [field]: value },
                            }))
                        }
                        onAgregarSub={() => {
                            const input = subInputs[env.id];
                            if (!input?.nombre || !input?.max) return Alert.alert("Error", "Completa nombre y máximo de sabores");
                            agregarSubcategoria(env.id, input.nombre, parseInt(input.max));
                            setSubInputs((prev) => ({ ...prev, [env.id]: { nombre: "", max: "" } }));
                        }}
                        onEliminarSub={(subId) =>
                            setEnvases((prev) =>
                                prev.map((envObj) =>
                                    envObj.id === env.id
                                        ? { ...envObj, subcategorias: envObj.subcategorias.filter((s) => s.id !== subId) }
                                        : envObj
                                )
                            )
                        }
                        onEliminarEnvase={() => eliminarEnvase(env.id)}
                    />
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <Pressable style={styles.gotoGustosButton} onPress={handleVendedorGustos}>
                    <Text style={styles.gotoGustosText}>Ir a Panel de Gustos</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f7f7" },
    headerWrapper: { marginTop: 20, marginHorizontal: 20 },
    searchInput: {
        marginHorizontal: 0,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: "#fff",
    },
    form: { flexDirection: "row", gap: 8, marginHorizontal: 16, marginBottom: 12, alignItems: "center" },
    input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, backgroundColor: "#fff" },
    addButton: { backgroundColor: "#4cd7c7ff", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginLeft: 4 },
    buttonText: { color: "#000", fontWeight: "bold", fontSize: 14 },
    footer: { position: "absolute", bottom: 20, left: 0, right: 0, alignItems: "center" },
    gotoGustosButton: { width: "90%", backgroundColor: "#ffbb33", paddingVertical: 18, borderRadius: 12, alignItems: "center" },
    gotoGustosText: { color: "#000", fontWeight: "bold", fontSize: 18 },
});
