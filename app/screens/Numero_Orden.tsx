import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

export default function NumeroOrdenScreen() {
  const router = useRouter();

  // ✅ ahora también leemos ordenId
  const { pedido, sucursalId, userId, ordenId } = useLocalSearchParams<{
    pedido?: string;
    sucursalId?: string;
    userId?: string;
    ordenId?: string;
  }>();

  const [numeroOrden, setNumeroOrden] = useState<number>(0);

  useEffect(() => {
    if (ordenId) {
      // ✅ si viene del backend, mostramos ese ID (solo los dígitos)
      const soloNumeros = Number(ordenId.replace(/\D/g, ""));
      setNumeroOrden(soloNumeros || Number(ordenId));
      console.log("🟢 Orden creada con ID real:", ordenId);
    } else {
      // fallback local si no vino nada
      const orden = Math.floor(1000 + Math.random() * 9000);
      setNumeroOrden(orden);
      console.log("🟡 Orden local (sin ID del backend):", orden);
    }

    console.log("##########################################################################");
    console.log("(NUMERO ORDEN) SUCURSAL ID:", sucursalId);
    console.log("(NUMERO ORDEN) Usuario ID:", userId);
    console.log("(NUMERO ORDEN) Pedido Completo:", pedido);
    console.log("(NUMERO ORDEN) Orden ID (real):", ordenId);
    console.log("##########################################################################");
  }, [sucursalId, userId, pedido, ordenId]);

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo4.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>¡Pedido Confirmado!</Text>

        {/* ✅ muestra el ID real o el número generado */}
        <Text style={styles.numero}>Orden #: {numeroOrden}</Text>

        <Pressable
          style={[styles.button, { backgroundColor: "#f4679fff", marginTop: 12 }]}
          onPress={() => router.push("/")}
        >
          <Text style={styles.buttonText}>Volver a Inicio</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  numero: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#ff5722",
    fontFamily: "Trebuchet MS",
  },
  button: {
    backgroundColor: "#f4679fff",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
