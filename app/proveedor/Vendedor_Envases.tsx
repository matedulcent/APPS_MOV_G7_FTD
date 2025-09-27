import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Envase = {
    id: string;
    nombre: string;
    maxSabores: number;
};

export default function VendedorEnvasesScreen() {
    const router = useRouter();
    const [envases, setEnvases] = useState<Envase[]>([
        { id: "1", nombre: "Kilo", maxSabores: 3 },
        { id: "2", nombre: "Medio Kilo", maxSabores: 2 },
    ]);

    const [nuevoNombre, setNuevoNombre] = useState("");
    const [nuevoMax, setNuevoMax] = useState("");

    const agregarEnvase = () => {
        if (!nuevoNombre || !nuevoMax) {
            Alert.alert("Error", "Debes ingresar nombre y cantidad máxima de sabores");
            return;
        }
        const nuevo: Envase = {
            id: Math.random().toString(),
            nombre: nuevoNombre,
            maxSabores: parseInt(nuevoMax),
        };
        setEnvases((prev) => [...prev, nuevo]);
        setNuevoNombre("");
        setNuevoMax("");
    };

    const eliminarEnvase = (id: string) => {
        setEnvases((prev) => prev.filter((e) => e.id !== id));
    };

    const handleVendedorGustos = () => {
        router.push("/proveedor/Vendedor_Productos");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Panel de Envases</Text>

            {/* Formulario para agregar envase */}
            <View style={styles.form}>
                <TextInput
                    placeholder="Nombre del envase"
                    style={styles.input}
                    value={nuevoNombre}
                    onChangeText={setNuevoNombre}
                />
                <TextInput
                    placeholder="Máx. sabores"
                    style={styles.input}
                    keyboardType="number-pad"
                    value={nuevoMax}
                    onChangeText={setNuevoMax}
                />
                <Pressable style={styles.addButton} onPress={agregarEnvase}>
                    <Text style={styles.buttonText}>Agregar Envase</Text>
                </Pressable>
            </View>

            {/* Lista de envases */}
            <FlatList
                data={envases}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.envaseText}>{item.nombre} - Máx. {item.maxSabores} sabores</Text>
                        <Pressable style={styles.deleteButton} onPress={() => eliminarEnvase(item.id)}>
                            <Text style={styles.deleteText}>Eliminar</Text>
                        </Pressable>
                    </View>
                )}
                style={{ marginTop: 20 }}
            />

            {/* Botón para ir a Vendedor Gustos */}
            <Pressable style={styles.gotoGustosButton} onPress={handleVendedorGustos}>
                <Text style={styles.gotoGustosText}>Ir a Panel de Gustos</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#f7f7f7" },
    title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
    form: { flexDirection: "row", gap: 8, marginBottom: 12, alignItems: "center" },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: "#fff",
    },
    addButton: {
        backgroundColor: "#4cd7c7ff",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: { color: "#000", fontWeight: "bold" },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    envaseText: { fontSize: 16, fontWeight: "bold" },
    deleteButton: { backgroundColor: "#ff5252", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    deleteText: { color: "#fff", fontWeight: "bold" },
    gotoGustosButton: {
        marginTop: 20,
        backgroundColor: "#ffbb33",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    gotoGustosText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
});
