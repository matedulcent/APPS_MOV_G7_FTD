import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const gustos = ["Frutilla al agua", "Banana", "Frambuesa", "Banana Split"];

export default function ListaGustosScreen() {
    return (
        <View style={styles.container}>
            <FlatList
                data={gustos}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>{item}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    item: { padding: 15, borderBottomWidth: 1, borderColor: "#ddd" },
});
