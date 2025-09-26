import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import { RootStackParamList } from "../app/types";
import Dropdown from "../components/Dropdown";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CategoriaGustosScreen() {
    const navigation = useNavigation<NavigationProp>();

    return (
        <View style={styles.container}>
            <Dropdown
                label="Gustos Frutales"
                options={["Frutilla", "Banana", "Frambuesa", "Banana Split"]}
                onSelect={(item) => console.log("Elegido:", item)}
            />
            <Dropdown
                label="Chocolate / DDL"
                options={["Chocolate", "DDL", "Choco amargo"]}
                onSelect={(item) => console.log("Elegido:", item)}
            />
            <Dropdown
                label="Otras Cosas"
                options={["Crema americana", "Granizado"]}
                onSelect={(item) => console.log("Elegido:", item)}
            />
            <BotonPrincipal
                title="Pedido"
                onPress={() => navigation.navigate("ListaGustos")}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
});
