// app/screens/Detalle_Pedido.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import type { AppDispatch, RootState } from "../../redux/store";
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
  const text = await r.text().catch(() => "");
  console.log("[crearOrden] body:", text);

  if (!r.ok) {
    throw new Error(`Error ${r.status}: ${text || "No se pudo crear la orden"}`);
  }

  // Soporta respuesta nueva { id, ... } o vieja { ok, ordenId }
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch {}
  const ordenId = data?.id ?? data?.ordenId;
  console.log("[crearOrden] ordenId resuelto:", ordenId);
  return { ordenId, data };
}

// Mapeo de envases
function mapEnvaseKeyToId(key: string): string {
  const [categoria] = key.split(" ");
  if (categoria.toLowerCase().includes("cucurucho")) {
    const bolas = parseInt(key.match(/\((\d)\s+bolas?\)/)?.[1] ?? "1", 10);
    return { 1: "B1", 2: "B2", 3: "B3", 4: "B4" }[bolas] ?? "B1";
  }
  if (categoria.toLowerCase().includes("vaso")) {
    const bolas = parseInt(key.match(/\((\d)\s+bolas?\)/)?.[1] ?? "1", 10);
    return { 1: "B8", 2: "B9", 3: "B10", 4: "B11" }[bolas] ?? "B8";
  }
  if (categoria.toLowerCase().includes("kilo")) {
    const opt = key.match(/\(([^)]+)\)/)?.[1]?.trim();
    if (opt === "1/4 Kg") return "B6";
    if (opt === "1/2 Kg") return "B5";
    if (opt === "1 Kg") return "B7";
  }
  return "B1";
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
      // obtener el mapa dinámico de sabores desde el backend
      const saboresMap = await getSaboresMap();


      for (const [envaseKey, gustos] of Object.entries(pedidoObj)) {
        const envaseId = mapEnvaseKeyToId(envaseKey);
        for (const g of gustos) {
          const saborId = saboresMap[g.trim().toLowerCase()] || null;

          if (!saborId) {
            saboresSinMapeo.push(g);
            continue;
          }
          items.push({ envaseId, saborId });
        }
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
        pathname: "./Numero_Orden",
        params: { userId: usuarioId, sucursalId, ordenId },
      });

      
      setTimeout(() => {
        router.replace({ pathname: "/index" as never });
      }, AFTER_CONFIRM_REDIRECT_MS);

    } catch (e: any) {
      console.error("[handleConfirmar] ERROR:", e);
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
                <Text style={styles.cucuruchoTitle}>{envase}</Text>
                {gustos.map((gusto, i) => (
                  <Text key={i} style={styles.item}>
                    🍦 {gusto}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={{ marginTop: 10 }}>
            <Pressable
              style={[styles.button, { backgroundColor: enviando ? "#8fdede" : "#42e9e9ff" }]}
              onPress={handleConfirmar}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator />
              ) : (
                <Text style={[styles.buttonText, { fontSize: isWeb ? 18 : width * 0.045 }]}>
                  Confirmar Pedido
                </Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: "#f4679fff", marginTop: 10 }]}
              onPress={() => router.back()}
              disabled={enviando}
            >
              <Text style={[styles.buttonText, { fontSize: isWeb ? 16 : width * 0.04 }]}>
                Volver
              </Text>
            </Pressable>
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
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  ticket: {
    width: "90%",
    backgroundColor: "#fff8e1",
    borderRadius: 16,
    padding: isWeb ? 20 : width * 0.05,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    flex: 1,
  },
  ticketNotch: {
    width: isWeb ? 40 : width * 0.12,
    height: isWeb ? 5 : height * 0.008,
    backgroundColor: "#ffd54f",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: isWeb ? 22 : width * 0.055,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.02,
  },
  cucuruchoTitle: {
    fontSize: isWeb ? 18 : width * 0.045,
    fontWeight: "bold",
    marginBottom: height * 0.005,
    textAlign: "center",
  },
  content: { flexGrow: 1 },
  item: {
    fontSize: isWeb ? 16 : width * 0.04,
    marginLeft: width * 0.03,
    marginBottom: height * 0.005,
  },
  button: {
    paddingVertical: isWeb ? 12 : height * 0.02,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: isWeb ? 16 : width * 0.04 },
});
