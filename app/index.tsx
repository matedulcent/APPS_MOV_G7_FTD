import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 400 || height < 700; 

export default function HomeScreen() {
  const router = useRouter();

  const handleElegirSucursal = () => {
    const userId = Math.floor(100000 + Math.random() * 900000).toString();
    router.push({
      pathname: "./screens/Seleccion_Sucursal",
      params: { userId },
    });
  };

  const handleVendedorProductos = () => {
    router.push("/screens/proveedor/Vendedor_Envases");
  };

  return (
    <ImageBackground
      source={require("../assets/images/backgrounds/fondo4.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.title}>🏠 Esta es la pantalla Home</Text>

        {/* <Pressable
          style={[styles.actionButton, { backgroundColor: "#6200ee" }]}
          onPress={handleElegirSucursal}
        >
          <Text style={styles.buttonText}>Elegir Sucursal</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { backgroundColor: "#03dac6" }]}
          onPress={handleVendedorProductos}
        >
          <Text style={[styles.buttonText, { color: "#000" }]}>
            Ir a Panel de Vendedor
          </Text>
        </Pressable> */}

        <Text style={styles.infoText}>¿Querés ingresar a tu cuenta?</Text>
        <Pressable
          style={[styles.actionButton, { backgroundColor: "#03a9f4" }]}
          onPress={() => router.push("./screens/Log_In")}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </Pressable>

        <Text style={styles.infoText}>
          Si aún no tenés cuenta, registrate:
        </Text>

        <Text style={styles.infoText}>Quiero comprar:</Text>
        <Pressable
          style={[styles.actionButton, { backgroundColor: "#4caf50" }]}
          onPress={() => router.push("./screens/Registro_Cliente")}
        >
          <Text style={styles.buttonText}>Registro Cliente</Text>
        </Pressable>

        <Text style={styles.infoText}>Quiero vender:</Text>
        <Pressable
          style={[styles.actionButton, { backgroundColor: "#8bc34a" }]}
          onPress={() => router.push("./screens/Registro_Vendedor")}
        >
          <Text style={styles.buttonText}>Registro Heladería</Text>
        </Pressable>
      </View>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 12,
    margin: width * 0.04,
  },
  title: {
    fontSize: isSmallScreen ? 18 : Math.min(width * 0.06, height * 0.04),
    marginBottom: height * 0.03,
    textAlign: "center",
    fontWeight: "bold",
  },
  actionButton: {
    width: "90%",
    paddingVertical: Math.min(height * 0.025, 20),
    borderRadius: 12,
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: isSmallScreen ? 16 : Math.min(width * 0.045, height * 0.03),
    color: "#fff",
  },
  infoText: {
    fontSize: isSmallScreen ? 14 : Math.min(width * 0.04, height * 0.025),
    marginBottom: height * 0.02,
    textAlign: "center",
    fontWeight: "600",
  },
});
