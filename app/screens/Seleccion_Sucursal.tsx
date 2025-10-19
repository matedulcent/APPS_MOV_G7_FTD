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
    { id: "S1234", nombre: "Heladería A", direccion: "Av. Córdoba 1234", imagen: "..." },
    { id: "S1235", nombre: "Heladería B", direccion: "9 de Julio", imagen: "..." },
    { id: "S1236", nombre: "Heladería C", direccion: "Av. Rivadavia 789", imagen: "..." },
    { id: "S1237", nombre: "Heladería D", direccion: "Paseo Colón 1800", imagen: "..." },
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
            style={styles.backgroundImage}
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
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
        
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
