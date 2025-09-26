import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => router.push("./screens/Seleccion_Sucursal")}
      >
        <Text style={styles.buttonText}>Elegir Sucursal</Text>
      </Pressable>

      <Text style={styles.text}>🏠 Esta es la pantalla Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-start", padding: 16, paddingTop: 50 },
  text: { fontSize: 20, marginTop: 20 },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});
