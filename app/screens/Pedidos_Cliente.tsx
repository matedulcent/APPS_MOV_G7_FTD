// app/screens/Pedidos_Cliente.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { BASE_URL } from "../services/apiConfig";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** ===== Tipos mínimos según tu back ===== */
type OrdenResumen = {
  id: string;
  fecha: string | null;
  estadoTerminado: boolean;
  sucursalId: string;
  usuarioId: string;
};

type Envase = { id: string; tipoEnvase?: string | null; nombre?: string | null; tipo?: string | null };
type Sabor  = { id: string; tipoSabor?: string | null; nombre?: string | null; tipo?: string | null };
type Contenido = { id?: number | string; envase: Envase | null; sabor: Sabor | null };

type OrdenDetalle = {
  id: string;
  fecha: string | null;
  estadoTerminado: boolean;
  sucursalId: string;
  usuarioId: string;
  contenidos: Contenido[];
};

/** ====== Helpers de labels (fallbacks robustos) ====== */
function labelEnvase(e?: Envase | null) {
  return e?.tipoEnvase ?? e?.tipo ?? e?.nombre ?? e?.id ?? "—";
}
function labelSabor(s?: Sabor | null) {
  return s?.tipoSabor ?? s?.tipo ?? s?.nombre ?? s?.id ?? "—";
}

/** ====== API helpers alineados al back ====== */
async function fetchOrdenesListado(take = 200): Promise<OrdenResumen[]> {
  const url = `${BASE_URL}/api2/ordenes?take=${take}&_=${Date.now()}`;
  console.log("[Pedidos_Cliente] GET", url);
  const r = await fetch(url);
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`GET /api2/ordenes ${r.status}: ${t}`);
  }
  return r.json();
}

async function fetchOrdenDetalle(id: string): Promise<OrdenDetalle> {
  const url = `${BASE_URL}/api2/ordenes/${encodeURIComponent(id)}?_=${Date.now()}`; // (A) cache-buster
  console.log("[Pedidos_Cliente] GET detalle", url);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET /api2/ordenes/${id} ${r.status}`);
  const det = await r.json();
  console.log("[Pedidos_Cliente] detalle.contenidos =", Array.isArray(det?.contenidos) ? det.contenidos : det); // (C) debug
  return det;
}

/** ========================= COMPONENTE ========================= */
export default function Pedidos_Cliente() {
  const reduxUserId = useSelector((s: RootState) => s.user.userId) || "";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ordenes, setOrdenes] = useState<OrdenResumen[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [detalles, setDetalles] = useState<Record<string, OrdenDetalle | "loading" | "error">>({});

  const cargar = useCallback(async (sutil = false) => {
    try {
      if (!sutil) setLoading(true);

      // Traemos TODAS las órdenes y luego filtramos por usuarioId en el front.
      const list = await fetchOrdenesListado(200);
      list.sort((a, b) =>
        a.fecha && b.fecha ? new Date(b.fecha).getTime() - new Date(a.fecha).getTime() : 0
      );
      setOrdenes(list);
    } catch (e: any) {
      console.log("[Pedidos_Cliente] Error listando:", e?.message || e);
      Alert.alert("Error", e?.message ?? "No se pudieron cargar los pedidos");
    } finally {
      if (!sutil) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    // auto-refresh suave cada 5s
    const it = setInterval(() => cargar(true), 5000);
    return () => clearInterval(it);
  }, [cargar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargar(true);
    setRefreshing(false);
  }, [cargar]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
    // Carga diferida del detalle al expandir por primera vez
    if (!expanded[id] && !detalles[id]) {
      setDetalles((d) => ({ ...d, [id]: "loading" }));
      fetchOrdenDetalle(id)
        .then((det) => setDetalles((d) => ({ ...d, [id]: det })))
        .catch((err) => {
          console.log("[Pedidos_Cliente] Error detalle:", err?.message || err);
          setDetalles((d) => ({ ...d, [id]: "error" }));
        });
    }
  };

  const renderDetalle = (id: string) => {
    if (!expanded[id]) return null;
    const det = detalles[id];

    if (!det || det === "loading") {
      return (
        <View style={styles.detalleBox}>
          <ActivityIndicator />
        </View>
      );
    }
    if (det === "error") {
      return (
        <View style={styles.detalleBox}>
          <Text style={{ color: "#c0392b" }}>No se pudo cargar el detalle.</Text>
        </View>
      );
    }

    const fecha = det.fecha ? new Date(det.fecha) : null;
    return (
      <View style={styles.detalleBox}>
        <Text style={styles.detalleLine}>
          Fecha: {fecha ? `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}` : "—"}
        </Text>
        <Text style={styles.detalleLine}>Sucursal: {det.sucursalId}</Text>

        <ScrollView style={{ maxHeight: height * 0.25 }}>
          {det.contenidos?.length ? (
            det.contenidos.map((c, idx) => (
              <View key={String(c.id ?? idx)} style={styles.itemBox}>
                <Text style={styles.itemLine}>Envase: {labelEnvase(c.envase)}</Text>
                <Text style={styles.itemLine}>Sabor: {labelSabor(c.sabor)}</Text>
              </View>
            ))
          ) : (
            <Text style={{ opacity: 0.6 }}>
              Sin contenidos. (Verificá que el POST cree contenidos con envaseId y saborId)
            </Text>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderItem = ({ item }: { item: OrdenResumen }) => {
    const fecha = item.fecha ? new Date(item.fecha) : null;
    const terminado = item.estadoTerminado;
    const numeroSolo = item.id.replace(/\D/g, "") || item.id; // igual que en sucursal
    const det = detalles[item.id];
    const qty = det && det !== "loading" && det !== "error" ? det.contenidos?.length ?? 0 : undefined;

    return (
      <View style={styles.card}>
        <Pressable style={styles.cardHeader} onPress={() => toggleExpand(item.id)}>
          <Text style={styles.cardTitle}>
            Pedido #{numeroSolo}{expanded[item.id] && typeof qty === "number" ? ` · ${qty} ítem(s)` : ""}
          </Text>
          <Text style={[styles.statusText, { color: terminado ? "#2e7d32" : "#e67e22" }]}>
            {terminado ? "Terminado" : "Pendiente"}
          </Text>
        </Pressable>

        <Text style={styles.cardLine}>
          Fecha: {fecha ? `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}` : "—"}
        </Text>
        <Text style={styles.cardLine}>Sucursal: {item.sucursalId}</Text>

        {renderDetalle(item.id)}

        <Pressable style={styles.verDetalleBtn} onPress={() => toggleExpand(item.id)}>
          <Text style={styles.verDetalleText}>
            {expanded[item.id] ? "Ocultar detalle ▲" : "Ver detalle ▼"}
          </Text>
        </Pressable>

        {/* Debug opcional */}
        <Text style={{ opacity: 0.5, marginTop: 4, fontSize: 12 }}>
          Debug: usuarioIdPedido={item.usuarioId} · userIdRedux={reduxUserId || "(sin user)"}
        </Text>
      </View>
    );
  };

  // Filtro por usuario en el front (si no hay userId o no matchea, mostramos todas para no quedar vacío)
  const dataRender = useMemo(() => {
    if (!reduxUserId) return ordenes;
    const propias = ordenes.filter((o) => (o.usuarioId || "").trim() === reduxUserId.trim());
    return propias.length ? propias : ordenes;
  }, [ordenes, reduxUserId]);

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo3.jpg")}
      style={styles.backgroundImage}
      resizeMode={isSmallScreen ? "stretch" : "cover"}
    >
      <View style={styles.overlay}>
        <View style={styles.ticket}>
          <View style={styles.ticketNotch} />
          <Text style={styles.title}>Mis Pedidos</Text>
          <Text style={{ textAlign: "center", opacity: 0.5, marginBottom: 8 }}>
            Debug userId={reduxUserId || "(sin user)"}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={dataRender}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={<Text style={styles.emptyText}>Aún no tenés pedidos. ¡Hacé el primero!</Text>}
            />
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

/** ========================= STYLES ========================= */
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
    height: isWeb ? 5 : 4,
    backgroundColor: "#ffd54f",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: { fontSize: isWeb ? 22 : width * 0.055, fontWeight: "bold", textAlign: "center", marginBottom: 6 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: isWeb ? 16 : width * 0.04,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontSize: isWeb ? 18 : width * 0.045, fontWeight: "bold" },
  statusText: { fontWeight: "bold" },

  cardLine: { fontSize: isWeb ? 14 : width * 0.038, marginBottom: 2 },
  verDetalleBtn: { marginTop: 8 },
  verDetalleText: { fontWeight: "600", textAlign: "right" },
  emptyText: { textAlign: "center", opacity: 0.7, marginTop: 24 },

  detalleBox: { backgroundColor: "#fffaf0", borderRadius: 10, padding: isWeb ? 12 : width * 0.035, marginTop: 8 },
  itemBox: { backgroundColor: "#fff", borderRadius: 10, padding: isWeb ? 10 : width * 0.03, marginBottom: 6 },
  itemLine: { fontSize: isWeb ? 15 : width * 0.038 },
  detalleLine: { marginBottom: 6, fontSize: isWeb ? 15 : width * 0.038 },
});
