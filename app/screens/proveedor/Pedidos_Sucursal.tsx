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

async function fetchOrdenes(take = 50): Promise<OrdenLite[]> {
  const url = `${BASE_URL}/api/ordenes?take=${take}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("No se pudo leer /api/ordenes");
  return r.json();
}

async function fetchOrdenDetalle(id: string): Promise<OrdenFull> {
  const url = `${BASE_URL}/api/ordenes/${id}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`No se pudo leer /api/ordenes/${id}`);
  return r.json();
}

async function terminarOrden(
  id: string
): Promise<{ ok: boolean; id: string; estadoTerminado: boolean }> {
  const url = `${BASE_URL}/api/ordenes/${id}/terminar`;
  const r = await fetch(url, { method: "PATCH" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as any)?.error || `PATCH /api/ordenes/${id}/terminar falló`);
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const cargar = useCallback(async (sutil = false) => {
    if (!sutil) setLoading(true);
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
    } finally {
      if (!sutil) setLoading(false);
    }
  }, [sucursalId]);

  // Carga inicial y autorefresh sutil cada 5 segundos
  useEffect(() => {
    cargar();
    const interval = setInterval(() => {
      cargar(true).catch(() => { });
    }, 5000);
    return () => clearInterval(interval);
  }, [cargar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await cargar(true);
    } finally {
      setRefreshing(false);
    }
  }, [cargar]);

  const confirmarTerminar = async (pedido: OrdenFull) => {
    if (pedido.estadoTerminado || busy[pedido.id]) return;
    const ok = await confirmAsync(
      "Marcar como terminado",
      `¿Confirmás que el Pedido #${pedido.id} fue entregado?`
    );
    if (!ok) return;

    setBusy((b) => ({ ...b, [pedido.id]: true }));
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, estadoTerminado: true } : p))
    );

    try {
      await terminarOrden(pedido.id);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo marcar como terminado");
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedido.id ? { ...p, estadoTerminado: false } : p))
      );
    } finally {
      setBusy((b) => ({ ...b, [pedido.id]: false }));
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
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
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "900" }}>Pedidos</Text>
      </View>

      {pedidos.length === 0 ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <Text style={{ opacity: 0.6 }}>No hay pedidos por ahora.</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(p) => p.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1e90ff"]}
              tintColor="#1e90ff"
            />
          }
          renderItem={({ item }) => {
            const fecha = item.fecha ? new Date(item.fecha).toLocaleString() : "—";
            const isPendiente = !item.estadoTerminado;

            return (
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.8}
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
                    alignItems: "center",
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

                {expanded[item.id] && (
                  <>
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
                  </>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={{ gap: 10, marginTop: 8 }}>
        <Pressable
          onPress={() =>
            router.push({ pathname: "/screens/proveedor/Vendedor_Envases", params: { sucursalId } })
          }
          style={{ padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: "#1e90ff" }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Editar envases</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({ pathname: "/screens/proveedor/Vendedor_Productos", params: { sucursalId } })
          }
          style={{ padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: "#222" }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Editar gustos</Text>
        </Pressable>
      </View>
    </View>
  );
}
