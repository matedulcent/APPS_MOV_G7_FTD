import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ActionButton from "../../components/ActionButton";
import PasswordInput from "../../components/PasswordInput";
import { BORDER, CARD_BG, DANGER, INK, MINT, MUTED } from "../../constants/brand";
import { parseApiError } from "../services/apiError";
import { BASE_URL } from "../services/apiConfig";

const { width } = Dimensions.get("window");
const isSmallScreen = width < 400;

type Errors = Partial<{
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  domicilio: string;
  urlImagen: string;
  general: string;
}>;

export default function RegistroVendedor() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [imagenLocal, setImagenLocal] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const isEmail = (s: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

  const isHttpUrl = (s: string) => {
    try {
      const u = new URL(s);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!email.trim()) e.email = "El email es requerido";
    else if (!isEmail(email)) e.email = "Email inválido (ej: nombre@dominio.com)";

    if (!password.trim()) e.password = "La contraseña es requerida";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres";

    if (confirmPassword !== password) e.confirmPassword = "Las contraseñas no coinciden";

    if (nombre && nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres";
    if (direccion && direccion.trim().length < 3) e.domicilio = "Mínimo 3 caracteres";

    if (imagenLocal) {
      if (!isHttpUrl(imagenLocal)) {
        e.urlImagen = "Usa una URL http(s) válida o dejalo vacío";
      }
    }
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setLoading(true);
      const r = await fetch(`${BASE_URL}/api/sucursales/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,                 // back: mail
          password,              // back: contrasena
          domicilio: direccion,  // back: domicilio
          urlImagen: imagenLocal // back: urlImagen
        }),
      });

      if (!r.ok) {
        const msg = await parseApiError(r, "No se pudo completar el registro");
        // Mapear mensajes del back a campos cuando sea posible
        const mapped: Errors = {};
        if (/email.*registrado/i.test(msg) || /email inválido/i.test(msg)) {
          mapped.email = msg;
        } else if (/contraseñ|6 caracteres/i.test(msg)) {
          mapped.password = msg;
        } else if (/imagen/i.test(msg)) {
          mapped.urlImagen = msg;
        } else if (/domicilio/i.test(msg)) {
          mapped.domicilio = msg;
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

  // Helper para aplicar borde rojo cuando hay error
  const withError = (base: any, hasError?: string) => [
    base,
    hasError ? styles.inputError : null,
  ];

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo1.jpg")}
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
            onPress={() => router.push("/")}
          >
            <Text style={styles.backText}>← Volver al inicio</Text>
          </Pressable>

          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/images/icons/HH sin nombre.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Registrá tu heladería</Text>
            <Text style={styles.subtitle}>Empezá a recibir pedidos hoy mismo</Text>

            <View style={styles.form}>
              <TextInput
                style={withError(styles.input, errors.nombre)}
                placeholder="Nombre del local"
                placeholderTextColor="#999"
                value={nombre}
                onChangeText={(t) => { setNombre(t); if (errors.nombre) setErrors({ ...errors, nombre: undefined }); }}
                autoCapitalize="none"
              />
              {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}

              <TextInput
                style={withError(styles.input, errors.email)}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

              <TextInput
                style={withError(styles.input, errors.domicilio)}
                placeholder="Dirección del local"
                placeholderTextColor="#999"
                value={direccion}
                onChangeText={(t) => { setDireccion(t); if (errors.domicilio) setErrors({ ...errors, domicilio: undefined }); }}
                autoCapitalize="none"
              />
              {errors.domicilio ? <Text style={styles.errorText}>{errors.domicilio}</Text> : null}

              <TextInput
                style={withError(styles.input, errors.urlImagen)}
                placeholder="URL de imagen del local (opcional)"
                placeholderTextColor="#999"
                value={imagenLocal}
                onChangeText={(t) => { setImagenLocal(t); if (errors.urlImagen) setErrors({ ...errors, urlImagen: undefined }); }}
                autoCapitalize="none"
              />
              {errors.urlImagen ? <Text style={styles.errorText}>{errors.urlImagen}</Text> : null}

              <PasswordInput
                style={withError(styles.input, errors.password)}
                placeholder="Contraseña"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(t) => { setPassword(t); if (errors.password) setErrors({ ...errors, password: undefined }); }}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

              <PasswordInput
                style={withError(styles.input, errors.confirmPassword)}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined }); }}
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

              {errors.general ? (
                <Text style={[styles.errorText, { textAlign: "center" }]}>{errors.general}</Text>
              ) : null}
            </View>

            <View style={{ marginTop: 8, gap: 12 }}>
              <ActionButton
                label="Registrar heladería"
                icon="storefront-outline"
                color={MINT}
                onPress={handleRegister}
                loading={loading}
              />
              <Pressable onPress={() => router.push("/screens/Log_In")}>
                {({ pressed }) => (
                  <Text style={[styles.linkText, pressed && { textDecorationLine: "underline" }]}>
                    ¿Ya tenés cuenta? Iniciá sesión
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%", resizeMode: "cover" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.06,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  backText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  logoWrap: {
    width: isSmallScreen ? 84 : 96,
    height: isSmallScreen ? 84 : 96,
    borderRadius: 999,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -36,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: { width: "78%", height: "78%" },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: CARD_BG,
    borderRadius: 24,
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: "800",
    textAlign: "center",
    color: INK,
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    color: MUTED,
    marginTop: 4,
    marginBottom: 20,
  },
  form: { gap: 10 },
  input: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#f7f7f9",
    borderWidth: 1,
    borderColor: BORDER,
    fontSize: 14.5,
    color: INK,
  },
  inputError: {
    borderColor: DANGER,
  },
  errorText: {
    color: DANGER,
    fontSize: 12,
    marginTop: -4,
  },
  linkText: {
    textAlign: "center",
    color: MINT,
    fontWeight: "600",
    fontSize: 13.5,
  },
});
