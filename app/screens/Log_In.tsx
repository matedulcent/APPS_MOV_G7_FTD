import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<"cliente" | "vendedor">("cliente");

  return (
    <View style={styles.container}>
        
      <TouchableOpacity
            style={styles.backButton} 
            onPress={() => router.push("/")}
            >
            <Text style={styles.backText}>⬅️ Volver al inicio</Text>
      </TouchableOpacity>


      <Text style={styles.title}>Login</Text>

      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[styles.switchButton, role === "cliente" && styles.activeButton]}
          onPress={() => setRole("cliente")}
        >
          <Text style={[styles.switchText, role === "cliente" && styles.activeText]}>
            Cliente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, role === "vendedor" && styles.activeButton]}
          onPress={() => setRole("vendedor")}
        >
          <Text style={[styles.switchText, role === "vendedor" && styles.activeText]}>
            Vendedor
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={`Email ${role}`}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push("/screens/Seleccion_Sucursal")}
      >
        <Text style={styles.loginText}>
          {role === "cliente" ? "Entrar como Cliente" : "Entrar como Vendedor"}
        </Text>
      </TouchableOpacity>


      <TouchableOpacity
        onPress={() =>
          router.push(role === "cliente" ? "/screens/Registro_Cliente" : "/screens/Registro_Vendedor")
        }
      >
        <Text style={styles.linkText}>
          {role === "cliente"
            ? "No sos cliente? Registrate"
            : "No sos vendedor? Registrate"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 30 },

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
