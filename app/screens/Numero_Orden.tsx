// app/screens/Numero_Orden.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";

/** ====== Configurable ====== */
const AFTER_NUMBER_REDIRECT_MS = 2000; // ⏳ tiempo antes de ir al historial

export default function Numero_Orden() {
  const router = useRouter();
  const { ordenId, userId } = useLocalSearchParams<{ ordenId?: string; userId?: string }>();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace({
        pathname: "/screens/Pedidos_Cliente" as never,
        // ⚠️ pasamos userId para que la lista pueda filtrar aunque Redux no esté listo
        params: { highlightId: (ordenId as string) || "", userId: (userId as string) || "" },
      });
    }, AFTER_NUMBER_REDIRECT_MS);
    return () => clearTimeout(t);
  }, [router, ordenId, userId]);

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo3.jpg")}
      style={styles.backgroundImage}
      resizeMode={isSmallScreen ? "stretch" : "cover"}
    >
      <View style={styles.overlay}>
        <View style={styles.ticket}>
          <View style={styles.ticketNotch} />
          <Text style={styles.title}>¡Pedido Confirmado!</Text>
          <Text style={styles.subtitle}>Tu número de pedido es:</Text>
          <Text style={styles.orderId}>{ordenId}</Text>
          <Text style={styles.infoText}>
            En breve serás redirigido a tu historial de pedidos...
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const { width: W } = Dimensions.get("window");
const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: isWeb ? 40 : W * 0.05,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  ticket: {
    width: "90%",
    backgroundColor: "#fff8e1",
    borderRadius: 16,
    padding: isWeb ? 20 : W * 0.05,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
  },
  ticketNotch: {
    width: isWeb ? 40 : W * 0.12,
    height: isWeb ? 5 : 4,
    backgroundColor: "#ffd54f",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: { fontSize: isWeb ? 24 : W * 0.06, fontWeight: "bold", marginBottom: 6 },
  subtitle: { fontSize: isWeb ? 18 : W * 0.045, marginBottom: 16 },
  orderId: { fontSize: isWeb ? 26 : W * 0.07, fontWeight: "bold", color: "#42e9e9ff", marginBottom: 16 },
  infoText: { opacity: 0.7 },
});
