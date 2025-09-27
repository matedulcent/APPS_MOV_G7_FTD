// app/screens/SeleccionSucursal.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Sucursal = {
    id: string;
    nombre: string;
    direccion: string;
};

export default function SeleccionSucursalScreen() {
    const router = useRouter();
    const { userId } = useLocalSearchParams<{ userId: string }>(); // Recibe el parámetro userId
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string | null>(null);

    // Lista de sucursales de ejemplo
    const sucursales: Sucursal[] = [
        { id: "1", nombre: "Heladería Central", direccion: "Av. Córdoba 1234" },
        { id: "2", nombre: "Heladería Norte", direccion: "Calle San Juan 456" },
        { id: "3", nombre: "Heladería Sur", direccion: "Av. Rivadavia 789" },
    ];

    const handleSeleccion = (sucursal: Sucursal) => {
        setSucursalSeleccionada(sucursal.id);
        ////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        console.log("##########################################################################");
        console.log("(SELECCION SUCURSAL) SUCURSAL ID:", sucursal.id);
        console.log("(SELECCION SUCURSAL) Usuario ID:", userId);
        ////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////

        // Navegar a la pantalla de volumen pasando la sucursal y userId
        router.push({
            pathname: "/screens/Categoria_Envase",
            params: { sucursalId: sucursal.id, userId },
        });
    };

    const renderSucursal = ({ item }: { item: Sucursal }) => {
        const isSelected = item.id === sucursalSeleccionada;
        return (
            <Pressable
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleSeleccion(item)}
            >
                <Text style={styles.nombre}>{item.nombre}</Text>
                <Text style={styles.direccion}>{item.direccion}</Text>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Seleccione su sucursal</Text>
            <FlatList
                data={sucursales}
                keyExtractor={(item) => item.id}
                renderItem={renderSucursal}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
    card: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: "#f5f5f5",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    cardSelected: {
        borderColor: "#6200ee",
        backgroundColor: "#e0d7ff",
    },
    nombre: { fontSize: 18, fontWeight: "bold" },
    direccion: { fontSize: 14, color: "#555", marginTop: 4 },
});
