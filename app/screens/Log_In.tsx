import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
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

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<"cliente" | "vendedor">("cliente");
  const slideAnim = useState(new Animated.Value(0))[0];
  const [switchWidth, setSwitchWidth] = useState(0);

  const handleSwitch = (selectedRole: "cliente" | "vendedor") => {
    const targetValue = selectedRole === "cliente" ? 0 : 1;

    Animated.timing(slideAnim, {
      toValue: targetValue,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setRole(selectedRole));
  };

  const handleLogin = () => {
    if (role === "cliente") {
      router.push("/screens/Seleccion_Sucursal");
    } else {
      router.push("/screens/proveedor/Vendedor_Envases");
    }
  };

  const handleRegister = () => {
    if (role === "cliente") {
      router.push("/screens/Registro_Cliente");
    } else {
      router.push("/screens/Registro_Vendedor");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo4.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          onPress={() => router.push("/")}
        >
          <Text style={styles.backText}>⬅️ Volver al inicio</Text>
        </Pressable>

        <Text style={styles.title}>Login</Text>

        {/* SWITCH */}
        <View
          style={styles.switchContainer}
          onLayout={(e) => setSwitchWidth(e.nativeEvent.layout.width)}
        >
          <Animated.View
            style={[
              styles.indicator,
              {
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, switchWidth / 2],
                    }),
                  },
                ],
              },
            ]}
          />

          <Pressable style={styles.switchButton} onPress={() => handleSwitch("cliente")}>
            <Text style={[styles.switchText, role === "cliente" && styles.activeText]}>
              Cliente
            </Text>
          </Pressable>

          <Pressable style={styles.switchButton} onPress={() => handleSwitch("vendedor")}>
            <Text style={[styles.switchText, role === "vendedor" && styles.activeText]}>
              Vendedor
            </Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder={`Email ${role}`}
          keyboardType="email-address"
        />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry />

        <Pressable
          style={({ pressed }) => [styles.loginButton, pressed && { opacity: 0.8 }]}
          onPress={handleLogin}
        >
          <Text style={styles.loginText}>
            {role === "cliente" ? "Entrar como Cliente" : "Entrar como Vendedor"}
          </Text>
        </Pressable>

        <Pressable onPress={handleRegister}>
          {({ pressed }) => (
            <Text style={[styles.linkText, pressed && { textDecorationLine: "underline" }]}>
              {role === "cliente"
                ? "No sos cliente? Registrate"
                : "No sos vendedor? Registrate"}
            </Text>
          )}
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const isSmallScreen = width < 360;

const isWeb = Platform.OS === "web";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: isWeb ? 40 : width * 0.05,
    backgroundColor: "rgba(224,224,224,0.7)",
    borderRadius: isWeb ? 0 : 10, // sin bordes en web, sí en mobile
    width: "100%", // que ocupe todo el ancho
    alignSelf: "stretch", // fuerza a expandirse
  },
  title: {
    fontSize: isWeb ? 32 : isSmallScreen ? 20 : width * 0.07,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.04,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
    resizeMode: isSmallScreen ? "stretch" : "cover",
  },
  switchContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 25,
    marginBottom: height * 0.025,
    overflow: "hidden",
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "#2a7091",
    borderRadius: 25,
    zIndex: 0,
  },
  switchButton: {
    flex: 1,
    paddingVertical: isWeb ? 10 : height * 0.018,
    alignItems: "center",
    zIndex: 1,
  },
  switchText: {
    fontSize: isWeb ? 16 : width * 0.04,
    color: "#555",
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
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
  loginButton: {
    backgroundColor: "#03a9f4",
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
  loginText: {
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