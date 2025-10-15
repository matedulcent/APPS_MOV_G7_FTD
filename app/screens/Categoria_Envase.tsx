import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    ImageBackground,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Dropdown from "../../components/Dropdown";
import ScreenHeader from "../../components/ScreenHeader";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";

export default function CategoriaVolumenScreen() {
    const { sucursalId, userId } = useLocalSearchParams<{ sucursalId: string; userId: string }>();
    const router = useRouter();

    const [selecciones, setSelecciones] = useState<{ [key: string]: { opcion: string; cantidad: number }[] }>({
        Cucuruchos: [],
        Kilos: [],
        Vasos: [],
    });

    const categorias = [
        { label: "Cucuruchos", options: ["1 bola", "2 bolas", "3 bolas", "4 bolas"], icon: "icecream" as const },
        { label: "Kilos", options: ["1/4 Kg", "1/2 Kg", "1 Kg"], icon: "whatshot" as const },
        { label: "Vasos", options: ["1 bola", "2 bolas", "3 bolas", "4 bolas"], icon: "local-drink" as const },
    ];

    const cantidadSabores: { [key: string]: number } = { Cucuruchos: 0, Kilos: 4, Vasos: 0 };

    const toggleSeleccion = (categoria: string, opcion: string) => {
        setSelecciones(prev => {
            const prevItems = prev[categoria] || [];
            const existe = prevItems.find(i => i.opcion === opcion);
            let nuevasOpciones = existe
                ? prevItems.filter(i => i.opcion !== opcion)
                : [...prevItems, { opcion, cantidad: 1 }];
            return { ...prev, [categoria]: nuevasOpciones };
        });
    };

    const updateCantidad = (categoria: string, opcion: string, delta: number) => {
        setSelecciones(prev => {
            const nuevasOpciones = prev[categoria].map(item =>
                item.opcion === opcion
                    ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
                    : item
            );
            return { ...prev, [categoria]: nuevasOpciones };
        });
    };

    const handleConfirm = () => {
        // 🧩 Verificar si no hay ningún envase seleccionado
        const haySelecciones = Object.values(selecciones).some(cat => cat.length > 0);

        if (!haySelecciones) {
            Alert.alert(
                "Atención",
                "Debes seleccionar al menos un envase antes de continuar.",
                [{ text: "Aceptar", style: "default" }]
            );
            return; // 👈 Detiene el flujo
        }

        // ✅ Si hay envases seleccionados, seguimos
        const pedidoFinal: { [key: string]: number } = {};
        Object.entries(selecciones).forEach(([categoria, items]) => {
            items.forEach(({ opcion, cantidad }) => {
                let sabores = cantidadSabores[categoria] || 1;
                if (categoria === "Cucuruchos" || categoria === "Vasos") sabores = parseInt(opcion[0]);
                for (let i = 1; i <= cantidad; i++) pedidoFinal[`${categoria} ${i} (${opcion})`] = sabores;
            });
        });

        const pedidoString = encodeURIComponent(JSON.stringify(pedidoFinal));
        console.log("(SELECCION ENVASE) SUCURSAL ID:", sucursalId);
        console.log("(SELECCION ENVASE) Usuario ID:", userId);
        console.log("(SELECCION ENVASE) Pedido:", pedidoFinal);

        router.push({
            pathname: "/screens/Categoria_Gustos",
            params: { pedido: pedidoString, sucursalId, userId },
        });
    };

    return (
        <ImageBackground
            source={require("../../assets/images/backgrounds/fondo1.jpg")}
            style={styles.backgroundImage}
            resizeMode={isSmallScreen ? "stretch" : "cover"}
        >
            <View style={styles.overlay}>
                <ScreenHeader title="Seleccionar Envase" />

                <FlatList
                    data={categorias}
                    keyExtractor={item => item.label}
                    contentContainerStyle={{ paddingBottom: height * 0.15 }}
                    renderItem={({ item: cat }) => (
                        <View style={{ marginBottom: height * 0.03 }}>
                            <Dropdown
                                label={cat.label}
                                options={cat.options}
                                selected={selecciones[cat.label].map(i => i.opcion)}
                                onSelect={item => toggleSeleccion(cat.label, item)}
                                icon={cat.icon}
                            />
                            {selecciones[cat.label].map(({ opcion, cantidad }) => (
                                <View key={opcion} style={styles.itemRow}>
                                    <Text style={styles.itemText}>{opcion}</Text>
                                    <View style={styles.counter}>
                                        <Pressable
                                            style={styles.counterButton}
                                            onPress={() => updateCantidad(cat.label, opcion, -1)}
                                        >
                                            <Text style={styles.counterText}>-</Text>
                                        </Pressable>
                                        <Text style={styles.counterValue}>{cantidad}</Text>
                                        <Pressable
                                            style={styles.counterButton}
                                            onPress={() => updateCantidad(cat.label, opcion, 1)}
                                        >
                                            <Text style={styles.counterText}>+</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                />

                <View style={[styles.footer, { bottom: height * 0.13 }]}>
                    <Pressable
                        style={[styles.button, { backgroundColor: "#f4679fff" }]}
                        onPress={handleConfirm}
                    >
                        <Text style={[styles.buttonText, { fontSize: isWeb ? 16 : width * 0.045 }]}>
                            Siguiente
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    overlay: { flex: 1, padding: isWeb ? 40 : width * 0.05, backgroundColor: "rgba(255,255,255,0.6)" },

    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: height * 0.008,
        padding: isWeb ? 10 : width * 0.03,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    itemText: { fontSize: isWeb ? 16 : width * 0.045 },
    counter: { flexDirection: "row", alignItems: "center" },
    counterButton: {
        backgroundColor: "#eee",
        paddingHorizontal: isWeb ? 8 : width * 0.03,
        paddingVertical: isWeb ? 4 : height * 0.008,
        borderRadius: 4,
        marginHorizontal: width * 0.015,
    },
    counterText: { fontSize: isWeb ? 18 : width * 0.05, fontWeight: "bold" },
    counterValue: { fontSize: isWeb ? 16 : width * 0.045, fontWeight: "bold", minWidth: width * 0.06, textAlign: "center" },

    footer: { position: "absolute", left: isWeb ? 40 : width * 0.05, right: isWeb ? 40 : width * 0.05 },
    button: { backgroundColor: "#6200ee", paddingVertical: isWeb ? 14 : height * 0.022, borderRadius: 8, alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "bold" },
});
