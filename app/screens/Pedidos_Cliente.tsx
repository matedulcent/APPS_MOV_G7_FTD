// app/screens/Pedidos_Cliente.tsx
import React, { useCallback, useMemo, useState } from "react";
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
import { BASE_URL } from "../services/apiConfig"; // usa tu BASE_URL fijo

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
type Contenido = {
  envase: { id: string; tipoEnvase?: string | null };
  sabor: { id: string; tipoSabor?: string | null };
};
type OrdenDetalle = {
  id: string;
  fecha: string | null;
  estadoTerminado: boolean;
  sucursalId: string;
  usuarioId: string;
  contenidos: Contenido[];
};

export default function Pedidos_Cliente() {
  const reduxUserId = useSelector((s: RootState) => s.user.userId) || "";
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ordenes, setOrdenes] = useState<OrdenResumen[]>([]);
  const [abierto, setAbierto] = useState<Record<string, boolean>>({});
  const [detalles, setDetalles] = useState<Record<string, OrdenDetalle | "loading" | "error">>({});

  /** === Listar TODAS las órdenes (después filtramos por usuario) === */
  const fetchOrdenes = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${BASE_URL}/api/ordenes?take=200&_=${Date.now()}`;
      console.log("[Pedidos_Cliente] GET", url);
      const r = await fetch(url);
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`GET /ordenes ${r.status}: ${t}`);
      }
      const json: OrdenResumen[] = await r.json();
      console.log("[Pedidos_Cliente] total back:", json?.length);
      setOrdenes(Array.isArray(json) ? json : []);
    } catch (e: any) {
      console.log("[Pedidos_Cliente] Error listando:", e?.message || e);
      Alert.alert("Error", "No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrdenes();
    setRefreshing(false);
  }, [fetchOrdenes]);

  React.useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

  /** === Filtro: si no hay userId o no hay match, mostramos TODO para no quedar vacíos === */
  const misOrdenes = useMemo(() => {
    console.log("[Pedidos_Cliente] resolvedUserId =", reduxUserId);

    if (!ordenes || !ordenes.length) {
      console.log("[Pedidos_Cliente] sin datos todavía");
      return [];
    }

    if (!reduxUserId) {
      console.log("[Pedidos_Cliente] sin userId; mostrando TODAS las órdenes");
      return ordenes;
    }

    const list = ordenes.filter(
      (o) => (o.usuarioId || "").trim() === reduxUserId.trim()
    );

    if (!list.length) {
      console.log(
        `[Pedidos_Cliente] no hay pedidos del userId=${reduxUserId}, mostrando todas para debug`
      );
      return ordenes;
    }

    console.log(
      `[Pedidos_Cliente] filtradas para userId=${reduxUserId} => ${list.length}`
    );
    return list;
  }, [ordenes, reduxUserId]);

  /** === Helpers de detalle === */
  const cargarDetalle = async (id: string) => {
    try {
      setDetalles((d) => ({ ...d, [id]: "loading" }));
      const url = `${BASE_URL}/api/ordenes/${id}`;
      console.log("[Pedidos_Cliente] GET detalle", url);
      const r = await fetch(url);
      if (!r.ok) throw new Error(`GET /ordenes/${id} ${r.status}`);
      const json: OrdenDetalle = await r.json();
      setDetalles((d) => ({ ...d, [id]: json }));
    } catch (e) {
      console.log("[Pedidos_Cliente] Error detalle:", e);
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
    if (det === "loading" || !det) {
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
          {det.contenidos.map((c, idx) => (
            <View key={idx} style={styles.itemBox}>
              <Text style={styles.itemLine}>Envase: {c.envase?.tipoEnvase || c.envase?.id}</Text>
              <Text style={styles.itemLine}>Sabor: {c.sabor?.tipoSabor || c.sabor?.id}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderItem = ({ item }: { item: OrdenResumen }) => {
    const fecha = item.fecha ? new Date(item.fecha) : null;
    const terminado = item.estadoTerminado;
    return (
      <View style={styles.card}>
        <Pressable style={styles.cardHeader} onPress={() => toggleItem(item.id)}>
          <Text style={styles.cardTitle}>Pedido {item.id}</Text>
          <View style={[styles.pill, { backgroundColor: terminado ? "#43a047" : "#f39c12" }]}>
            <Text style={styles.pillText}>{terminado ? "Terminado" : "Pendiente"}</Text>
          </View>
        </Pressable>
        <Text style={styles.cardLine}>
          Fecha: {fecha ? `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}` : "—"}
        </Text>
        <Text style={styles.cardLine}>Sucursal: {item.sucursalId}</Text>
        {renderDetalle(item.id)}
        <Pressable style={styles.verDetalleBtn} onPress={() => toggleItem(item.id)}>
          <Text style={styles.verDetalleText}>
            {abierto[item.id] ? "Ocultar detalle ▲" : "Ver detalle ▼"}
          </Text>
        </Pressable>
      </View>
    );
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
          <Text style={styles.title}>Mis Pedidos</Text>
          <Text style={{ textAlign: "center", opacity: 0.5, marginBottom: 8 }}>
            Debug userId={reduxUserId || "(sin user)"}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={misOrdenes}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Aún no tenés pedidos. ¡Hacé el primero!
                </Text>
              }
            />
          )}
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
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { color: "#fff", fontWeight: "bold" },
  cardLine: { fontSize: isWeb ? 14 : width * 0.038, marginBottom: 2 },
  verDetalleBtn: { marginTop: 8 },
  verDetalleText: { fontWeight: "600", textAlign: "right" },
  emptyText: { textAlign: "center", opacity: 0.7, marginTop: 24 },
  detalleBox: { backgroundColor: "#fffaf0", borderRadius: 10, padding: isWeb ? 12 : width * 0.035, marginTop: 8 },
  itemBox: { backgroundColor: "#fff", borderRadius: 10, padding: isWeb ? 10 : width * 0.03, marginBottom: 6 },
  itemLine: { fontSize: isWeb ? 15 : width * 0.038 },
  detalleLine: { marginBottom: 6, fontSize: isWeb ? 15 : width * 0.038 },
});
