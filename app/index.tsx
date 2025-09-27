import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏠 Esta es la pantalla Home</Text>
      <Pressable
        style={styles.button}
        onPress={() => router.push("./screens/Seleccion_Sucursal")}
      >
        <Text style={styles.buttonText}>Elegir Sucursal</Text>
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
  text: { fontSize: 20, marginTop: 20 },
  textInfo: { fontSize: 16, marginTop: 30 },
  button: {
    marginBlock: 8,
    marginTop: 30,
    backgroundColor: "#6200ee",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  logInBox: {marginTop: 30 },
  registerBox: {marginTop: 10 },

});
