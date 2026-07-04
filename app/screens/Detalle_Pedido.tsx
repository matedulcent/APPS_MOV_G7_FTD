// app/screens/Detalle_Pedido.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ActionButton from "../../components/ActionButton";
import { INK, MUTED, PINK } from "../../constants/brand";
import type { AppDispatch, RootState } from "../../redux/store";
import { parseApiError } from "../services/apiError";
import { BASE_URL } from "../services/apiConfig";

/** ====== Configurable ====== */
const AFTER_CONFIRM_REDIRECT_MS = 2000; // ⏳ tiempo de espera antes de redirigir

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";

type PedidoItem = { envaseId: string; saborId: string };

async function crearOrden(payload: {
  usuarioId: string;
  sucursalId: string;
  items: { envaseId: string; saborId: string }[];
}) {
  const url = `${BASE_URL}/api/ordenes`;
  console.log("[crearOrden] POST", url, payload);

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  console.log("[crearOrden] status:", r.status);

  if (!r.ok) {
    throw new Error(await parseApiError(r, "No se pudo crear la orden"));
  }

  const text = await r.text().catch(() => "");

  // Soporta respuesta nueva { id, ... } o vieja { ok, ordenId }
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch {}
  const ordenId = data?.id ?? data?.ordenId;
  console.log("[crearOrden] ordenId resuelto:", ordenId);
  return { ordenId, data };
}

// === Mapeo dinámico de envases (sin hardcodear tipos/tamaños) ===
async function getEnvasesMap(): Promise<Record<string, string>> {
  const url = `${BASE_URL}/api/envases`;
  try {
    const r = await fetch(url);
    const list = await r.json();
    // genera: { "cucurucho_1": "B1", "especial_pija": "e_xxx", ... }
    const map: Record<string, string> = {};
    (list || []).forEach((e: any) => {
      const tipo = (e?.tipoEnvase || "").toString().trim().toLowerCase();
      const id = (e?.id || "").toString();
      if (tipo && id) map[tipo] = id;
    });
    return map;
  } catch (e) {
    console.log("[getEnvasesMap] Error:", e);
    return {};
  }
}

// === Mapeo dinámico de sabores (sin hardcodear) ===
async function getSaboresMap(): Promise<Record<string, string>> {
  const url = `${BASE_URL}/api/sabores`;
  try {
    const r = await fetch(url);
    const list = await r.json();
    // genera: { "pera": "S_xxx", "chocolate": "S_yyy", ... }
    const map: Record<string, string> = {};
    (list || []).forEach((s: any) => {
      const name = (s?.tipoSabor || "").toString().trim().toLowerCase();
      const id = (s?.id || "").toString();
      if (name && id) map[name] = id;
    });
    return map;
  } catch (e) {
    console.log("[getSaboresMap] Error:", e);
    return {};
  }
}


export default function DetallePedidoScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [enviando, setEnviando] = useState(false);

  // ✅ Selecciones y envases del pedido
  const selecciones = useSelector((state: RootState) => state.pedido.selecciones);
  const envases = useSelector((state: RootState) => state.pedido.envases);

  // ✅ Usuario
  const usuarioId = useSelector((state: RootState) => state.user.userId);

  // ✅ sucursalId: cascada param -> pedidoSlice -> user.sucursalId (vendedor)
  const { sucursalId: sucursalIdParam } = useLocalSearchParams<{ sucursalId?: string }>();
  const sucursalIdFromPedido = useSelector((state: RootState) => (state as any)?.pedido?.sucursalId);
  const sucursalIdUser = useSelector((state: RootState) => state.user.sucursalId);
  const sucursalId = (sucursalIdParam as string) || sucursalIdFromPedido || sucursalIdUser || "";

  console.log("[DetallePedido] sucursalId (param/pedido/user):", {
    sucursalIdParam,
    sucursalIdFromPedido,
    sucursalIdUser,
    usado: sucursalId,
  });

  // ✅ Filtramos envases vacíos
  const pedidoObj: Record<string, string[]> = useMemo(() => {
    const res: Record<string, string[]> = {};
    envases.forEach((e) => {
      const gustos = selecciones[e.opcion] ?? [];
      if (gustos.length > 0) {
        res[e.opcion] = gustos;
      }
    });
    return res;
  }, [envases, selecciones]);

  // Confirmar pedido
  const handleConfirmar = async () => {
    try {
      if (!usuarioId || !sucursalId) {
        Alert.alert("Error", "No se pudo identificar al usuario o la sucursal.");
        console.log("[handleConfirmar] FALTA usuarioId o sucursalId", { usuarioId, sucursalId });
        return;
      }

      const items: PedidoItem[] = [];
      const saboresSinMapeo: string[] = [];
      const envasesSinMapeo: string[] = [];
      // obtener los mapas dinámicos de envases y sabores desde el backend
      const [envasesMap, saboresMap] = await Promise.all([getEnvasesMap(), getSaboresMap()]);

      for (const [envaseKey, gustos] of Object.entries(pedidoObj)) {
        // envaseKey viene como "tipoEnvase|Label lindo (#N)"
        const [tipoEnvase, labelLindo] = envaseKey.split("|");
        const envaseId = envasesMap[tipoEnvase.trim().toLowerCase()] || null;
        if (!envaseId) {
          envasesSinMapeo.push(labelLindo ?? envaseKey);
          continue;
        }
        for (const g of gustos) {
          const saborId = saboresMap[g.trim().toLowerCase()] || null;

          if (!saborId) {
            saboresSinMapeo.push(g);
            continue;
          }
          items.push({ envaseId, saborId });
        }
      }

      if (envasesSinMapeo.length) {
        Alert.alert("Envases no reconocidos", `No se pudieron mapear: ${envasesSinMapeo.join(", ")}`);
        console.log("[handleConfirmar] envases sin mapeo:", envasesSinMapeo);
        return;
      }

      if (saboresSinMapeo.length) {
        Alert.alert("Sabores no reconocidos", `No se pudieron mapear: ${saboresSinMapeo.join(", ")}`);
        console.log("[handleConfirmar] sabores sin mapeo:", saboresSinMapeo);
        return;
      }

      if (items.length === 0) {
        Alert.alert("Pedido vacío", "No hay ítems válidos para guardar.");
        console.log("[handleConfirmar] Pedido vacío (items=0)");
        return;
      }

      setEnviando(true);

      const { ordenId } = await crearOrden({ usuarioId, sucursalId, items });
      if (!ordenId) {
        throw new Error("El servidor no devolvió el ID de la orden.");
      }
      console.log("[handleConfirmar] Creada OK. ordenId:", ordenId);

      // 1) Mostramos la pantalla del número
      router.push({
        pathname: "/screens/Numero_Orden",
        params: { userId: usuarioId, sucursalId, ordenId },
      });

      // 2) Y luego de X ms redirigimos al historial único
      setTimeout(() => {
        router.replace({ pathname: "/screens/Pedidos_Cliente" as never });
      }, AFTER_CONFIRM_REDIRECT_MS);

    } catch (e: any) {
      console.log("[handleConfirmar] Error:", e?.message);
      Alert.alert("Error", e?.message ?? "No se pudo crear la orden.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo3.jpg")}
      style={styles.backgroundImage}
      resizeMode={isSmallScreen ? "stretch" : "cover"}
    >
      <View style={styles.overlay}>
        <View style={styles.ticket}>
          <View style={styles.ticketNotch} />
          <Text style={styles.title}>Detalle del Pedido</Text>

          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(pedidoObj).map(([envase, gustos]) => (
              <View key={envase} style={{ marginBottom: height * 0.015 }}>
                <Text style={styles.cucuruchoTitle}>{envase.split("|")[1] ?? envase}</Text>
                {gustos.map((gusto, i) => (
                  <Text key={i} style={styles.item}>
                    🍦 {gusto}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={{ marginTop: 10, gap: 10 }}>
            <ActionButton
              label="Confirmar pedido"
              icon="checkmark-circle-outline"
              onPress={handleConfirmar}
              loading={enviando}
              disabled={enviando}
            />
            <ActionButton
              label="Volver"
              icon="arrow-back"
              variant="outline"
              onPress={() => router.back()}
              disabled={enviando}
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: isWeb ? 40 : width * 0.05,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  ticket: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    padding: isWeb ? 24 : width * 0.06,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    flex: 1,
  },
  ticketNotch: {
    width: isWeb ? 40 : width * 0.12,
    height: isWeb ? 5 : height * 0.008,
    backgroundColor: "#e0e0e6",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: isWeb ? 22 : width * 0.055,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: height * 0.02,
    color: INK,
  },
  cucuruchoTitle: {
    fontSize: isWeb ? 18 : width * 0.045,
    fontWeight: "700",
    marginBottom: height * 0.005,
    textAlign: "center",
    color: PINK,
  },
  content: { flexGrow: 1 },
  item: {
    fontSize: isWeb ? 16 : width * 0.04,
    marginLeft: width * 0.03,
    marginBottom: height * 0.005,
    color: MUTED,
  },
});
