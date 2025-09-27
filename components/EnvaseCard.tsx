import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Subcategoria = {
    id: string;
    nombre: string;
    maxSabores: number;
};

type Props = {
    id: string;
    nombre: string;
    subcategorias: Subcategoria[];
    subInput: { nombre: string; max: string };
    onChangeSubInput: (field: "nombre" | "max", value: string) => void;
    onAgregarSub: () => void;
    onEliminarSub: (subId: string) => void;
    onEliminarEnvase: () => void;
};

export default function EnvaseCard({
    id,
    nombre,
    subcategorias,
    subInput,
    onChangeSubInput,
    onAgregarSub,
    onEliminarSub,
    onEliminarEnvase,
}: Props) {
    return (
        <View style={styles.card}>
            <Text style={styles.envaseText}>{nombre}</Text>
            <Pressable style={styles.deleteButton} onPress={onEliminarEnvase}>
                <Text style={styles.deleteText}>Eliminar</Text>
            </Pressable>

            {subcategorias.map((sub) => (
                <Text key={sub.id} style={styles.subText}>
                    • {sub.nombre} - Máx. {sub.maxSabores} sabores
                </Text>
            ))}

            <View style={styles.subForm}>
                <TextInput
                    placeholder="Subcategoría"
                    style={[styles.input, { flex: 1 }]}
                    value={subInput?.nombre || ""}
                    onChangeText={(text) => onChangeSubInput("nombre", text)}
                />
                <TextInput
                    placeholder="Máx. sabores"
                    style={[styles.input, { width: 80 }]}
                    keyboardType="number-pad"
                    value={subInput?.max || ""}
                    onChangeText={(text) => onChangeSubInput("max", text)}
                />
                <Pressable style={styles.addButton} onPress={onAgregarSub}>
                    <Text style={styles.buttonText}>+</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    envaseText: { fontSize: 16, fontWeight: "bold" },
    subText: { marginLeft: 12, fontSize: 14, marginBottom: 2 },
    deleteButton: {
        backgroundColor: "#ff5252",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginTop: 4,
    },
    deleteText: { color: "#fff", fontWeight: "bold" },
    subForm: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
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
        marginLeft: 4,
    },
    buttonText: { color: "#000", fontWeight: "bold", fontSize: 14 },
});
