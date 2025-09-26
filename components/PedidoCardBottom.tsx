import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type PedidoCardProps = {
    selecciones?: { [key: string]: string[] | number };
    visible: boolean;
    onConfirm?: () => void;
};

export default function PedidoCardBottom({ selecciones = {}, visible, onConfirm }: PedidoCardProps) {
    const screenHeight = Dimensions.get("window").height;
    const peekHeight = 60;
    const maxHeight = screenHeight / 2;
    const translateY = useRef(new Animated.Value(screenHeight - peekHeight)).current;

    // Transformamos el diccionario en estructura jerárquica
    const productosJerarquicos = Object.entries(selecciones).map(([key, value]) => {
        if (typeof value === "number") {
            return { nombre: key, subitems: Array.from({ length: value }, (_, i) => `Sabor ${i + 1}`) };
        } else if (Array.isArray(value)) {
            return { nombre: key, subitems: value };
        } else {
            return { nombre: key, subitems: [] };
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
        animateTo(visible ? screenHeight - maxHeight : screenHeight - peekHeight);
    }, [visible]);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            const newY = Math.min(screenHeight - peekHeight, Math.max(screenHeight - maxHeight, screenHeight - peekHeight + gestureState.dy));
            translateY.setValue(newY);
        },
        onPanResponderRelease: (_, gestureState) => {
            const shouldClose = gestureState.dy > 50;
            animateTo(shouldClose ? screenHeight - peekHeight : screenHeight - maxHeight);
        },
    });

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
                <Pressable style={[styles.button, { backgroundColor: "#6200ee" }]} onPress={onConfirm}>
                    <Text style={styles.buttonText}>Confirmar Sabores</Text>
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
        backgroundColor: "#fff8e1",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#ffd54f",
    },
    ticketNotch: {
        width: 40,
        height: 5,
        backgroundColor: "#ffd54f",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 10,
    },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
    content: { maxHeight: Dimensions.get("window").height / 2 - 100 },
    itemTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
    subItem: { marginLeft: 12, fontSize: 14, marginBottom: 2 },
    button: {
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: "center",
    },
    buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
