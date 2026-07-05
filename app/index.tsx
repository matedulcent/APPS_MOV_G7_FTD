import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ActionButton from "../components/ActionButton";
import { BORDER, CARD_BG, DANGER, INK, MINT, MUTED, MUTED_LIGHT, PINK } from "../constants/brand";
import { logOut } from "../redux/actions/userActions";
import { RootState } from "../redux/store";

const { width } = Dimensions.get("window");
const isSmallScreen = width < 400;

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const insets = useSafeAreaInsets();

  const handleLoginPress = () => router.push("./screens/Log_In");
  const handleRegistroCliente = () => router.push("./screens/Registro_Cliente");
  const handleRegistroVendedor = () => router.push("./screens/Registro_Vendedor");

  const handleExplorarMenu = () => router.push("./screens/Seleccion_Sucursal");

  const handleElegirSucursal = () => {
    if (user.loggedIn && user.role === "cliente" && user.userId) {
      router.push({
        pathname: "./screens/Seleccion_Sucursal",
        params: { userId: user.userId },
      });
    }
  };

  const handleIrAPanelVendedor = () => {
    if (user.loggedIn && user.role === "vendedor" && user.sucursalId) {
      router.push({
        pathname: "./screens/proveedor/Pedidos_Sucursal",
        params: { sucursalId: user.sucursalId },
      });
    }
  };

  const handleLogout = () => {
    dispatch(logOut());
    router.replace("/");
  };

  return (
    <ImageBackground
      source={require("../assets/images/backgrounds/fondo4.jpg")}
      style={styles.backgroundImage}
    >
      <View style={[styles.overlay, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.logoWrap}>
          <Image
            source={require("../assets/images/icons/HH sin nombre.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.brand}>Helados Hermanos</Text>
          <Text style={styles.subtitle}>
            {user.loggedIn
              ? `¡Hola, ${user.nombre || (user.role === "vendedor" ? "heladería" : "vecino")}! 🍦`
              : "Pedí o vendé helado, todo desde acá"}
          </Text>

          <View style={styles.divider} />

          {!user.loggedIn && (
            <View style={styles.section}>
              <ActionButton
                label="Ver sabores y envases sin registrarte"
                icon="ice-cream-outline"
                variant="outline"
                color={MINT}
                onPress={handleExplorarMenu}
              />
              <Text style={styles.sectionLabel}>o si ya tenés cuenta</Text>
              <ActionButton label="Iniciar sesión" icon="log-in-outline" onPress={handleLoginPress} />
              <Text style={styles.sectionLabel}>¿No tenés cuenta todavía?</Text>
              <ActionButton
                label="Registrarme como cliente"
                icon="person-add-outline"
                variant="outline"
                color={PINK}
                onPress={handleRegistroCliente}
              />
              <ActionButton
                label="Registrar mi heladería"
                icon="storefront-outline"
                variant="outline"
                color={MINT}
                onPress={handleRegistroVendedor}
              />
            </View>
          )}

          {user.loggedIn && user.role === "cliente" && (
            <View style={styles.section}>
              <ActionButton label="Elegir sucursal" icon="ice-cream-outline" onPress={handleElegirSucursal} />
              <ActionButton
                label="Cerrar sesión"
                icon="log-out-outline"
                variant="ghost"
                color={DANGER}
                onPress={handleLogout}
              />
            </View>
          )}

          {user.loggedIn && user.role === "vendedor" && (
            <View style={styles.section}>
              <ActionButton
                label="Ir a mi panel"
                icon="storefront-outline"
                color={MINT}
                onPress={handleIrAPanelVendedor}
              />
              <ActionButton
                label="Cerrar sesión"
                icon="log-out-outline"
                variant="ghost"
                color={DANGER}
                onPress={handleLogout}
              />
            </View>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%", resizeMode: "cover" },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.06,
  },
  logoWrap: {
    width: isSmallScreen ? 96 : 116,
    height: isSmallScreen ? 96 : 116,
    borderRadius: 999,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -40,
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
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  brand: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: "800",
    textAlign: "center",
    color: INK,
  },
  subtitle: {
    fontSize: isSmallScreen ? 13 : 14,
    textAlign: "center",
    color: MUTED,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 20,
  },
  section: { gap: 12 },
  sectionLabel: {
    textAlign: "center",
    fontSize: 12,
    color: MUTED_LIGHT,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: -2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
