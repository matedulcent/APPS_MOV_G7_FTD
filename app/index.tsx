import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const handleElegirSucursal = () => {
    const userId = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("##########################################################################");
    console.log("(INDEX) Usuario ID:", userId);
    console.log("##########################################################################");

    router.push({
      pathname: "./screens/Seleccion_Sucursal",
      params: { userId },
    });
  };

  const handleVendedorProductos = () => {
    router.push("./proveedor/Vendedor_Productos");
  };

  return (
    <View style={styles.container}>
      <Pressable style={[styles.button, { backgroundColor: "#6200ee" }]} onPress={handleElegirSucursal}>
        <Text style={styles.buttonText}>Elegir Sucursal</Text>
      </Pressable>

      <Pressable style={[styles.button, { backgroundColor: "#03dac6", marginTop: 16 }]} onPress={handleVendedorProductos}>
        <Text style={[styles.buttonText, { color: "#000" }]}>Ir a Panel de Vendedor</Text>
      </Pressable>

      <Text style={styles.text}>🏠 Esta es la pantalla Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-start", padding: 16, paddingTop: 50 },
  text: { fontSize: 20, marginTop: 20, textAlign: "center" },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { fontWeight: "bold", fontSize: 18 },
});
