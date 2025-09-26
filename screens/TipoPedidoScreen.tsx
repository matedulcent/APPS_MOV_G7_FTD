import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { RootStackParamList } from "../app/types";
import Dropdown from "../components/Dropdown";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TipoPedidoScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [pedido, setPedido] = useState<string>("");

    return (
        <View style={styles.container}>
            <Dropdown
                label="Selecciona el tipo"
                options={["Cucurucho", "1/4 Kg", "1 Kg", "Vaso"]}
                onSelect={setPedido}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
});
