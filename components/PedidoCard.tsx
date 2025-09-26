// components/PedidoCard.tsx
import { useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export default function PedidoCard() {
    const [expanded, setExpanded] = useState(false);

    return (
        <Animated.View
            style={[
                styles.card,
                expanded ? styles.expanded : styles.collapsed,
            ]}
        >
            <Pressable onPress={() => setExpanded(!expanded)} style={styles.header}>
                <Text style={styles.title}>Pedido</Text>
            </Pressable>

            {expanded && (
                <View style={styles.content}>
                    <Text>🍦 Chocolate amargo</Text>
                    <Text>🍦 Granizado</Text>
                    <Text>Total: $2500</Text>
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    collapsed: {
        height: 60,
    },
    expanded: {
        height: 300,
    },
    header: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },
    content: {
        padding: 16,
    },
});
