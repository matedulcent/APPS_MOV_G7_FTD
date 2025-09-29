import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, ImageBackground, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";

export default function RegistroCliente() {
  const router = useRouter(); 
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    router.push("/screens/Log_In");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo1.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          onPress={() => router.push("/")}
        >
          <Text style={styles.backText}>⬅️ Volver al inicio</Text>
        </Pressable>

        <Text style={styles.title}>Registro de Cliente</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre Completo"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Pressable
          style={({ pressed }) => [styles.registerButton, pressed && { opacity: 0.8 }]}
          onPress={handleRegister}
        >
          <Text style={styles.registerText}>Registrarse</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/screens/Log_In")}>
          {({ pressed }) => (
            <Text style={[styles.linkText, pressed && { textDecorationLine: "underline" }]}>
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
          )}
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: isWeb ? 40 : width * 0.05,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: isWeb ? 0 : 10,
    width: "100%",
    alignSelf: "stretch",
  },
  title: {
    fontSize: isWeb ? 32 : isSmallScreen ? 20 : width * 0.07,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.04,
  },
  backgroundImage: {
    flex: 1,
    width,
    height,
    resizeMode: isSmallScreen ? "stretch" : "cover",
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    padding: isWeb ? 14 : width * 0.04,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: isWeb ? 14 : width * 0.04,
  },
  registerButton: {
    backgroundColor: "#4caf50",
    paddingVertical: isWeb ? 12 : height * 0.02,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: height * 0.025,
  },
  backButton: {
    paddingVertical: isWeb ? 10 : height * 0.015,
    paddingHorizontal: isWeb ? 20 : width * 0.04,
    borderRadius: 20,
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "#d3d3d3ff",
    marginBottom: height * 0.025,
  },
  backText: {
    color: "#000000ff",
    fontSize: isWeb ? 14 : width * 0.04,
    fontWeight: "bold",
  },
  registerText: {
    color: "#fff",
    fontSize: isWeb ? 18 : width * 0.05,
    fontWeight: "bold",
  },
  linkText: {
    textAlign: "center",
    color: "#007AFF",
    marginTop: height * 0.015,
    fontSize: isWeb ? 14 : width * 0.04,
  },
});
