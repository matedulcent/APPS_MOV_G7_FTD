import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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
    <View style={styles.container}>
      <TouchableOpacity
            style={[styles.backButton]}
            onPress={() => router.push("/")}
            >
            <Text style={styles.backText}>⬅️ Volver al inicio</Text>
      </TouchableOpacity>

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

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/screens/Log_In")}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 30 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  registerButton: {
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
  registerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkText: { textAlign: "center", color: "#007AFF", marginTop: 10 },
});
