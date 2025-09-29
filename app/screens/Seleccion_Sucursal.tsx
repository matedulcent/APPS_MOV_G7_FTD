import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, FlatList, Image, ImageBackground, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import ScreenHeader from "../../components/ScreenHeader";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";

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
            resizeMode={isSmallScreen ? "stretch" : "cover"}
        >
            <View style={styles.overlay}>
                <ScreenHeader title="Seleccione su sucursal" />

                <FlatList
                    data={sucursales}
                    keyExtractor={(item) => item.id}
                    renderItem={renderSucursal}
                    contentContainerStyle={{ paddingBottom: height * 0.02, paddingTop: height * 0.01 }}
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width,
        height,
    },
    overlay: {
        flex: 1,
        padding: isWeb ? 40 : width * 0.05,
        backgroundColor: "rgba(255,255,255,0.6)",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: isWeb ? 16 : width * 0.04,
        borderRadius: 10,
        backgroundColor: "#f5f5f5",
        marginBottom: height * 0.015,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    cardSelected: {
        borderColor: "#6200ee",
        backgroundColor: "#e0d7ff",
    },
    imagen: {
        width: isWeb ? 80 : width * 0.18,
        height: isWeb ? 80 : width * 0.18,
        borderRadius: 10,
        marginRight: isWeb ? 16 : width * 0.04,
    },
    textContainer: {
        flex: 1,
    },
    nombre: {
        fontSize: isWeb ? 18 : width * 0.045,
        fontWeight: "bold",
    },
    direccion: {
        fontSize: isWeb ? 14 : width * 0.035,
        color: "#555",
        marginTop: height * 0.005,
    },
});
