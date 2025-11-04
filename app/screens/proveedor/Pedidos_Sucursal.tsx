import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { LOG_OUT } from "../../../redux/types/userTypes";
import { BASE_URL } from "./../../services/apiConfig";

type Sucursal = { id: string; nombre: string };
type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Sabor = { id: string; tipoSabor: string };
type Contenido = { id: number; envase: Envase | null; sabor: Sabor | null };

type OrdenLite = {
  id: string;
  fecha?: string | null;
  estadoTerminado: boolean;
  sucursalId: string;
  usuarioId: string;
};
type OrdenFull = OrdenLite & { contenidos: Contenido[] };

// ============================ API helpers ==============================
async function fetchSucursal(id: string): Promise<Sucursal> {
  const url = `${BASE_URL}/api/sucursales/${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo obtener la sucursal");
  return res.json();
}

async function confirmAsync(title: string, message: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: "Terminar", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

async function fetchOrdenesRobusto(take = 50, sucursalId?: string): Promise<OrdenLite[]> {
  if (!sucursalId) throw new Error("Falta sucursalId");
  let url = `${BASE_URL}/api/ordenes/sucursal/${encodeURIComponent(sucursalId)}?take=${take}`;
  let r = await fetch(url);
  if (r.ok) return r.json();
  const q = new URLSearchParams({ take: String(take), sucursalId });
  url = `${BASE_URL}/api/ordenes?${q.toString()}`;
  r = await fetch(url);
  if (!r.ok) throw new Error("No se pudo leer /api/ordenes");
  return r.json();
}

async function fetchOrdenDetalle(id: string): Promise<OrdenFull> {
  const r = await fetch(`${BASE_URL}/api/ordenes/${id}`);
  if (!r.ok) throw new Error(`No se pudo leer /api/ordenes/${id}`);
  return r.json();
}

async function terminarOrden(id: string): Promise<{ ok: boolean; id: string; estadoTerminado: boolean }> {
  const url = `${BASE_URL}/api/ordenes/${id}/terminar`;
  const r = await fetch(url, { method: "PATCH" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as any)?.error || `PATCH falló`);
  return data as any;
}

// ============================ COMPONENT ==============================
export default function Pedidos_Sucursal() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const sidFromUser = useSelector((s: RootState) => s.user.sucursalId);
  const sucursalId = String(qp ?? sidFromUser ?? "");
  const router = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pedidos, setPedidos] = useState<OrdenFull[]>([]);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [heladeriaNombre, setHeladeriaNombre] = useState("Mi Heladería");

  useEffect(() => {
    if (!sucursalId) {
      Alert.alert("Error", "Falta sucursalId en la ruta.");
      return;
    }
    fetchSucursal(sucursalId)
      .then((s) => setHeladeriaNombre(s.nombre))
      .catch(() => setHeladeriaNombre("Heladería"));
  }, [sucursalId]);

  const cargar = useCallback(async (sutil = false) => {
    if (!sucursalId) return;
    if (!sutil) setLoading(true);
    try {
      const lites = await fetchOrdenesRobusto(50, sucursalId);
      const detalleMap = new Map<string, OrdenFull>();
      await Promise.all(
        lites.map(async (o) => {
          try {
            const det = await fetchOrdenDetalle(o.id);
            detalleMap.set(o.id, det);
          } catch {}
        })
      );
      const merged = lites.map((o) => detalleMap.get(o.id) ?? { ...o, contenidos: [] });
      merged.sort((a, b) => (b.fecha && a.fecha ? new Date(b.fecha).getTime() - new Date(a.fecha).getTime() : 0));
      setPedidos(merged);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudieron cargar los pedidos");
    } finally {
      if (!sutil) setLoading(false);
    }
  }, [sucursalId]);

  // useEffect(() => {
  //   cargar();
  //   const interval = setInterval(() => cargar(true), 5000);
  //   return () => clearInterval(interval);
  // }, [cargar]);

  useEffect(() => {
    cargar();
    const interval = setInterval(() => cargar(true), 5000);
    return () => clearInterval(interval);
  }, [cargar]);


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargar(true);
    setRefreshing(false);
  }, [cargar]);

  const confirmarTerminar = async (pedido: OrdenFull) => {
    if (pedido.estadoTerminado || busy[pedido.id]) return;
    const ok = await confirmAsync("Marcar como terminado", `¿Confirmás que el Pedido #${pedido.id} fue entregado?`);
    if (!ok) return;
    setBusy((b) => ({ ...b, [pedido.id]: true }));
    setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? { ...p, estadoTerminado: true } : p)));

    try {
      await terminarOrden(pedido.id);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo marcar como terminado");
      setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? { ...p, estadoTerminado: false } : p)));
    } finally {
      setBusy((b) => ({ ...b, [pedido.id]: false }));
    }
  };

  const toggleExpand = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const handleLogout = () => {
    dispatch({ type: LOG_OUT });
    router.replace("/");
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{heladeriaNombre}</Text>
        <Text style={styles.headerSubtitle}>Pedidos</Text>
      </View>

      {pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay pedidos por ahora.</Text>
          <Text style={styles.emptySubtext}>(Sucursal: {sucursalId})</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(p) => p.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1e90ff"]} />}
          renderItem={({ item }) => {
            const fecha = item.fecha ? new Date(item.fecha).toLocaleString() : "—";
            const isPendiente = !item.estadoTerminado;
            return (
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.8}
                style={[styles.card, busy[item.id] && { opacity: 0.8 }]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Pedido #{item.id.replace(/\D/g, "") || item.id}</Text>
                  <Text style={[styles.cardStatus, { color: isPendiente ? "#e67e22" : "#2e7d32" }]}>
                    {isPendiente ? "Pendiente" : "Terminado"}
                  </Text>
                </View>

                {expanded[item.id] && (
                  <>
                    <Text style={styles.cardDate}>{fecha}</Text>
                    {item.contenidos?.length ? (
                      item.contenidos.map((c) => (
                        <View key={c.id} style={styles.contenidoBox}>
                          <Text style={styles.envaseText}>
                            {c.envase?.tipoEnvase?.replaceAll("_", " ") ?? "Envase"}
                          </Text>
                          <Text style={styles.saborText}>Sabor: {c.sabor?.tipoSabor ?? "—"}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noContenido}>Sin contenidos.</Text>
                    )}
                    {isPendiente && (
                      <TouchableOpacity
                        onPress={() => confirmarTerminar(item)}
                        disabled={!!busy[item.id]}
                        style={[
                          styles.buttonTerminar,
                          busy[item.id] && { backgroundColor: "#9ec9ff" },
                        ]}
                      >
                        <Text style={styles.buttonText}>
                          {busy[item.id] ? "Terminando..." : "Marcar como terminado"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push({ pathname: "/screens/proveedor/Vendedor_Envases", params: { sucursalId } })}
          style={[styles.actionButton, styles.blueButton]}
        >
          <Text style={styles.buttonText}>Editar envases</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push({ pathname: "/screens/proveedor/Vendedor_Productos", params: { sucursalId } })}
          style={[styles.actionButton, styles.darkButton]}
        >
          <Text style={styles.buttonText}>Editar gustos</Text>
        </Pressable>

        <Pressable onPress={handleLogout} style={[styles.actionButton, styles.redButton]}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ============================ STYLES ==============================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 8, fontSize: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  headerSubtitle: { fontSize: 22, fontWeight: "700" },

  emptyContainer: { paddingVertical: 24, alignItems: "center" },
  emptyText: { opacity: 0.6 },
  emptySubtext: { opacity: 0.6, marginTop: 4, fontSize: 12 },

  card: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontWeight: "800" },
  cardStatus: { fontWeight: "700" },
  cardDate: { opacity: 0.7, marginBottom: 8 },
  contenidoBox: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#f9fbff",
    marginBottom: 6,
  },
  envaseText: { fontWeight: "700" },
  saborText: { opacity: 0.75, fontSize: 12 },
  noContenido: { opacity: 0.6 },

  buttonTerminar: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#1e90ff",
  },
  buttonText: { color: "#fff", fontWeight: "700" },

  actions: { gap: 10, marginTop: 8 },
  actionButton: { padding: 14, borderRadius: 14, alignItems: "center" },
  blueButton: { backgroundColor: "#1e90ff" },
  darkButton: { backgroundColor: "#222" },
  redButton: { backgroundColor: "#d32f2f" },
});
