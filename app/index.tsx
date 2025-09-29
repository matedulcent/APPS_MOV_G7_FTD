import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 400;

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
      <ImageBackground
        source={require("../assets/images/backgrounds/fondo4.jpg")}
        style={styles.backgroundImage}
      />

      <Text style={styles.title}>🏠 Esta es la pantalla Home</Text>

      <Pressable style={[styles.actionButton, { backgroundColor: "#6200ee" }]} onPress={handleElegirSucursal}>
        <Text style={styles.loginText}>Elegir Sucursal</Text>
      </Pressable>

      <Pressable
        style={[styles.actionButton, { backgroundColor: "#03dac6", marginTop: height * 0.02 , marginBottom: height * 0.06 }]}
        onPress={handleVendedorProductos}
      >
        <Text style={[styles.loginText, { color: "#000" }]}>
          Ir a Panel de Vendedor
        </Text>
      </Pressable>

      <Text style={styles.infoText}>¿Querés ingresar a tu cuenta?</Text>
      <Pressable
        style={styles.loginButton}
        onPress={() => router.push("./screens/Log_In")}
      >
        <Text style={styles.loginText}>Log In</Text>
      </Pressable>

      <Text style={styles.infoText}>Si aún no tenés cuenta, registrate: </Text>

      <Text style={styles.infoText}>Quiero comprar: </Text>
      <Pressable
        style={styles.registerButton}
        onPress={() => router.push("./screens/Registro_Cliente")}
      >
        <Text style={styles.loginText}>Registro Cliente</Text>
      </Pressable>

      <Text style={styles.infoText}>Quiero vender: </Text>
      <Pressable
        style={styles.registerButton}
        onPress={() => router.push("./screens/Registro_Vendedor")}
      >
        <Text style={styles.loginText}>Registro Heladería</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: width * 0.05,
    paddingTop: height * 0.06,
    backgroundColor: "rgba(224,224,224,0.7)",
    borderRadius: 10,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    resizeMode: isSmallScreen ? "stretch" : "cover",
  },
  title: {
    fontSize: isSmallScreen ? 18 : width * 0.06,
    marginTop: height * 0.02,
    marginBottom: height * 0.025,
    textAlign: "center",
    fontWeight: "bold",
  },
  actionButton: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.06,
    borderRadius: 12,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#03a9f4",
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  registerButton: {
    backgroundColor: "#4caf50",
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  loginText: {
    fontWeight: "bold",
    fontSize: width * 0.045,
    color: "#fff",
  },
  infoText: {
    fontSize: width * 0.04,
    marginBottom: height * 0.015,
    textAlign: "center",
    fontWeight: "bold",
  },
});
