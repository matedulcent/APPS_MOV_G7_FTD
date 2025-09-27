import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

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
    router.push("/screens/proveedor/Vendedor_Envases");
  };

  return (
    
    <View style={styles.container}>
      <ImageBackground source={require("../assets/images/backgrounds/fondo4.jpg")} style={styles.backgroundImage}/>
      <Text style={styles.text}>🏠 Esta es la pantalla Home</Text>

      <Pressable style={[styles.button, { backgroundColor: "#6200ee" }]} onPress={handleElegirSucursal}>
        <Text style={styles.buttonText}>Elegir Sucursal</Text>
      </Pressable>

      <Pressable style={[styles.button, { backgroundColor: "#03dac6", marginTop: 16 }]} onPress={handleVendedorProductos}>
        <Text style={[styles.buttonText, { color: "#000" }]}>Ir a Panel de Vendedor</Text>
      </Pressable>

      
      <Text style={styles.text}>¿Querés ingresar a tu cuenta?</Text>
      <Pressable
        style={[styles.button, styles.logInBox]}
        onPress={() => router.push("./screens/Log_In")}
      >
        <Text style={styles.buttonText}>Log In</Text>
      </Pressable>

      <Text style={styles.text}>Si aún no tenes cuenta, registrate: </Text>

      <Text style={styles.textInfo}>Quiero comprar: </Text>
      <Pressable
        style={[styles.button, styles.registerBox]}
        onPress={() => router.push("./screens/Registro_Cliente")}
      >
        <Text style={styles.buttonText}>Registro Cliente</Text>
      </Pressable>

      <Text style={styles.textInfo}>Quiero vender: </Text>
      <Pressable
        style={[styles.button, styles.registerBox]}
        onPress={() => router.push("./screens/Registro_Vendedor")}
      >
        <Text style={styles.buttonText}>Registro Heladería</Text>
      </Pressable>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-start", padding: 16, paddingTop: 50 },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  text: { fontSize: 20, marginTop: 20, marginBottom: 10, textAlign: "center" },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  logInBox: {
    backgroundColor: "#03a9f4", marginBottom: 20,
  },
  registerBox: {
    backgroundColor: "#4caf50", marginBottom: 20,
  },
  textInfo: { fontSize: 18, marginBottom: 10, textAlign: "center", fontWeight: "bold" },
  buttonText: { fontWeight: "bold", fontSize: 18 },
});
