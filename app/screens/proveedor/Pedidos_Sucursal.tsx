import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BASE_URL } from "./../../services/apiConfig";

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Sabor  = { id: string; tipoSabor: string };
type Contenido = { id: number; envase: Envase | null; sabor: Sabor | null };
type OrdenLite = {
  id: string;
  fecha?: string | null;
  estadoTerminado: boolean;
  sucursalId: string;
  usuarioId: string;
};
type OrdenFull = OrdenLite & { contenidos: Contenido[] };

/** Helper de confirm cross-platform */
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

/** === API helpers === */
async function fetchOrdenes(take = 50): Promise<OrdenLite[]> {
  const url = `${BASE_URL}/api/ordenes?take=${take}`;
  console.log("[fetchOrdenes] GET =>", url);
  const r = await fetch(url);
  console.log("[fetchOrdenes] status:", r.status);
  if (!r.ok) throw new Error("No se pudo leer /api/ordenes");
  const data = await r.json();
  console.log("[fetchOrdenes] items:", Array.isArray(data) ? data.length : data);
  return data;
}

async function fetchOrdenDetalle(id: string): Promise<OrdenFull> {
  const url = `${BASE_URL}/api/ordenes/${id}`;
  console.log("[fetchOrdenDetalle] GET =>", url);
  const r = await fetch(url);
  console.log("[fetchOrdenDetalle] status:", r.status);
  if (!r.ok) throw new Error(`No se pudo leer /api/ordenes/${id}`);
  const data = await r.json();
  return data;
}

async function terminarOrden(
  id: string
): Promise<{ ok: boolean; id: string; estadoTerminado: boolean }> {
  const url = `${BASE_URL}/api/ordenes/${id}/terminar`;
  console.log("[terminarOrden] PATCH =>", url);
  const r = await fetch(url, { method: "PATCH" });
  console.log("[terminarOrden] status:", r.status);
  const data = await r.json().catch(() => ({}));
  console.log("[terminarOrden] body:", data);
  if (!r.ok) throw new Error((data as any)?.error || `PATCH /api/ordenes/${id}/terminar falló (${r.status})`);
  return data as any;
}

export default function Pedidos_Sucursal() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const router = useRouter();
  const sucursalId = String(qp || "S1234");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pedidos, setPedidos] = useState<OrdenFull[]>([]);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchOrdenes(50);
      const mias = all.filter((o) => o.sucursalId === sucursalId);
      const detalles = await Promise.all(
        mias.map((o) => fetchOrdenDetalle(o.id).catch(() => null))
      );
      const list = (detalles.filter(Boolean) as OrdenFull[]).sort((a, b) => {
        const ta = a.fecha ? new Date(a.fecha).getTime() : 0;
        const tb = b.fecha ? new Date(b.fecha).getTime() : 0;
        return tb - ta || b.id.localeCompare(a.id);
      });
      setPedidos(list);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudieron cargar los pedidos");
      console.log("[Pedidos] cargar error:", e);
    } finally {
      setLoading(false);
    }
  }, [sucursalId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await cargar();
    } finally {
      setRefreshing(false);
    }
  }, [cargar]);

  const irAEditarEnvases = () =>
    router.push({ pathname: "/screens/proveedor/Vendedor_Envases", params: { sucursalId } });

  const irAEditarGustos = () =>
    router.push({ pathname: "/screens/proveedor/Vendedor_Productos", params: { sucursalId } });

  const confirmarTerminar = async (pedido: OrdenFull) => {
    if (pedido.estadoTerminado || busy[pedido.id]) return;

    const ok = await confirmAsync(
      "Marcar como terminado",
      `¿Confirmás que el Pedido #${pedido.id} fue entregado?`
    );
    if (!ok) return;

    setBusy((b) => ({ ...b, [pedido.id]: true }));

    // Update optimista
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, estadoTerminado: true } : p))
    );

    try {
      console.log("[UI] Disparando terminarOrden para", pedido.id);
      await terminarOrden(pedido.id);
      // opcional: await cargar();
    } catch (e: any) {
      console.log("[Pedidos] terminar error:", e?.message || e);
      Alert.alert("Error", e?.message ?? "No se pudo marcar como terminado");
      // rollback
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedido.id ? { ...p, estadoTerminado: false } : p))
      );
    } finally {
      setBusy((b) => ({ ...b, [pedido.id]: false }));
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={{ marginTop: 8, fontSize: 16 }}>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
        Pedidos — Sucursal {sucursalId}
      </Text>

      {pedidos.length === 0 ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <Text style={{ opacity: 0.6 }}>No hay pedidos por ahora.</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(p) => p.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const fecha = item.fecha ? new Date(item.fecha).toLocaleString() : "—";
            const isPendiente = !item.estadoTerminado;

            return (
              <View
                style={{
                  padding: 12,
                  marginBottom: 10,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: "#ddd",
                  backgroundColor: "#fff",
                  opacity: busy[item.id] ? 0.85 : 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ fontWeight: "800" }}>Pedido #{item.id}</Text>
                  <Text
                    style={{
                      fontWeight: "700",
                      color: isPendiente ? "#e67e22" : "#2e7d32",
                    }}
                  >
                    {isPendiente ? "Pendiente" : "Terminado"}
                  </Text>
                </View>

                <Text style={{ opacity: 0.7, marginBottom: 8 }}>{fecha}</Text>

                {item.contenidos?.length ? (
                  item.contenidos.map((c) => (
                    <View
                      key={c.id}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#e6e6e6",
                        backgroundColor: "#f9fbff",
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>
                        {c.envase?.tipoEnvase?.replaceAll("_", " ") ?? "Envase"}
                      </Text>
                      <Text style={{ opacity: 0.75, fontSize: 12 }}>
                        Sabor: {c.sabor?.tipoSabor ?? "—"}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ opacity: 0.6 }}>Sin contenidos.</Text>
                )}

                {isPendiente && (
                  <TouchableOpacity
                    onPress={() => confirmarTerminar(item)}
                    disabled={!!busy[item.id]}
                    style={{
                      marginTop: 8,
                      paddingVertical: 10,
                      borderRadius: 10,
                      alignItems: "center",
                      backgroundColor: busy[item.id] ? "#9ec9ff" : "#1e90ff",
                      ...(Platform.OS === "web"
                        ? ({ cursor: busy[item.id] ? "default" : "pointer" } as any)
                        : null),
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      {busy[item.id] ? "Terminando..." : "Marcar como terminado"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Botonera inferior */}
      <View style={{ gap: 10, marginTop: 8 }}>
        <Pressable
          onPress={irAEditarEnvases}
          style={{ padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: "#1e90ff" }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Editar envases</Text>
        </Pressable>

        <Pressable
          onPress={irAEditarGustos}
          style={{ padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: "#222" }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Editar gustos
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
