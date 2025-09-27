import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import ScreenHeader from "../../components/ScreenHeader";

type Sucursal = {
    id: string;
    nombre: string;
    direccion: string;
    imagen: string;
};

export default function SeleccionSucursalScreen() {
    const router = useRouter();
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string | null>(null);

    const sucursales: Sucursal[] = [
        { id: "1", nombre: "Heladería A", direccion: "Av. Córdoba 1234", imagen: "https://www.compagniedesdesserts.com/wp-content/uploads/como-abrir-una-heladeria.webp" },
        { id: "2", nombre: "Heladería B", direccion: "9 de Julio", imagen: "https://images.adsttc.com/media/images/5f3d/a112/b357/6531/7a00/0246/newsletter/Coolhaus_Ice_Cream.jpg?1597874435" },
        { id: "3", nombre: "Heladería C", direccion: "Av. Rivadavia 789", imagen: "https://themonopolitan.com/wp-content/uploads/2018/07/gelato-dal-cuore-4.png" },
        { id: "4", nombre: "Heladería D", direccion: "Paseo Colón 1800", imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAjKlwUz2pnxJ1Ej3S3ULLAGO5dCW3IsLVxA&s" },
        { id: "5", nombre: "Heladería E", direccion: "Calle 13", imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu_cc69y1wybOb3epdibyOMxNlMuXiVkFyqw&s" },
        { id: "6", nombre: "Heladería F", direccion: "Av. Moreau D Justo", imagen: "https://cdn.prod.website-files.com/642f26ea0d34e06e4c51fef2/642f26ea0d34e047c051ff66_header_montar-negocio%401280.webp" },
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
        <ImageBackground
            source={require("../../assets/images/backgrounds/fondo3.jpg")}
            style={styles.background}
            resizeMode="cover"
        >
            {/* Overlay semitransparente para mejorar legibilidad */}
            <View style={styles.overlay}>
                {/* Header consistente con otras pantallas */}
                <ScreenHeader title="Seleccione su sucursal" />

                <FlatList
                    data={sucursales}
                    keyExtractor={(item) => item.id}
                    renderItem={renderSucursal}
                    contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    overlay: {
        flex: 1,
        padding: 20,
    },
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
