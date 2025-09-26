// components/PedidoCard.tsx
import { useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type PedidoCardProps = {
    selecciones: { [categoria: string]: string[] };
    total?: number;
};

export default function PedidoCard({ selecciones, total = 0 }: PedidoCardProps) {
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
                <ScrollView style={styles.content}>
                    {Object.entries(selecciones).map(([categoria, items]) => (
                        items.length > 0 && (
                            <View key={categoria} style={{ marginBottom: 10 }}>
                                <Text style={styles.categoria}>{categoria}:</Text>
                                {items.map((item) => (
                                    <Text key={item} style={styles.item}>🍦 {item}</Text>
                                ))}
                            </View>
                        )
                    ))}
                    <Text style={styles.total}>Total: ${total}</Text>
                </ScrollView>
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
        marginBottom: 4,
    },
    item: {
        marginLeft: 8,
    },
    total: {
        marginTop: 10,
        fontWeight: "bold",
    },
});
