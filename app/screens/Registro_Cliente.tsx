import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 400 || height < 700;
const isWeb = Platform.OS === "web";

// Backend en 3001
const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3001" : "http://localhost:3001";

type Errors = Partial<{
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  general: string;
}>;

export default function RegistroCliente() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const isEmail = (s: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

  const validate = (): Errors => {
    const e: Errors = {};
    if (!email.trim()) e.email = "El email es requerido";
    else if (!isEmail(email)) e.email = "Email inválido (ej: nombre@dominio.com)";

    if (!password.trim()) e.password = "La contraseña es requerida";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres";

    if (confirmPassword !== password) e.confirmPassword = "Las contraseñas no coinciden";

    if (nombre && nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres";
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setLoading(true);
      const r = await fetch(`${BASE_URL}/api/usuarios/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });

      if (!r.ok) {
        const msg = (await r.text()) || `Error ${r.status}`;
        // Intento mapear el mensaje del back a un campo
        const mapped: Errors = {};
        if (/email.*registrado/i.test(msg) || /email inválido/i.test(msg)) {
          mapped.email = msg;
        } else if (/contraseñ|6 caracteres/i.test(msg)) {
          mapped.password = msg;
        } else if (/nombre/i.test(msg)) {
          mapped.nombre = msg;
        } else {
          mapped.general = msg;
        }
        setErrors(mapped);
        return;
      }

      // OK → ir al login
      router.replace("/screens/Log_In");
    } catch (err: any) {
      setErrors({ general: err?.message ?? "Error de red" });
    } finally {
      setLoading(false);
    }
  };

  const withError = (base: any, hasError?: string) => [
    base,
    hasError ? styles.inputError : null,
  ];

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
          style={withError(styles.input, errors.nombre)}
          placeholder="Nombre Completo"
          value={nombre}
          onChangeText={(t) => {
            setNombre(t);
            if (errors.nombre) setErrors({ ...errors, nombre: undefined });
          }}
        />
        {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}

        <TextInput
          style={withError(styles.input, errors.email)}
          placeholder="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <TextInput
          style={withError(styles.input, errors.password)}
          placeholder="Contraseña"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          secureTextEntry
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <TextInput
          style={withError(styles.input, errors.confirmPassword)}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={(t) => {
            setConfirmPassword(t);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
          }}
          secureTextEntry
        />
        {errors.confirmPassword ? (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        ) : null}

        {errors.general ? (
          <Text style={[styles.errorText, { textAlign: "center", marginBottom: 6 }]}>
            {errors.general}
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.registerButton, pressed && { opacity: 0.8 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerText}>
            {loading ? "Creando..." : "Registrarse"}
          </Text>
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
    width: "100%",
    height: "100%",
    resizeMode: isSmallScreen ? "stretch" : "cover",
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    padding: isWeb ? 14 : width * 0.04,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: height * 0.008,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: isWeb ? 14 : width * 0.04,
  },
  inputError: {
    borderColor: "#d32f2f",
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: height * 0.01,
    fontSize: isWeb ? 12 : width * 0.035,
  },
  registerButton: {
    backgroundColor: "#4caf50",
    paddingVertical: isWeb ? 12 : height * 0.02,
    borderRadius: 12,
    alignItems: "center",
    marginTop: height * 0.01,
    marginBottom: height * 0.02,
  },
  backButton: {
    paddingVertical: isWeb ? 10 : height * 0.015,
    paddingHorizontal: isWeb ? 20 : width * 0.04,
    borderRadius: 20,
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
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
