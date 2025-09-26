import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, PanResponder, ScrollView, StyleSheet, Text, View } from "react-native";

type PedidoCardProps = {
    selecciones?: { [key: string]: string[] };
    visible: boolean;
};

export default function PedidoCardBottom({ selecciones = {}, visible }: PedidoCardProps) {
    const screenHeight = Dimensions.get("window").height;
    const peekHeight = 60; // altura mínima visible
    const maxHeight = screenHeight / 2; // hasta media pantalla
    const translateY = useRef(new Animated.Value(screenHeight - peekHeight)).current;

    const productosSeleccionados = Object.entries(selecciones)
        .flatMap(([categoria, items]) => items.map((i) => ({ categoria, item: i })));

    const animateTo = (toValue: number) => {
        Animated.spring(translateY, {
            toValue,
            useNativeDriver: true,
            bounciness: 12, // efecto de resorte más visible
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
            const shouldClose = gestureState.dy > 50; // si arrastró hacia abajo
            animateTo(shouldClose ? screenHeight - peekHeight : screenHeight - maxHeight);
        },
    });

    return (
        <Animated.View
            style={[styles.card, { transform: [{ translateY }] }]}
            {...panResponder.panHandlers}
        >
            {/* Muesca tipo ticket */}
            <View style={styles.ticketNotch} />
            <Text style={styles.title}>Pedido</Text>

            {/* Scroll de productos */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
                {productosSeleccionados.length ? (
                    productosSeleccionados.map(({ categoria, item }) => (
                        <Text key={`${categoria}-${item}`} style={styles.item}>
                            🍦 {item} ({categoria})
                        </Text>
                    ))
                ) : (
                    <Text>No hay productos seleccionados</Text>
                )}
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        position: "absolute",
        left: 16,
        right: 16,
        height: Dimensions.get("window").height / 2, // media pantalla
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
    content: {
        maxHeight: Dimensions.get("window").height / 2 - 60, // permite scroll dentro del ticket
    },
    item: { marginBottom: 8, fontSize: 16 },
});
