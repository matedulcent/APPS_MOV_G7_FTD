import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    ImageBackground,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Dropdown from "../../components/Dropdown";
import PedidoCardBottom from "../../components/PedidoCardBottom";
import ScreenHeader from "../../components/ScreenHeader";
import SearchBar from "../../components/SearchBar";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;

export default function CategoriaGustosScreen() {
    const { pedido, sucursalId, userId } = useLocalSearchParams<{
        pedido: string;
        sucursalId: string;
        userId: string;
    }>();
    const router = useRouter();

    const cucuruchos: { [key: string]: number } = pedido
        ? JSON.parse(decodeURIComponent(pedido))
        : {};

    const cucuruchoKeys = Object.keys(cucuruchos);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selecciones, setSelecciones] = useState<{ [key: string]: string[] }>({});
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState("");

    // ✨ Nuevo estado para popup visual
    const [showPopup, setShowPopup] = useState(true);
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: showPopup ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [showPopup]);

    const categorias = [
        { label: "Frutales", options: ["Frutilla", "Banana", "Frambuesa", "Durazno", "Cereza", "Arándano", "Mango", "Kiwi", "Maracuyá"] },
        { label: "Chocolates", options: ["Chocolate", "Choco blanco", "Chocolate amargo", "Chocolate con almendras", "DDL", "Choco menta"] },
        { label: "Cremas y Dulces", options: ["Crema americana", "Dulce de leche", "Caramelo", "Cheesecake", "Tiramisu", "Vainilla"] },
        { label: "Frutos Secos", options: ["Maní", "Almendra", "Avellana", "Pistacho", "Nuez"] },
        { label: "Exóticos", options: ["Menta granizada", "Café", "Matcha", "Yogur", "Limoncello", "Ron con pasas"] },
    ];

    const categoriasFiltradas = categorias
        .map(cat => ({
            ...cat,
            options: cat.options.filter(op =>
                op.toLowerCase().includes(searchText.toLowerCase())
            ),
        }))
        .filter(cat => cat.options.length > 0);

    const toggleSeleccion = (categoria: string, opcion: string) => {
        const cucurucho = cucuruchoKeys[currentIndex];
        setSelecciones(prev => {
            const prevItems = prev[cucurucho] || [];
            const yaSeleccionado = prevItems.includes(opcion);
            let nuevasOpciones = yaSeleccionado
                ? prevItems.filter(o => o !== opcion)
                : [...prevItems, opcion];

            const maxGustos = cucuruchos[cucurucho];
            if (nuevasOpciones.length > maxGustos)
                nuevasOpciones = nuevasOpciones.slice(0, maxGustos);

            return { ...prev, [cucurucho]: nuevasOpciones };
        });
    };

    const handleConfirm = () => {
        if (currentIndex < cucuruchoKeys.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowPopup(true); // Mostrar popup para el siguiente envase
        } else {
            const pedidoString = encodeURIComponent(JSON.stringify(selecciones));
            console.log("##########################################################################");
            console.log("(SELECCION GUSTOS) SUCURSAL ID:", sucursalId);
            console.log("(SELECCION GUSTOS) Usuario ID:", userId);
            console.log("(SELECCION GUSTOS) Pedido jason:", pedido);
            console.log("(SELECCION GUSTOS) Gustos:", selecciones);
            router.push({
                pathname: "/screens/Detalle_Pedido",
                params: { pedido: pedidoString, sucursalId, userId },
            });
        }
    };

    const cucuruchoActual = cucuruchoKeys[currentIndex];
    const gustosSeleccionados = selecciones[cucuruchoActual] || [];

    return (
        <ImageBackground
            source={require("../../assets/images/backgrounds/fondo2.jpg")}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <ScreenHeader
                    title="Categorías de Gustos"
                    showSearch={showSearch}
                    onToggleSearch={() => setShowSearch(!showSearch)}
                />

                <View style={styles.bannerContainer}>
                    <Text style={styles.bannerText}>
                        Seleccione gustos para:{"\n"}
                        <Text style={styles.envaseText}>{cucuruchoActual}</Text>{" "}
                        ({gustosSeleccionados.length}/{cucuruchos[cucuruchoActual]})
                    </Text>
                </View>

                {showSearch && (
                    <SearchBar
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Buscar gusto..."
                    />
                )}

                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    {categoriasFiltradas.map(cat => (
                        <View key={cat.label} style={styles.dropdownContainer}>
                            <Dropdown
                                label={cat.label}
                                options={cat.options}
                                selected={gustosSeleccionados.filter(g => cat.options.includes(g))}
                                onSelect={item => toggleSeleccion(cat.label, item)}
                            />
                        </View>
                    ))}
                </ScrollView>

                <PedidoCardBottom
                    selecciones={selecciones}
                    visible={true}
                    onConfirm={handleConfirm}
                    currentIndex={currentIndex}
                    totalVolumenes={cucuruchoKeys.length}
                />

                {/* 🌈 POPUP MODAL con animación */}
                <Modal
                    transparent
                    visible={showPopup}
                    animationType="fade"
                    onRequestClose={() => setShowPopup(false)}
                >
                    <View style={styles.modalOverlay}>
                        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
                            <Text style={styles.modalTitle}>¡Nuevo envase!</Text>
                            <Text style={styles.modalText}>
                                Elegí los{" "}
                                <Text style={{ fontWeight: "bold", color: "#e91e63" }}>
                                    {cucuruchos[cucuruchoActual]}
                                </Text>{" "}
                                sabores para el{" "}
                                <Text style={{ fontWeight: "bold", color: "#e91e63" }}>
                                    {cucuruchoActual}
                                </Text>
                                .
                            </Text>

                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setShowPopup(false)}
                            >
                                <Text style={styles.modalButtonText}>Aceptar</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Modal>
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
    overlay: {
        flex: 1,
        padding: isSmallScreen ? 12 : 20,
        backgroundColor: "rgba(255,255,255,0.6)",
    },
    bannerContainer: {
        backgroundColor: "#ffd8d8",
        paddingVertical: height * 0.018,
        paddingHorizontal: width * 0.04,
        borderRadius: 12,
        marginBottom: height * 0.015,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bannerText: {
        fontSize: isSmallScreen ? 14 : 16,
        fontWeight: "700",
        color: "#333",
        textAlign: "center",
    },
    envaseText: {
        fontFamily: "Trebuchet MS",
        fontSize: isSmallScreen ? 18 : 20,
        fontWeight: "900",
        color: "#e91e63",
    },
    dropdownContainer: {
        marginBottom: height * 0.01,
    },
    // 🎨 Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#e91e63",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        textAlign: "center",
        color: "#333",
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: "#e91e63",
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 12,
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
