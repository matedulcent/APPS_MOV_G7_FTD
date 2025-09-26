import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type PedidoCardProps = {
    selecciones?: { [key: string]: string[] };
    visible: boolean;
    onConfirm?: () => void;
};

export default function PedidoCardBottom({ selecciones = {}, visible, onConfirm }: PedidoCardProps) {
    const screenHeight = Dimensions.get("window").height;
    const peekHeight = 60;
    const maxHeight = screenHeight / 2;
    const translateY = useRef(new Animated.Value(screenHeight - peekHeight)).current;

    const productosSeleccionados = Object.values(selecciones).flat();

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
                {productosSeleccionados.length ? (
                    productosSeleccionados.map((item, i) => (
                        <Text key={i} style={styles.item}>🍦 {item}</Text>
                    ))
                ) : (
                    <Text>No hay productos seleccionados</Text>
                )}
            </ScrollView>

            {onConfirm && (
                <Pressable style={[styles.button, { backgroundColor: "#6200ee" }]} onPress={onConfirm}>
                    <Text style={styles.buttonText}>Confirmar Pedido</Text>
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
    item: { marginBottom: 8, fontSize: 16 },
    button: {
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: "center",
    },
    buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
