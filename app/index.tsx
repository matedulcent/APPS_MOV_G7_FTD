import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const handleElegirSucursal = () => {
    // Generar un ID de cliente aleatorio
    const clientId = Math.floor(100000 + Math.random() * 900000).toString();

    // Navegar a la pantalla de selección de sucursal pasando el clientId
    router.push({
      pathname: "./screens/Seleccion_Sucursal",
      params: { clientId },
    });
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handleElegirSucursal}>
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
