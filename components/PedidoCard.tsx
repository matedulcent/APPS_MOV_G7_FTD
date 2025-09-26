import { useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

type PedidoCardProps = {
    selecciones?: { [key: string]: string[] }; // opcional
};

export default function PedidoCard({ selecciones = {} }: PedidoCardProps) {
    const [expanded, setExpanded] = useState(false);

    const safeSelecciones = selecciones || {}; // asegurar objeto
    const total = Object.values(safeSelecciones).reduce(
        (acc, items) => acc + items.length * 1000,
        0
    );

    return (
        <Animated.View
            style={[styles.card, expanded ? styles.expanded : styles.collapsed]}
        >
            <Pressable onPress={() => setExpanded(!expanded)} style={styles.header}>
                <Text style={styles.title}>Pedido {expanded ? "▲" : "▼"}</Text>
            </Pressable>

            {expanded && (
                <View style={styles.content}>
                    {Object.entries(safeSelecciones).map(([categoria, items]) =>
                        items.length > 0 ? (
                            <View key={categoria} style={{ marginBottom: 8 }}>
                                <Text style={styles.categoria}>{categoria}:</Text>
                                {items.map((item) => (
                                    <Text key={`${categoria}-${item}`} style={styles.item}>
                                        🍦 {item}
                                    </Text>
                                ))}
                            </View>
                        ) : null
                    )}
                    <Text style={styles.total}>Total: ${total}</Text>
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
    categoria: {
        fontWeight: "bold",
    },
    item: {
        marginLeft: 8,
    },
    total: {
        marginTop: 10,
        fontWeight: "bold",
    },
});
