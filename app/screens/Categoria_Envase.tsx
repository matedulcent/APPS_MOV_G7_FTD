// CategoriaVolumenScreen.tsx
import React, { useEffect, useState } from "react";
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
import { BACKEND_URL } from "../config";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";

interface Seleccion {
    opcion: string;
    cantidad: number;
}

interface EnvaseDB {
    id: string;
    tipoEnvase: string;
    maxCantSabores: number;
    icon?: "icecream" | "whatshot" | "local-drink";
}

export default function CategoriaVolumenScreen({ route, navigation }: any) {
    // Recuperamos userId desde la ruta, fallback a "1"
    const { userId: routeUserId } = route.params || {};
    const [userId, setUserId] = useState<string>(routeUserId || "1");
    const [userData, setUserData] = useState<any>(null);

    const [envases, setEnvases] = useState<EnvaseDB[]>([]);
    const [selecciones, setSelecciones] = useState<{ [key: string]: Seleccion[] }>({});

    // ✅ Traer usuario
    useEffect(() => {
        if (!userId) return;
        const fetchUser = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/usuarios/${userId}`);
                if (!res.ok) throw new Error("No se pudo obtener el usuario");
                const data = await res.json();
                setUserData(data);
                console.log("✅ Usuario cargado:", data);
            } catch (err) {
                console.error("Error al obtener usuario:", err);
            }
        };
        fetchUser();
    }, [userId]);

    // ✅ Traer envases desde backend
    useEffect(() => {
        const fetchEnvases = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/envases`);
                if (!res.ok) throw new Error("No se pudieron obtener los envases");
                const data: EnvaseDB[] = await res.json();
                setEnvases(data);

                // Inicializamos selecciones
                const initSelecciones: { [key: string]: Seleccion[] } = {};
                data.forEach(e => {
                    initSelecciones[e.tipoEnvase] = [];
                });
                setSelecciones(initSelecciones);
            } catch (err) {
                console.error("Error al cargar envases:", err);
            }
        };
        fetchEnvases();
    }, []);

    const toggleSeleccion = (categoria: string, opcion: string) => {
        setSelecciones(prev => {
            const prevItems = prev[categoria] || [];
            const existe = prevItems.find(i => i.opcion === opcion);
            const nuevasOpciones = existe
                ? prevItems.filter(i => i.opcion !== opcion)
                : [...prevItems, { opcion, cantidad: 1 }];
            return { ...prev, [categoria]: nuevasOpciones };
        });
    };

    const updateCantidad = (categoria: string, opcion: string, delta: number) => {
        setSelecciones(prev => ({
            ...prev,
            [categoria]: prev[categoria].map(i =>
                i.opcion === opcion ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i
            ),
        }));
    };

    const handleConfirm = () => {
        const haySelecciones = Object.values(selecciones).some(cat => cat.length > 0);
        if (!haySelecciones) {
            Alert.alert("Atención", "Debes seleccionar al menos un envase antes de continuar.", [{ text: "Aceptar" }]);
            return;
        }

        const pedidoFinal: { [key: string]: number } = {};
        Object.entries(selecciones).forEach(([categoria, items]) => {
            const envase = envases.find(e => e.tipoEnvase === categoria);
            const maxSabores = envase?.maxCantSabores || 1;
            items.forEach(({ opcion, cantidad }) => {
                for (let i = 1; i <= cantidad; i++) {
                    pedidoFinal[`${categoria} ${i} (${opcion})`] = maxSabores;
                }
            });
        });

        const pedidoString = encodeURIComponent(JSON.stringify(pedidoFinal));
        navigation.push("Categoria_Gustos", { pedido: pedidoString, userId });
    };

    return (
        <ImageBackground
            source={require("../../assets/images/backgrounds/fondo1.jpg")}
            style={styles.backgroundImage}
            resizeMode={isSmallScreen ? "stretch" : "cover"}
        >
            <View style={styles.overlay}>
                <ScreenHeader title={`Seleccionar Envase${userData ? ` - ${userData.nombre}` : ""}`} />

                <FlatList
                    data={envases}
                    keyExtractor={item => item.tipoEnvase}
                    contentContainerStyle={{ paddingBottom: height * 0.15 }}
                    renderItem={({ item }) => (
                        <View style={{ marginBottom: height * 0.03 }}>
                            <Dropdown
                                label={item.tipoEnvase}
                                options={["1 bola", "2 bolas", "3 bolas", "4 bolas"].slice(0, item.maxCantSabores)}
                                selected={selecciones[item.tipoEnvase].map(i => i.opcion)}
                                onSelect={op => toggleSeleccion(item.tipoEnvase, op)}
                                icon={item.icon}
                            />
                            {selecciones[item.tipoEnvase].map(({ opcion, cantidad }) => (
                                <View key={opcion} style={styles.itemRow}>
                                    <Text style={styles.itemText}>{opcion}</Text>
                                    <View style={styles.counter}>
                                        <Pressable
                                            style={styles.counterButton}
                                            onPress={() => updateCantidad(item.tipoEnvase, opcion, -1)}
                                        >
                                            <Text style={styles.counterText}>-</Text>
                                        </Pressable>
                                        <Text style={styles.counterValue}>{cantidad}</Text>
                                        <Pressable
                                            style={styles.counterButton}
                                            onPress={() => updateCantidad(item.tipoEnvase, opcion, 1)}
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
                    <Pressable style={[styles.button, { backgroundColor: "#f4679fff" }]} onPress={handleConfirm}>
                        <Text style={[styles.buttonText, { fontSize: isWeb ? 16 : width * 0.045 }]}>Siguiente</Text>
                    </Pressable>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, width: "100%", height: "100%", resizeMode: "cover" },
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
