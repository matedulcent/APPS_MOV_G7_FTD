// app/screens/Numero_Orden.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DANGER, INK, MINT, MUTED, PINK } from "../../constants/brand";
import { BASE_URL } from "../services/apiConfig";
const ORD_BASE = `${BASE_URL}/api/ordenes`;

const { width } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";

const AFTER_NUMBER_REDIRECT_MS = 2000;
const FIRST_TRY_DELAY_MS = 200;
const FETCH_TIMEOUT_MS = 1500;

type OrdenDetalle = {
  id: string;
  fecha: string | null;
  estadoTerminado: boolean;
  sucursalId: string;
  usuarioId: string;
};

export default function Numero_Orden() {
  const router = useRouter();
  const { ordenId, userId } = useLocalSearchParams<{ ordenId?: string; userId?: string }>();

  const numeroSolo = useMemo(
    () => (ordenId || "").toString().replace(/\D/g, "") || (ordenId as string) || "—",
    [ordenId]
  );

  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState<OrdenDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Si no llega ordenId, mandar directo al cliente_tabs
  useEffect(() => {
    if (!ordenId) {
      router.replace({ pathname: "/cliente_tabs", params: { userId: userId || "" } });
    }
  }, [ordenId, router, userId]);

  // Fetch del detalle
  useEffect(() => {
    let cancel = false;
    if (!ordenId) return;

    const getDetalle = async () => {
      try {
        setLoading(true);
        setError(null);

        await new Promise((r) => setTimeout(r, FIRST_TRY_DELAY_MS));

        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

        const url = `${ORD_BASE}/${encodeURIComponent(String(ordenId))}`;
        console.log("[Numero_Orden] GET", url);
        const r = await fetch(url, { signal: ctrl.signal });
        clearTimeout(to);

        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(`GET /api/ordenes/${ordenId} ${r.status}: ${t}`);
        }
        const json: OrdenDetalle = await r.json();
        if (!cancel) setDetalle(json);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "No se pudo leer el pedido.");
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    getDetalle();
    return () => { cancel = true; };
  }, [ordenId]);

  // Redirección automática al historial (cliente_tabs)
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace({
        pathname: "/cliente_tabs", // archivo está en app/
        params: {
          highlightId: (ordenId as string) || "",
          userId: (userId as string) || "",
        },
      });
    }, AFTER_NUMBER_REDIRECT_MS);
    return () => clearTimeout(t);
  }, [router, ordenId, userId]);

  const estadoText = detalle?.estadoTerminado ? "Terminado" : "Pendiente";
  const estadoColor = detalle?.estadoTerminado ? MINT : "#e67e22";

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo3.jpg")}
      style={styles.backgroundImage}
      resizeMode={isSmallScreen ? "stretch" : "cover"}
    >
      <View style={styles.overlay}>
        <View style={styles.ticket}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={40} color={MINT} />
          </View>
          <View style={styles.ticketNotch} />
          <Text style={styles.title}>¡Pedido confirmado!</Text>
          <Text style={styles.subtitle}>Tu número de pedido es:</Text>
          <Text style={styles.orderId}>#{numeroSolo}</Text>

          {loading ? (
            <View style={{ alignItems: "center", gap: 6 }}>
              <ActivityIndicator color={PINK} />
              <Text style={styles.infoText}>Consultando pedido en el servidor…</Text>
            </View>
          ) : error ? (
            <Text style={[styles.infoText, { color: DANGER }]}>{error}</Text>
          ) : (
            <Text style={[styles.infoText, { color: estadoColor, fontWeight: "700" }]}>
              Estado: {estadoText}
            </Text>
          )}

          <Text style={[styles.infoText, { marginTop: 10 }]}>
            En breve serás redirigido a tu historial de pedidos…
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
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  ticket: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    padding: isWeb ? 24 : W * 0.06,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    alignItems: "center",
  },
  iconWrap: { marginBottom: 8 },
  ticketNotch: {
    width: isWeb ? 40 : W * 0.12,
    height: isWeb ? 5 : 4,
    backgroundColor: "#e0e0e6",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: { fontSize: isWeb ? 24 : W * 0.06, fontWeight: "800", marginBottom: 6, color: INK },
  subtitle: { fontSize: isWeb ? 18 : W * 0.045, marginBottom: 10, color: MUTED },
  orderId: { fontSize: isWeb ? 26 : W * 0.07, fontWeight: "800", color: PINK, marginBottom: 8 },
  infoText: { color: MUTED, textAlign: "center" },
});
