import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

type Sucursal = {
    id: string;
    nombre: string;
    direccion: string;
    imagen: string; // nueva propiedad
};

export default function SeleccionSucursalScreen() {
    const router = useRouter();
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string | null>(null);

    const sucursales: Sucursal[] = [
        { id: "1", nombre: "Heladería A", direccion: "Av. Córdoba 1234", imagen: "https://www.compagniedesdesserts.com/wp-content/uploads/como-abrir-una-heladeria.webp" },
        { id: "2", nombre: "Heladería B", direccion: "Calle San Juan 456", imagen: "https://images.adsttc.com/media/images/5f3d/a112/b357/6531/7a00/0246/newsletter/Coolhaus_Ice_Cream.jpg?1597874435" },
        { id: "3", nombre: "Heladería C", direccion: "Av. Rivadavia 789", imagen: "https://themonopolitan.com/wp-content/uploads/2018/07/gelato-dal-cuore-4.png" },
        { id: "4", nombre: "Heladería D", direccion: "Paseo Colón 1800", imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAjKlwUz2pnxJ1Ej3S3ULLAGO5dCW3IsLVxA&s" },
        { id: "5", nombre: "Heladería E", direccion: "Calle 43 y Cabildo", imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu_cc69y1wybOb3epdibyOMxNlMuXiVkFyqw&s" },
        { id: "6", nombre: "Heladería F", direccion: "Av. Moreau D Justo", imagen: "https://files.vilbo.com/img/2024/old/b49e6ca4-4dc0-4fac-9882-56ab7b2bc668.webp" },
        { id: "7", nombre: "Heladería G", direccion: "Calle 13", imagen: "https://cdn.prod.website-files.com/642f26ea0d34e06e4c51fef2/642f26ea0d34e047c051ff66_header_montar-negocio%401280.webp" },
    ];

    const handleSeleccion = (sucursal: Sucursal) => {
        setSucursalSeleccionada(sucursal.id);
        console.log("##########################################################################");
        console.log("(SELECCION SUCURSAL) SUCURSAL ID:", sucursal.id);
        console.log("(SELECCION SUCURSAL) Usuario ID:", userId);
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
                <Image source={{ uri: item.imagen }} style={styles.imagen} />
                <View style={styles.textContainer}>
                    <Text style={styles.nombre}>{item.nombre}</Text>
                    <Text style={styles.direccion}>{item.direccion}</Text>
                </View>
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
        flexDirection: "row",
        alignItems: "center",
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
    imagen: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    nombre: { fontSize: 18, fontWeight: "bold" },
    direccion: { fontSize: 14, color: "#555", marginTop: 4 },
});
