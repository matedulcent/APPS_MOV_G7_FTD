// app/screens/Pedidos_Cliente.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // 👈 para navegar hacia atrás
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ActionButton from "../../components/ActionButton";
import { BORDER, CARD_BG, DANGER, INK, MINT, MUTED, PINK } from "../../constants/brand";
import type { RootState } from "../../redux/store";
import { BASE_URL } from "../services/apiConfig";

const ORD_BASE = `${BASE_URL}/api/ordenes`;

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Tipos mínimos según tu back */
type OrdenResumen = {
  id: string;
  fecha: string | null;
  estadoTerminado: boolean;
  sucursalId: string;
  usuarioId: string;
};
type Envase = { id: string; tipoEnvase?: string | null; nombre?: string | null };
type Sabor = { id: string; tipoSabor?: string | null; nombre?: string | null };
type Contenido = { id?: number | string; envase: Envase | null; sabor: Sabor | null };
type OrdenDetalle = {
  id: string;
  fecha: string | null;
  estadoTerminado: boolean;
  sucursalId: string;
  usuarioId: string;
  contenidos: Contenido[];
};
type SucursalLite = { id: string; nombre?: string | null; domicilio?: string | null };
type UsuarioLite = { id: string; nombre?: string | null; mail?: string | null };

const nombreEnvase = (e?: Envase | null) => e?.tipoEnvase || e?.nombre || e?.id || "—";
const nombreSabor = (s?: Sabor | null) => s?.tipoSabor || s?.nombre || s?.id || "—";

export default function Pedidos_Cliente() {
  const router = useRouter(); // 👈 para volver
  const insets = useSafeAreaInsets();
  const reduxUserId = useSelector((s: RootState) => s.user.userId) || "";
  const reduxUserName = useSelector((s: RootState) => s.user.nombre) || "";

  const [displayName, setDisplayName] = useState<string>(reduxUserName);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ordenes, setOrdenes] = useState<OrdenResumen[]>([]);
  const [abierto, setAbierto] = useState<Record<string, boolean>>({});
  const [detalles, setDetalles] = useState<Record<string, OrdenDetalle | "loading" | "error">>({});
  const [sucMap, setSucMap] = useState<Record<string, SucursalLite>>({});

  const nombreSucursal = (id?: string) =>
    (id && sucMap[id]?.nombre) ? (sucMap[id]!.nombre as string) : (id || "—");

  /** Cargar sucursales */
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/api/sucursales`);
        if (!r.ok) throw new Error(String(r.status));
        const list: SucursalLite[] = await r.json();
        if (cancel) return;
        const map: Record<string, SucursalLite> = {};
        list.forEach((s) => {
          if (s.id) map[s.id] = s;
        });
        setSucMap(map);
      } catch (e) {
        console.log("[Pedidos_Cliente] No se pudo cargar /api/sucursales", e);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  /** Mostrar nombre */
  useEffect(() => {
    let cancel = false;
    if (reduxUserName?.trim()) {
      setDisplayName(reduxUserName.trim());
      return;
    }
    if (!reduxUserId) {
      setDisplayName("");
      return;
    }
    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/api/usuarios/${encodeURIComponent(reduxUserId)}`);
        if (!r.ok) return;
        const u: UsuarioLite = await r.json();
        if (!cancel && u?.nombre) setDisplayName(String(u.nombre));
      } catch {}
    })();
    return () => {
      cancel = true;
    };
  }, [reduxUserId, reduxUserName]);

  /** Obtener órdenes (filtradas por usuario en el back, no todas las de la app) */
  const fetchOrdenes = useCallback(async () => {
    if (!reduxUserId) {
      setOrdenes([]);
      return;
    }
    try {
      setLoading(true);
      const url = `${ORD_BASE}?usuarioId=${encodeURIComponent(reduxUserId)}&take=200&_=${Date.now()}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`GET /api/ordenes ${r.status}`);
      const json: OrdenResumen[] = await r.json();
      setOrdenes(Array.isArray(json) ? json : []);
    } catch (e: any) {
      console.log("[Pedidos_Cliente] Error listando:", e?.message || e);
      Alert.alert("Error", "No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }, [reduxUserId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrdenes();
    setRefreshing(false);
  }, [fetchOrdenes]);

  useEffect(() => {
    fetchOrdenes();
    const it = setInterval(() => fetchOrdenes(), 5000);
    return () => clearInterval(it);
  }, [fetchOrdenes]);

  /** Filtro estricto */
  const misOrdenes = useMemo(() => {
    if (!ordenes?.length || !reduxUserId) return [];
    const uid = reduxUserId.trim().toLowerCase();
    return ordenes.filter((o) => (o.usuarioId || "").trim().toLowerCase() === uid);
  }, [ordenes, reduxUserId]);

  /** Helpers de detalle */
  const cargarDetalle = async (id: string) => {
    try {
      setDetalles((d) => ({ ...d, [id]: "loading" }));
      const r = await fetch(`${ORD_BASE}/${id}`);
      if (!r.ok) throw new Error(`GET /api2/ordenes/${id} ${r.status}`);
      const json: OrdenDetalle = await r.json();
      setDetalles((d) => ({ ...d, [id]: json }));
    } catch {
      setDetalles((d) => ({ ...d, [id]: "error" }));
    }
  };

  const toggleItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAbierto((a) => ({ ...a, [id]: !a[id] }));
    if (!abierto[id] && !detalles[id]) cargarDetalle(id);
  };

  const renderDetalle = (id: string) => {
    const det = detalles[id];
    if (!abierto[id]) return null;
    if (det === "loading" || !det)
      return (
        <View style={styles.detalleBox}>
          <ActivityIndicator />
        </View>
      );
    if (det === "error")
      return (
        <View style={styles.detalleBox}>
          <Text style={{ color: DANGER }}>No se pudo cargar el detalle.</Text>
        </View>
      );

    const fecha = det.fecha ? new Date(det.fecha) : null;
    return (
      <View style={styles.detalleBox}>
        <Text style={styles.detalleLine}>
          Fecha: {fecha ? `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}` : "—"}
        </Text>
        <Text style={styles.detalleLine}>Sucursal: {nombreSucursal(det.sucursalId)}</Text>
        <ScrollView style={{ maxHeight: height * 0.25 }}>
          {det.contenidos?.length ? (
            det.contenidos.map((c, idx) => (
              <View key={String(c.id ?? idx)} style={styles.itemBox}>
                <Text style={styles.itemLine}>Envase: {nombreEnvase(c.envase)}</Text>
                <Text style={styles.itemLine}>Sabor: {nombreSabor(c.sabor)}</Text>
              </View>
            ))
          ) : (
            <Text style={{ opacity: 0.6 }}>Sin contenidos.</Text>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderItem = ({ item }: { item: OrdenResumen }) => {
    const fecha = item.fecha ? new Date(item.fecha) : null;
    const terminado = item.estadoTerminado;
    const numeroSolo = item.id.replace(/\D/g, "") || item.id;

    return (
      <View style={styles.card}>
        <Pressable style={styles.cardHeader} onPress={() => toggleItem(item.id)}>
          <Text style={styles.cardTitle}>Pedido #{numeroSolo}</Text>
          <View style={[styles.pill, { backgroundColor: terminado ? MINT : "#f39c12" }]}>
            <Text style={styles.pillText}>{terminado ? "Terminado" : "Pendiente"}</Text>
          </View>
        </Pressable>
        <Text style={styles.cardLine}>
          Fecha: {fecha ? `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}` : "—"}
        </Text>
        <Text style={styles.cardLine}>Sucursal: {nombreSucursal(item.sucursalId)}</Text>
        {renderDetalle(item.id)}
        <Pressable style={styles.verDetalleBtn} onPress={() => toggleItem(item.id)}>
          <Text style={styles.verDetalleText}>{abierto[item.id] ? "Ocultar detalle" : "Ver detalle"}</Text>
          <Ionicons
            name={abierto[item.id] ? "chevron-up" : "chevron-down"}
            size={16}
            color={PINK}
          />
        </Pressable>
      </View>
    );
  };

  /** === UI === */
return (
  <ImageBackground
    source={require("../../assets/images/backgrounds/fondo3.jpg")}
    style={styles.backgroundImage}
    resizeMode={isSmallScreen ? "stretch" : "cover"}
  >
    <View style={[styles.overlay, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.ticket}>
        <View style={styles.ticketNotch} />
        <Text style={styles.title}>Mis pedidos</Text>
        <Text style={styles.subtitle}>{displayName || "Usuario"}</Text>

        {loading ? (
          <ActivityIndicator size="large" color={PINK} />
        ) : (
          <FlatList
            data={misOrdenes}
            keyExtractor={(it) => it.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PINK} colors={[PINK]} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Todavía no hiciste ningún pedido.</Text>
            }
          />
        )}
      </View>

      <View style={{ width: "60%", marginTop: 14 }}>
        <ActionButton label="Volver" icon="home-outline" variant="ghost" onPress={() => router.replace("/")} />
      </View>
    </View>
  </ImageBackground>
);

}

/** === Estilos === */
const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    alignItems: "center",
    padding: isWeb ? 40 : width * 0.05,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  ticket: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    padding: isWeb ? 20 : width * 0.05,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    flex: 1,
  },
  ticketNotch: {
    width: isWeb ? 40 : width * 0.12,
    height: isWeb ? 5 : 4,
    backgroundColor: "#e0e0e6",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: isWeb ? 22 : width * 0.055,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 2,
    color: INK,
  },
  subtitle: { textAlign: "center", color: MUTED, marginBottom: 8, fontSize: 13 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: isWeb ? 16 : width * 0.04,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: { fontSize: isWeb ? 18 : width * 0.045, fontWeight: "700", color: INK },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  cardLine: { fontSize: isWeb ? 14 : width * 0.038, marginBottom: 2, color: MUTED },
  verDetalleBtn: { marginTop: 8, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 4 },
  verDetalleText: { fontWeight: "600", color: PINK, fontSize: 13 },
  emptyText: { textAlign: "center", color: MUTED, marginTop: 24 },
  detalleBox: {
    backgroundColor: "#faf8fb",
    borderRadius: 12,
    padding: isWeb ? 12 : width * 0.035,
    marginTop: 8,
  },
  itemBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: isWeb ? 10 : width * 0.03,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  itemLine: { fontSize: isWeb ? 15 : width * 0.038, color: INK },
  detalleLine: { marginBottom: 6, fontSize: isWeb ? 15 : width * 0.038, color: MUTED },
});
