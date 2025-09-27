import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<"cliente" | "vendedor">("cliente");

  return (
    <View style={styles.container}>
      {/* Botón de volver */}
      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => router.push("/")}
      >
        <Text style={styles.backText}>⬅️ Volver al inicio</Text>
      </Pressable>

      <Text style={styles.title}>Login</Text>

      {/* Switch de Cliente / Vendedor */}
      <View style={styles.switchContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.switchButton,
            role === "cliente" && styles.activeButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => setRole("cliente")}
        >
          <Text
            style={[
              styles.switchText,
              role === "cliente" && styles.activeText,
            ]}
          >
            Cliente
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.switchButton,
            role === "vendedor" && styles.activeButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => setRole("vendedor")}
        >
          <Text
            style={[
              styles.switchText,
              role === "vendedor" && styles.activeText,
            ]}
          >
            Vendedor
          </Text>
        </Pressable>
      </View>

      {/* Inputs */}
      <TextInput style={styles.input} placeholder={`Email ${role}`} />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
      />

      {/* Botón de login */}
      <Pressable
        style={({ pressed }) => [
          styles.loginButton,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => router.push("/screens/Seleccion_Sucursal")}
      >
        <Text style={styles.loginText}>
          {role === "cliente"
            ? "Entrar como Cliente"
            : "Entrar como Vendedor"}
        </Text>
      </Pressable>

      {/* Link de registro */}
      <Pressable
        onPress={() =>
          router.push(
            role === "cliente"
              ? "/screens/Registro_Cliente"
              : "/screens/Registro_Vendedor"
          )
        }
      >
        {({ pressed }) => (
          <Text
            style={[
              styles.linkText,
              pressed && { textDecorationLine: "underline" },
            ]}
          >
            {role === "cliente"
              ? "No sos cliente? Registrate"
              : "No sos vendedor? Registrate"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },

  switchContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 25,
    marginBottom: 20,
    overflow: "hidden",
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  switchText: { fontSize: 16, color: "#555" },
  activeButton: { backgroundColor: "#6200ee" },
  activeText: { color: "#fff", fontWeight: "bold" },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "#d3d3d3ff",
    marginBottom: 20,
  },
  backText: { color: "#000000ff", fontSize: 16, fontWeight: "bold" },
  loginText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkText: { textAlign: "center", color: "#007AFF", marginTop: 10 },
});
