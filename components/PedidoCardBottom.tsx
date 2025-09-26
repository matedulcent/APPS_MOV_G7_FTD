import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from "react-native";

type PedidoCardProps = {
    selecciones?: { [key: string]: string[] };
    visible: boolean;
};

export default function PedidoCardBottom({ selecciones = {}, visible }: PedidoCardProps) {
    const screenHeight = Dimensions.get("window").height;
    const translateY = useRef(new Animated.Value(screenHeight)).current;

    const productosSeleccionados = Object.entries(selecciones)
        .flatMap(([categoria, items]) => items.map((i) => ({ categoria, item: i })));

    // Animación de apertura/cierre
    useEffect(() => {
        Animated.spring(translateY, {
            toValue: visible ? screenHeight - 300 : screenHeight,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    // Drag para cerrar
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            translateY.setValue(Math.max(screenHeight - 400, screenHeight - 300 + gestureState.dy));
        },
        onPanResponderRelease: (_, gestureState) => {
            Animated.spring(translateY, {
                toValue: gestureState.dy > 50 ? screenHeight : screenHeight - 300,
                useNativeDriver: true,
            }).start();
        },
    });

    return (
        <Animated.View
            style={[styles.card, { transform: [{ translateY }] }]}
            {...panResponder.panHandlers}
        >
            <Text style={styles.title}>Pedido</Text>
            <View style={styles.content}>
                {productosSeleccionados.length ? (
                    productosSeleccionados.map(({ categoria, item }) => (
                        <Text key={`${categoria}-${item}`} style={styles.item}>
                            🍦 {item} ({categoria})
                        </Text>
                    ))
                ) : (
                    <Text>No hay productos seleccionados</Text>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 300,
        backgroundColor: "white",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    content: {},
    item: { marginBottom: 6 },
});
