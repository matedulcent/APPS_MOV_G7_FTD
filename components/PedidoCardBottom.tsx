import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CARD_BG, INK, MUTED, PINK } from "../constants/brand";

type PedidoCardProps = {
    selecciones?: { [key: string]: string[] | number };
    visible: boolean;
    onConfirm?: () => void;
    currentIndex?: number;   // índice del volumen actual
    totalVolumenes?: number; // cantidad total de volúmenes
};

export default function PedidoCardBottom({
    selecciones = {},
    visible,
    onConfirm,
    currentIndex = 0,
    totalVolumenes = 1,
}: PedidoCardProps) {
    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get("window").height;
    const peekHeight = 60;
    const maxHeight = screenHeight / 2;
    // Estado colapsado: igual que antes (la tira "peek" apenas asoma).
    // Estado expandido: se corre insets.bottom hacia arriba para que el
    // botón de confirmar no quede pegado a la barra de gestos.
    const collapsedY = screenHeight - peekHeight;
    const expandedY = screenHeight - maxHeight - insets.bottom;
    const translateY = useRef(new Animated.Value(collapsedY)).current;

    // Transformamos el diccionario en estructura jerárquica.
    // Las keys de envase pueden venir como "tipoEnvase|Label lindo (#N)";
    // acá solo nos interesa mostrar la parte linda.
    const productosJerarquicos = Object.entries(selecciones).map(([key, value]) => {
        const nombre = key.split("|")[1] ?? key;
        if (typeof value === "number") {
            return { nombre, subitems: Array.from({ length: value }, (_, i) => `Sabor ${i + 1}`) };
        } else if (Array.isArray(value)) {
            return { nombre, subitems: value };
        } else {
            return { nombre, subitems: [] };
        }
    });

    const animateTo = (toValue: number) => {
        Animated.spring(translateY, {
            toValue,
            useNativeDriver: true,
            bounciness: 12,
            speed: 12,
        }).start();
    };

    useEffect(() => {
        animateTo(visible ? expandedY : collapsedY);
    }, [visible]);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            const newY = Math.min(collapsedY, Math.max(expandedY, collapsedY + gestureState.dy));
            translateY.setValue(newY);
        },
        onPanResponderRelease: (_, gestureState) => {
            const shouldClose = gestureState.dy > 50;
            animateTo(shouldClose ? collapsedY : expandedY);
        },
    });

    // Texto dinámico del botón
    const botonTexto =
        currentIndex < (totalVolumenes - 1)
            ? "Confirmar Sabores"
            : "Confirmar Pedido";

    return (
        <Animated.View style={[styles.card, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
            <View style={styles.ticketNotch} />
            <Text style={styles.title}>Pedido</Text>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
                {productosJerarquicos.length ? (
                    productosJerarquicos.map((prod, i) => (
                        <View key={i} style={{ marginBottom: 12 }}>
                            <Text style={styles.itemTitle}>🍦 {prod.nombre}</Text>
                            {prod.subitems.map((sub, j) => (
                                <Text key={j} style={styles.subItem}>• {sub}</Text>
                            ))}
                        </View>
                    ))
                ) : (
                    <Text>No hay productos seleccionados</Text>
                )}
            </ScrollView>

            {onConfirm && (
                <Pressable
                    style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
                    onPress={onConfirm}
                >
                    <Text style={styles.buttonText}>{botonTexto}</Text>
                </Pressable>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        position: "absolute",
        left: 16,
        right: 16,
        height: Dimensions.get("window").height / 2,
        backgroundColor: CARD_BG,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: "#eee",
    },
    ticketNotch: {
        width: 40,
        height: 5,
        backgroundColor: "#e0e0e6",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 10,
    },
    title: { fontSize: 18, fontWeight: "800", marginBottom: 12, textAlign: "center", color: INK },
    content: { maxHeight: Dimensions.get("window").height / 2 - 100 },
    itemTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4, color: INK },
    subItem: { marginLeft: 12, fontSize: 13.5, marginBottom: 2, color: MUTED },
    button: {
        backgroundColor: PINK,
        padding: 14,
        borderRadius: 14,
        marginTop: 10,
        alignItems: "center",
    },
    buttonText: { color: "white", fontWeight: "700", fontSize: 15.5 },
});
