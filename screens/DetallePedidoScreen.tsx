import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../app/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DetallePedidoScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();
    const { pedido } = route.params as { pedido: string };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Pedido: {pedido}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    text: { fontSize: 18, marginBottom: 20 },
});
